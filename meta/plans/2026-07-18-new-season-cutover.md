# Cut over to the new FPL season

**This is a runbook, prepared ahead of time. Nothing in here is executed
until the user explicitly says to run it** (i.e. when the new FPL season's
fixtures/players are actually published by FPL, typically shortly before
gameweek 1 opens). When triggered, the steps below should be run in order,
each one confirmed before moving to the next.

**Cutover completed 2026-07-23:** the 2027 season is populated and local,
Vercel, and Railway `FPL_SEASON_ID` values now point to
`b3f23577-24ce-44e7-b30d-afe8ab6761a2`.

## Quick reference (fill in `<new-id>` once step 1 runs)

```
Old FPL_SEASON_ID: 73065daa-0457-4101-90ef-f469289a88ff  (year 2026)
New FPL_SEASON_ID: b3f23577-24ce-44e7-b30d-afe8ab6761a2 (year 2027)

Railway project:      d6db9925-aa14-4a1a-b079-790cec96f0bf
Railway environment:  37492dc8-a29d-44df-a792-464e8d184ef1 (production)
  Picks Cron:               62d3e08f-2764-4fa0-bf03-63854fbbda1b
  Elements + Fixtures Cron: becbfef4-0780-426f-b808-9474bb6e3e26
  Bootstrap Cron:           f51ff7a1-0912-4c02-95c7-213157503176

Vercel team:    team_8iaLfM9mGMF52A2wvUM1B2hr (rkaahean's projects)
Vercel project: prj_xWulfJSJYdfwpIsZA2BRKMxE7meW (fpldrafts)
```

## Context

A new FPL season is about to launch. The entire app — web app on Vercel and
all three Railway cron services (Bootstrap, Elements+Fixtures, Picks) — is
scoped to a single season via one env var, `FPL_SEASON_ID`, which points at a
row in the `FPLSeason` table. Every sync script, the auth JWT callback, and
every API route read `process.env.FPL_SEASON_ID` directly (confirmed via
grep across `app/api/**`, `auth/main.ts`, `scripts/**`,
`components/transfers/*`, `components/fixtures/*`).

Current state: exactly one `FPLSeason` row exists —
`{ id: "73065daa-0457-4101-90ef-f469289a88ff", year: 2026 }`. The new season
row will use `year: 2027`.

`FPLTeam` rows (a user's linked team) are scoped per-season via
`fpl_season_id`. Confirmed decision: no data carry-over — once
`FPL_SEASON_ID` points at the new season, existing users' old `FPLTeam` rows
simply won't match anymore (`auth/main.ts`'s JWT lookup filters by
`user_id` + `fpl_season_id`), so they'll show as unlinked and re-link via
`/link` for the new season. This is expected, not a bug to work around.

Deployment surfaces that read `FPL_SEASON_ID` and need updating:
- Vercel project `fpldrafts` (id `prj_xWulfJSJYdfwpIsZA2BRKMxE7meW`, team
  `rkaahean's projects` / `team_8iaLfM9mGMF52A2wvUM1B2hr`) — the web app.
- Railway project "FPL Drafts" (id `d6db9925-aa14-4a1a-b079-790cec96f0bf`),
  environment `production` (id `37492dc8-a29d-44df-a792-464e8d184ef1`),
  three services: Picks Cron (`62d3e08f-2764-4fa0-bf03-63854fbbda1b`),
  Elements + Fixtures Cron (`becbfef4-0780-426f-b808-9474bb6e3e26`), Bootstrap
  Cron (`f51ff7a1-0912-4c02-95c7-213157503176`) — same three services whose
  `DATABASE_URL`/`DIRECT_URL` were already fixed earlier this session.
- Local `.env` (now `FPL_SEASON_ID=b3f23577-24ce-44e7-b30d-afe8ab6761a2`), for
  local dev/testing to stay consistent with production.

