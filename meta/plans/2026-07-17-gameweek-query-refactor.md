# Gameweek Query Refactor + Component Testability (MSW)

## Context

The `Gameweek` component's second `useQuery` (`components/pitch/Gameweek.tsx:74-135`) does far
too much inside one `queryFn`: it `JSON.parse`s the fetched payload, selects a base squad,
filters drafts to the current gameweek, sums in-flight transfer-out proceeds, folds
`swapPlayers` over every draft change, computes two *different* bank values, and performs
**four Zustand store writes as side effects** (`setBase`, `setCommittedBank`, `setPicks`×2) —
then mutates the returned object's bank in place. None of this is testable today: the
transformation is welded to React Query + the store, and the repo has **no** DOM/component
test infra (node-env Vitest only; no jsdom, RTL, or MSW).

This refactor does two things:
1. **Extract the pure transformation** into `lib/fpl/` so the squad/bank math is unit-tested
   with plain data (no network, no store) — mirroring the existing `lib/fpl/*` pattern.
2. **Add an MSW + happy-dom harness** and one component test that renders `<Gameweek>`,
   mocks `GET /api/gameweek`, and asserts the fetch→transform→store wiring end-to-end.

Behavior must be preserved exactly: `picks.overall.bank` (which includes
`remainingTransferOutSum`) is persisted to the server as a draft's `bank`
(`components/drafts/table/save.tsx:103`, `components/drafts/update.tsx`), so its value
semantics are load-bearing beyond the UI.

### Decisions (confirmed with user)
- Scope: **pure extraction + MSW component test** (both).
- DOM env: **happy-dom**, opted-in **per-file** via `// @vitest-environment happy-dom` — the
  existing node-env pure tests stay untouched and fast.
