# Gameweek loading performance work

## Outcome

The `/api/gameweek` endpoint was reduced from roughly 1.2–1.6 seconds to
about 200 ms locally for a warm request. The final request performs one
database call after authentication.

Latest measured request:

```text
auth:                    9.1 ms
combined gameweek query: 191.0 ms
response construction:   0.1 ms
total API work:          201.9 ms
browser request:         213 ms
```

`EXPLAIN ANALYZE` on Supabase shows the combined SQL executes in about 2 ms
inside Postgres. The remaining ~190 ms is connection-pooler/network/Prisma
round-trip time, not query execution time.

## Database changes

Added and deployed the migration:

`prisma/migrations/20260718120000_gameweek_load_indexes/migration.sql`

It adds these indexes:

- `FPLGameweekPlayerStats(fpl_player_id, gameweek)`
- `FPLGameweekTransfers(fpl_team_id, gameweek)`
- `FPLGameweekTransfers(fpl_team_id, in_player_id)`

The matching Prisma schema indexes were added to `prisma/schema.prisma`.

The migration was deployed with:

```sh
bunx prisma migrate deploy
```

and confirmed with:

```sh
bunx prisma migrate status
```

## API/query changes

### Removed query fan-out

The original gameweek read used several Prisma relation queries and separate
queries for:

- squad picks and players
- player-team names and fixtures
- gameweek stats
- overall stats
- transfer count
- transfer prices
- current prices

This was initially reduced by batching and running independent calls in
parallel. It was then replaced with a single parameterized raw SQL request in
`app/api/index.ts`.

The final query returns, in one response:

- 15 picks with player and team data
- gameweek player stats
- fixtures only for teams represented in the picks
- overall gameweek stats
- recent transfer count
- transfer history for picked players
- current values for picked players

Postgres returns the grouped result as JSON arrays. The application converts
transfer timestamps back to `Date` objects before pricing is calculated.

### Kept SQL parameterized

Raw SQL uses Prisma tagged-template binding (`prisma.$queryRaw`), rather than
string interpolation, so request values remain parameterized.

### Scoped transfer counting

The transfer count now filters by the current FPL team and gameweek range. The
previous data path could load far more transfer data than required.

### Pricing assembly

Added `applySellingPrices` in `lib/fpl/pricing.ts`. It applies each player's
latest transfer-in cost and current gameweek value after the single SQL result
is returned.

### Pure result assembly

Added pure helpers in `lib/fpl/gameweek.ts` to:

- group fixture rows per relevant team
- assemble gameweek picks
- assemble the combined base payload

This keeps SQL transport data separate from response-shape logic and makes the
mapping testable without a database.

## Authentication changes

The gameweek route originally performed an Auth.js session lookup and an
additional FPL team lookup on each request. The session now stores the verified
`team_id` in the JWT:

- `auth/token.ts` persists sign-in token data and the verified team id.
- `auth/session.ts` supplies small helpers for exposing/verifying `team_id`.
- `auth/main.ts` verifies team ownership when the session is updated, stores it
  in the token, and avoids repeat team lookups on ordinary requests.
- `app/link/client.tsx` updates the Auth.js session with the new team id after
  linking a team.
- `types/next-auth.d.ts` declares `team_id` on the JWT and session types.

The route still calls `auth()` and still requires an Authorization header. The
signed Auth.js session is the trusted identity source; decoding a bearer token
alone would not verify its signature.

## Request instrumentation and cancellation

`app/api/gameweek/route.ts` now:

- records request-scoped timing labels, preventing timing-label collisions when
  multiple requests overlap;
- logs those timings locally;
- returns them through the `Server-Timing` response header;
- reports auth, combined-query, response-construction, and total timings.

The React Query fetch path passes its cancellation signal to the gameweek API.
`app/api/utils.ts` forwards that signal to `fetch`, so an obsolete gameweek
request can be aborted when navigation changes quickly.

## Client behaviour investigated

The UI is client-driven for gameweek changes: `components/pitch/Gameweek.tsx`
requests `/api/gameweek` through React Query. It is not currently a server
component data load.

The observed “go forward, then back, and it loads again” behaviour is separate
from SQL execution. The query fetch/cancellation instrumentation was added to
make cache versus refetch behaviour visible in browser development logs.

## Supabase investigation

The active project is in `eu-west-2`. `EXPLAIN (ANALYZE, BUFFERS)` was run for
the original individual query shapes and the consolidated query.

Representative Postgres execution times before consolidation:

| Query | Database execution |
| --- | ---: |
| Picks + player data | 0.503 ms |
| Fixtures | 1.095 ms |
| Overall stats | 0.136 ms |
| Transfer count | 0.194 ms |
| Transfer prices | 0.264 ms |
| Current prices | 0.223 ms |

The consolidated query executes in approximately 2 ms and uses the intended
indexes. The fixture table is currently small (about 380 rows); its sequential
scan is sub-millisecond and is not a practical bottleneck.

The local runtime URL is already configured for Supabase shared transaction
pooling:

```text
aws-1-eu-west-2.pooler.supabase.com:6543?pgbouncer=true
```

That is the appropriate Supabase/Prisma setting for transaction pooling. The
project is on Supabase Free, so the paid dedicated PgBouncer pooler is not
available. A direct IPv6 endpoint could not be resolved from this development
environment, so direct-vs-pooled latency has not been benchmarked.

## Tests and verification

New/updated tests cover:

- JWT team-id persistence and ownership validation
- fixture grouping and combined gameweek payload assembly
- latest transfer cost selection
- selling-price application to gameweek picks

Tests were written to fail before their corresponding implementation changes.

Latest verification:

```text
vitest:        83 passing tests
TypeScript:    bunx tsc --noEmit passed
Formatting:    git diff --check passed
```

## Follow-ups (parked)

- Client cache/refetch behaviour can be investigated separately if navigating
  back to an already-loaded gameweek still causes a network request.
- The pitch image was identified by Next.js as the LCP image. Mark it
  `loading="eager"`/priority if it is above the fold; this is unrelated to the
  gameweek API latency.
- Supabase reported that public tables do not have RLS enabled. No policy was
  changed during this performance work. Review and add appropriate RLS policies
  before exposing database access beyond trusted server code.