Ordering matters: the new `FPLSeason` row and its player/team data must exist
*before* any surface starts reading with the new `FPL_SEASON_ID`, otherwise
requests against the new season ID will find no players/teams and error or
render empty.

## Approach

### 0. Trigger condition

Do not run this until FPL has actually published the new season's
bootstrap-static data (new players, teams, `now_cost` values reset) —
running `bootstrap`/`fixtures` against the new season id before FPL
publishes it will just produce empty or stale data. In practice: wait until
`https://fantasy.premierleague.com/api/bootstrap-static/` reflects the new
season (new `events` array for the new season's 38 gameweeks) before
starting step 1.

### 1. Create the new `FPLSeason` row

One-off script (or a direct `prisma.$queryRaw`/`create` call via a temp
`scripts/_create_season.ts`, deleted after use — matching how prior temp
checks were done this session) to insert:

```ts
await prisma.fPLSeason.create({ data: { year: 2027 } });
```

Capture the generated `id` — this is the new `FPL_SEASON_ID` value used in
every step below.

### 2. Populate the new season's players, teams, and fixtures

With `FPL_SEASON_ID` set to the **new** season id (as a one-off local env
override, not yet the deployed value anywhere), run in order:

```
FPL_SEASON_ID=<new-id> npm run bootstrap   # players + teams for the new season
FPL_SEASON_ID=<new-id> npm run fixtures    # fixture list for the new season
```

`elements` (gameweek player stats) is intentionally skipped at this point —
there's no gameweek history yet for a season that hasn't started, so it has
nothing to fetch. It becomes relevant once gameweek 1 completes, at which
point the normal Railway cron schedule picks it up automatically (once
Railway's env var is updated in step 3).

Verify: query `FPLPlayer`/`FPLPlayerTeam`/`FPLFixtures` filtered by the new
`season_id` and confirm non-zero rows before proceeding — do not cut over
traffic to a season with no data.

### 3. Update `FPL_SEASON_ID` on every deployment surface

- **Railway**: `mcp__railway__set_variables` on all three services
  (Bootstrap Cron, Elements + Fixtures Cron, Picks Cron), same pattern used
  earlier this session to fix `DATABASE_URL`/`DIRECT_URL` — pass
  `skip_deploys: true` since these are cron-triggered, not always-on;
  they'll pick up the new value on their next scheduled run.
- **Vercel**: update the `FPL_SEASON_ID` environment variable on the
  `fpldrafts` project (production environment) via the Vercel MCP tools or
  dashboard, then trigger/allow a redeploy so the running instance picks up
  the new value (Vercel env var changes require a redeploy to take effect
  for already-built instances).
- **Local `.env`**: update `FPL_SEASON_ID` to the new id, so local dev
  matches production going forward.

### 4. Post-cutover verification

- Hit the deployed site, confirm gameweek/player data loads (empty squad
  state is expected pre-link, per the earlier confirmed decision).
- Confirm `/link` successfully creates a new `FPLTeam` row scoped to the new
  `fpl_season_id` for a test account.
- Confirm the next scheduled Railway cron runs (Bootstrap/Elements+Fixtures/
  Picks) execute against the new season id without error — check
  `mcp__railway__get_logs` on their next run.
- Leave the old `FPLSeason` row and its data in place (no deletion) — it's
  harmless historical data and nothing references it once `FPL_SEASON_ID`
  moves on.

## Verification

- New `FPLSeason` row exists with `year: 2027` and a fresh `id`.
- `FPLPlayer`, `FPLPlayerTeam`, `FPLFixtures` all have rows for the new
  `season_id` before any surface is repointed.
- `FPL_SEASON_ID` matches the new season id on: Railway (all 3 services),
  Vercel (production), local `.env`.
- Vercel production redeployed after the env var change.
- A fresh `/link` on the live site creates an `FPLTeam` scoped to the new
  season.
- Railway cron services succeed (no errors in `get_logs`) on their first run
  after the cutover.