- **Keep the double-JSON-encoding** as-is (route stays `Response.json(JSON.stringify(...))`;
  component keeps `JSON.parse`). Fixing it is a separate ticket (existing PLAN Risk #1). The
  MSW handler therefore returns a **double-encoded** body to match reality.
- New domain logic remains **pure functions** in cohesive modules (consistent with existing
  `lib/fpl/`), not classes.

---

## Part A — Extract the pure transformation ✅ DONE

### New: `lib/fpl/gameweek.ts`
A single pure function capturing everything in the queryFn *except* the store writes:

```ts
resolveGameweekPicks(input: {
  parsed: FPLGameweekPicksData;            // JSON.parse(gameweekData) result
  dbbase: FPLGameweekPicksData | undefined;// store.base fallback for future GWs
  draftChanges: DraftTransfer[];           // drafts.changes
  currentGameweek: number;
  transfersOut: { [key: number]: PlayerData[] };
}): {
  base: FPLGameweekPicksData | undefined;  // the selected base (for setBase)
  setBase: boolean;                        // whether the caller should call setBase(base)
  picks: FPLGameweekPicksData | undefined; // bank INCLUDES remainingTransferOutSum
  committedBank: number | undefined;       // post-swap bank, EXCLUDES remainingTransferOutSum
  result: FPLGameweekPicksData | undefined;// the value the queryFn returns as `data`
} | undefined
```

Logic, ported verbatim from `Gameweek.tsx:80-133` (line refs are the source of truth):
- Base selection (82-90): if `parsed.data.length > 0` → `base = parsed`, `setBase = true`;
  else `base = dbbase`, `setBase = false`.
- `gameweekDraft` filter (92-94): `draftChanges.filter(d => d.gameweek <= currentGameweek)`.
- If `base?.data?.length > 0`:
  - `remainingTransferOutSum` = nested reduce over `Object.values(transfersOut)` summing
    `item.selling_price || 0` (100-110).
  - Fold `swapPlayers` over `gameweekDraft` (112-115) — reuse `lib/fpl/swap.ts` (already pure).
  - `committedBank = draftData.overall.bank` (the pre-sum value; source line 117).
  - `picks` = `{ data, overall: { ...overall, bank: bank + remainingTransferOutSum } }` (119-125).
  - `result` = the same object with `bank` = `bank + remainingTransferOutSum` (127-129) — build
    it **immutably** (no in-place mutation; that's the one intentional behavior *cleanup*, and
    it produces an identical value).
- Else if `parsed.data.length > 0`: `picks = result = parsed`, `committedBank = undefined`,
  `setBase = false` (130-133).
- `swapPlayers` stays `async`, so `resolveGameweekPicks` is `async` (returns a Promise).

**Reuses:** `lib/fpl/swap.ts` (`swapPlayers`), types from `lib/fpl/types.ts`.

### New: `lib/fpl/gameweek.test.ts` (node env — no DOM)
Plain-data unit tests, using the same `as unknown as` fixture style as
`lib/fpl/squad.test.ts`:
- base selection: non-empty `parsed` → `base=parsed`, `setBase=true`; empty `parsed` +
  `dbbase` present → `base=dbbase`, `setBase=false`.
- draft window: only `gameweek <= currentGameweek` changes are folded.
- `remainingTransferOutSum`: `picks.bank` includes it; `committedBank` does **not** (asserts the
  two values differ when transfersOut is non-empty) — the load-bearing distinction.
- swap fold: a transfer draft moves `committedBank` by `out.price - in.price` per change.
- immutability: the input `parsed`/`dbbase` objects are not mutated.
- empty-everything: returns `undefined` (matches the queryFn falling through with no return).

### Rewire `components/pitch/Gameweek.tsx`
Replace the body of the second `queryFn` (80-133) with:
```ts
const parsed: FPLGameweekPicksData = JSON.parse(gameweekData);
const r = await resolveGameweekPicks({
  parsed, dbbase, draftChanges: drafts.changes, currentGameweek, transfersOut: transfers,
});
if (!r) return undefined;
if (r.setBase && r.base) setBase(r.base);
if (r.committedBank !== undefined) setCommittedBank(r.committedBank);
if (r.picks) setPicks(r.picks);
return r.result;
```
Store writes stay in the queryFn (unchanged timing/blast radius — deliberately NOT moved to a
`useEffect`, to keep this behavior-preserving). `JSON.parse` stays (double-encoding kept).

**Do NOT touch** `addToBank`/`removeFromBank` (`Player.tsx` → `store/index.ts:62-85`) — the
second, independent writer of `picks.overall.bank`. Out of scope.

---

## Part B — MSW + happy-dom component test harness ✅ DONE

> Implementation note: the full pitch DOM (`Player.tsx`) reads deep fixture fields
> (`firstFixture.name`) that require a heavy per-player fixture unrelated to the query
> refactor. The component test therefore **mocks `./PitchRow`** to a stub, isolating the
> assertion to the fetch→`resolveGameweekPicks`→store→render wiring (the actual concern).
> The store-population test asserts the end-to-end MSW→store path directly.
> `gameweek.ts:83` (the `else if` raw-data return) is unreachable through realistic inputs
> (base always equals `parsed` when `parsed.data.length > 0`) — kept for behavior-exactness;
> hence 95% line coverage on that file.

### Dev deps (via `bun add -D`)
`msw`, `happy-dom`, `@testing-library/react` (v16, React 19), `@testing-library/jest-dom`,
`@testing-library/user-event`.

### `vitest.config.ts`
- `include`: add `"**/*.test.tsx"` (currently `.ts` only).
- Add `setupFiles: ["./vitest.setup.ts"]`.
- Keep `environment: "node"` as the default; the component test opts into happy-dom per-file.
- Coverage `include` stays `["lib/fpl/**"]` (component test is wiring, not a coverage target) —
  add `lib/fpl/gameweek.ts`, which is already under that glob.

### New: `vitest.setup.ts`
- `import "@testing-library/jest-dom/vitest"`.
- Start/stop the MSW server: `beforeAll(server.listen)`, `afterEach(server.resetHandlers)`,
  `afterAll(server.close)`.
- `vi.mock("posthog-js")` — `app/provider/index.tsx:24` calls `posthog.init` at import when
  `window` exists (true under happy-dom) with a `!`-asserted key; stub it out.
- `vi.mock("next-auth/react")` → `useSession` returns `{ data: { accessToken: "test-token" } }`
  so the first query's `enabled: !!session?.accessToken` fires.
- MSW needs an absolute origin for the relative `/api/gameweek` fetch — set
  `globalThis.location`/base URL (happy-dom provides `http://localhost`), or configure the
  handler with a relative path (`http.get("/api/gameweek", ...)`, which MSW node supports when
  an origin is present).

### New: `test/msw/handlers.ts` + `test/msw/server.ts`
- `server.ts`: `setupServer(...handlers)` from `msw/node`.
- `handlers.ts`: `http.get("/api/gameweek", () => HttpResponse.json(JSON.stringify(payload)))`
  — body is **double-encoded** to match `route.ts` (`Response.json(JSON.stringify(...))`) and the
  component's `response.json()` → `JSON.parse(...)` chain. `payload` is a minimal valid
  `FPLGameweekPicksData` (a small squad + `overall` + `transfers: []`).

### New: `components/pitch/gameweek.component.test.tsx`
```
// @vitest-environment happy-dom
```
- Render `<Gameweek gameweek={2} />` inside a fresh `QueryClient` (retries off, gcTime 0) —
  note `Gameweek` already nests its own `ReactQueryProvider` (singleton) at its return
  (`Gameweek.tsx:155`); wrap in a `SessionProvider` or rely on the mocked `useSession`.
- Assert: the loading spinner shows, then after the MSW response resolves the pitch renders
  (e.g. a `GameweekStat` value appears), proving fetch → `resolveGameweekPicks` → store → render.
- Assert the store was populated (import `picksStore`, check `getState().picks` is set) —
  verifies the queryFn's wiring wrote the derived squad.

---

## Critical files
- **New**: `lib/fpl/gameweek.ts`, `lib/fpl/gameweek.test.ts`, `vitest.setup.ts`,
  `test/msw/{server,handlers}.ts`, `components/pitch/gameweek.component.test.tsx`.
- **Modified**: `components/pitch/Gameweek.tsx` (queryFn body only), `vitest.config.ts`,
  `package.json` (dev deps).
- **Read-only reference** (do not change): `lib/fpl/swap.ts`, `app/api/utils.ts`,
  `app/store/index.ts`, `app/provider/index.tsx`, `components/drafts/table/save.tsx`
  (bank-persistence semantics).

## Verification
- `bun run test` — all suites green, incl. the new `gameweek.test.ts` (node) and
  `gameweek.component.test.tsx` (happy-dom).
- `bun run test:coverage` — `lib/fpl/gameweek.ts` covered under the `lib/fpl/**` gate.
- `bunx tsc --noEmit` — clean under `strict` (new `.tsx` test + `resolveGameweekPicks` types).
- `bun run build` (`prisma generate && next build`) — confirms the queryFn rewire compiles and
  the client/server boundary is intact.
- Runtime smoke (`bun run dev`): page GW1→GW2→GW3; ITB, the -4 Hit, and Budget indicators are
  identical to pre-refactor (proves the extracted bank math is behavior-preserving).

## Risks
1. **`picks.overall.bank` value semantics are persisted** (save/update draft payloads). The
   extraction must return the composite (incl. `remainingTransferOutSum`) value unchanged —
   covered by the "two bank values differ" unit test.
2. **`picks.overall.bank` has a second writer** (`addToBank`/`removeFromBank`). Untouched; the
   component test renders without exercising that path.
3. **MSW relative-URL + origin**: `/api/gameweek` is relative; the node server needs an origin
   (happy-dom's `http://localhost`). If the handler doesn't intercept, tests will hang on the
   real fetch — first thing to verify when wiring the harness.
4. **Singleton `queryClient` + PostHog-at-import** in `app/provider/index.tsx`: mitigated by
   mocking `posthog-js` and using a test-local `QueryClient`; the nested provider means cache
   can leak across tests if not reset — reset via MSW `resetHandlers` + fresh client per test.
5. **happy-dom vs jsdom gap**: if a happy-dom limitation surfaces during render, the per-file
   `// @vitest-environment` line swaps to `jsdom` with no config change.
