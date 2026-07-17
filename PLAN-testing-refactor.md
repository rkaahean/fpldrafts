# FPL Planner — RULES.md + Testability Refactor + Test Suite

## Context

The user is returning to this FPL (Fantasy Premier League) transfer-planning app after a long time and wants to make it **correctness-first**. FPL is a game about picking a valid, budget-legal squad and planning transfers correctly — so getting the rules wrong is the worst failure mode. Today the app has **zero tests** and the correctness-critical logic is tangled inside React components, a Zustand store, and Prisma-coupled route handlers, making it untestable. Worse, exploration confirmed that **several rules the user cares about don't exist in code at all**:

- No **-4 points-hit** for exceeding free transfers (the user's headline example: 2 transfers in GW2 after banking nothing = -4, since only 1 free transfer is available).
- No **budget-overspend guard** (bank can silently go negative).
- No **max-3-players-per-club** rule (`team_code` is used only for badge images).
- No **squad-size / composition cap** (only starting-XI *minimums* exist, inside `makeSubs`).

Intended outcome: a `RULES.md` capturing the FPL ruleset + app invariants; a behavior-preserving refactor that extracts the correctness logic into a pure, framework-free `lib/fpl/` module; the **missing invariants added** as pure functions; and **outcome-based** test coverage (not implementation-coupled) proving the rules hold — e.g. "2 transfers after 0 last week in GW2 → -4".

### User decisions (confirmed)
- **Build AND test the missing rules now** (transfer cost, budget guard, max-3-per-club, squad composition) — not just test what exists.
- New domain logic lives in **`lib/fpl/`** (top-level, framework-agnostic).
- Transfer cost is **compute + display** only — no Prisma schema changes this pass.

## FPL Rules (2025/26) — source of truth for RULES.md
- Budget **£100.0m** (stored as `1000`, integer tenths-of-a-million) for a **15-player squad**: **2 GK, 5 DEF, 5 MID, 3 FWD**.
- **Max 3 players per real PL club**.
- **Starting XI**: exactly **1 GK, 3–5 DEF, 2–5 MID, 1–3 FWD** (11 total). Valid formations: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1.
- **Transfers**: 1 free per gameweek, **bankable up to 5 max**, each extra transfer costs **-4 points**.
- **Selling price**: 50%-profit rule, profit rounded **down** — `sell = boughtPrice + floor((now - bought)/2)` when in profit, else `now`. (Bought 60, now 63 → 61.)
- **Captain** = 2× points; vice-captain is backup.

Sources: premierleague.com FPL help / news (2025/26), fplwire position rules.

---

## Deliverables

### 1. `RULES.md` (repo root) — documentation only
Capture the ruleset above plus the **app-specific correctness invariants** the user named:
1. Budget: exceeding is *allowed but must be explicit* — never silently overspend; surface the overspend.
2. Valid pitch (starting XI) at all times: 1 GK, 3–5 DEF, 2–5 MID, 1–3 FWD.
3. Max 3 players per club.
Also note the tenths-of-a-million price convention and where each rule is enforced in code (link to `lib/fpl/`).

### 2. Test runner: **Vitest**
Chosen over `bun test` (can't read tsconfig `paths` natively, weaker jsdom/mock story) and Jest (ESM + `@/*` alias config pain with `module: esnext` / React 19). Vitest is ESM-native and resolves the `@/*` alias via `vite-tsconfig-paths` in one line.

- Add devDeps (via `bun add -D`): `vitest`, `@vitest/coverage-v8`, `vite-tsconfig-paths`. (jsdom + testing-library only if component tests are later added — the refactor pushes logic *out* of components so these are largely unneeded.)
- `vitest.config.ts` (repo root): `plugins: [tsconfigPaths()]`, `test.environment: "node"`, `include: ["**/*.test.ts"]`, `exclude: ["node_modules",".next","build"]`, coverage `include: ["lib/fpl/**"]`, provider `v8`.
- `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`.
- Tests **co-located** as `*.test.ts` beside each `lib/fpl/` module.

### 3. New pure domain module `lib/fpl/`
```
lib/fpl/
  types.ts       // re-export existing types ONLY — no parallel types
  swap.ts        // swapPlayers (moved here)
  pricing.ts     // computeSellingPrice
  formation.ts   // validateSubstitution
  transfers.ts   // computeFreeTransfers, computeTransferCost, countTransfersInGameweek
  squad.ts       // getNumPlayersByType, getSquadCountByType, checkBudget,
                 // bankAfterTransfer, validateSquadComposition, validateMaxPerClub, constants
```
`types.ts` re-exports `PlayerData, DraftTransfer, DraftState` from `@/app/store/utils` and `FPLGameweekPicksData, FPLPlayerData` from `@/app/api`. Shared `ValidationResult { valid: boolean; reason: string }`. **All new functions operate on the existing types — invent no parallel shapes.**

#### Extractions (behavior-preserving — text/reasons preserved verbatim)
- **`swap.ts`**: move `swapPlayers` body verbatim from `app/store/index.ts`; in the store, replace with `export { swapPlayers } from "@/lib/fpl/swap"` so `Gameweek.tsx`'s existing `import { picksStore, swapPlayers } from "@/app/store"` is unchanged. Keep it `async` to avoid touching the `await` at the call site.
- **`squad.ts` `getNumPlayersByType(element_type, picks)`**: starting XI only (`position <= 11`), moved out of the store (currently module-private).
- **`formation.ts` `validateSubstitution(subIn, subOut, picks): ValidationResult`**: the entire rule cascade from `makeSubs` (same-type always valid; GK-only-for-GK; min 3 DEF / 2 MID / 1 FWD). Store's `makeSubs` calls it and keeps the `toast` + `set` reset on `!valid`, using `result.reason` verbatim.
- **`transfers.ts` `computeFreeTransfers({currentGameweek, draftChanges, serverTransferCount}): number | "∞"`**: the GW1="∞" / GW2=1 / draft-branch / fallback-branch logic from `Gameweek.tsx` lines 126–158. **Branch selection lives inside the function**: GW1→"∞"; GW2→1; else `draftChanges.length > 0` → windowed draft count; else → `serverTransferCount`. The window `[cg-5, cg-1]` + `gw>1` + `type=="transfer"` filter is applied **only to `draftChanges`**; `serverTransferCount` is trusted as already scoped by the server query (`route.ts` `gte: gw-5, lte: gw-1`) — comment this asymmetry in code. Clamp faithful to source: `min(5)` then the literal `<= 0 → 1` check (NOT `Math.max(1, …)`, which would change the exact-zero boundary). `Gameweek.tsx` computes `serverTransferCount = data.transfers?.length ?? 0` and replaces the inline block with one call. Also extract `countTransfersInGameweek(changes, gw)` for the "made this GW" display (lines 179–186).
- **`pricing.ts` `computeSellingPrice(transferInPrice, currentPrice)`**: the inline rule from `route.ts` lines 153–167. Route's `.map` calls it.

#### New invariants (genuinely new logic — additive, `lib/fpl/`)
```ts
// transfers.ts
computeTransferCost(transfersMade, freeAvailable: number | "∞"): number
  // "∞" (GW1, infinite free transfers) → 0; else Math.max(0, made-free) * -4

// squad.ts
const BUDGET = 1000; const MAX_PER_CLUB = 3;
const SQUAD_COMPOSITION = { 1: 2, 2: 5, 3: 5, 4: 3 };
getSquadCountByType(element_type, picks): number            // full 15, all positions
bankAfterTransfer(currentBank, transfer): number            // + out.price - in.price (pure/tested; NOT the wiring path)
checkBudget(bankAfter): ValidationResult                    // valid iff >= 0
validateSquadComposition(picks): ValidationResult           // exactly 2/5/5/3, 15 total — TEST-ONLY this pass (not wired)
validateMaxPerClub(picks): ValidationResult                 // no team_code > 3; name offender in reason — TEST-ONLY this pass (not wired)
```
Read squad-side data from `picks.data[i].fpl_player.element_type` / `.team_code`. Both are selected in `getGameweekPicksData` and in the GW1 basecase spread, so the read surface is identical across both squad shapes — no GW1-specific fixture needed.

**Wiring scope (this pass):** only `computeTransferCost` (the -4 hit) and `checkBudget` are wired into the UI. `validateSquadComposition` and `validateMaxPerClub` are **test-only** — there is no safe non-spurious UI surface yet (future-gameweek picks can be empty/stale → false "composition wrong" warnings; and `validateMaxPerClub` needs the *post-transfer* squad, not the pre-transfer `picks`, so it belongs at the post-`swapPlayers` site — deferred to its own ticket). `bankAfterTransfer` stays a pure tested function but is **not** the wiring mechanism (see Display wiring).

#### Display wiring (compute + display, no persistence)
- `Gameweek.tsx`: show the `-N` points hit (from `computeTransferCost(made, free)`, where `free` is the raw `computeFreeTransfers` return — `"∞"` flows through and yields `0`) alongside the existing Transfers stat.
- `Gameweek.tsx`: surface `checkBudget(draftData.overall.bank)` — **wired against the post-`swapPlayers`, pre-`remainingTransferOutSum` bank** (`Gameweek.tsx:111`). This reuses the fold `swapPlayers` already performs across every draft change (`index.ts:344`), so **no manual `bankAfterTransfer` fold** is needed and the transfer-out refund credited by `updateTransfer` (`utils.ts:63`) is **not double-counted**. Display-level, non-blocking, matching "allowed but explicit".
- `validateMaxPerClub` is **not** wired this pass (see Wiring scope above).

---

## Phasing (each independently shippable)

- **Phase 1 — Infra + prove the harness. ✅ DONE.** Add devDeps, `vitest.config.ts`, `test` scripts, `RULES.md`. Write tests for already-pure fns: `elementTypeToPosition` (`scripts/lib/utils.ts`) and `swapPlayers` **tested in place** (import from `@/app/store`) before moving it. **`filterData` is deferred** — it takes nested `FPLPlayerData` and calls `FPLPlayerDataToPlayerData` (needs a populated `fpl_player_team` with home/away fixtures), so it's not a cheap "already-pure" harness proof; add later with a fixture factory if wanted. Also add the two store-helper regression tests (see below). Deliverable: green `bun run test`, zero source refactor — proves alias/ESM/runner.
  - **Store-helper tests** (`app/store/utils.test.ts`, import from `@/app/store/utils` — **never** `@/app/store`, whose `index.ts` pulls in `use-toast`/`zustand` and can throw under `environment: "node"`; use a local `let bank` + injected `addToBank`/`removeFromBank` closures, no store/React): (1) `updateTransfer` on `transfersOut` — add-then-toggle-off round trip nets bank back to start (locks the symmetric path that *does* touch bank); (2) `removeTransfer` — asserts bank untouched (documents that the `transfersIn` error-rollback path correctly does not move bank). These are regression locks, outside `lib/fpl/**` coverage scope.
- **Phase 2 — Extract trapped logic (behavior-preserving). ✅ DONE.** Create `lib/fpl/{swap,pricing,formation,transfers,squad(getNumPlayersByType)}.ts`; move `swapPlayers` + re-export; rewire `makeSubs`, `Gameweek.tsx`, `route.ts`. Add `pricing`, `formation`, `computeFreeTransfers` tests. Small commits; verbatim reason strings.
- **Phase 3 — Add missing invariants + display. ✅ DONE (runtime smoke pending).** Add `computeTransferCost`, `checkBudget`/`bankAfterTransfer`, `validateSquadComposition`, `validateMaxPerClub`, `getSquadCountByType` + tests (all five defined & unit-tested). **Wire into UI: only the -4 hit (`computeTransferCost`) and `checkBudget(draftData.overall.bank)`.** `validateSquadComposition` and `validateMaxPerClub` are test-only this pass (see Wiring scope).

---

## Test cases (outcome-based: input → expected)

**`computeSellingPrice`**: (60,63)→61; (60,64)→62; (60,60)→60; (60,55)→55; (55,56)→55 (odd profit rounds down).

**`computeFreeTransfers`**: GW1→"∞"; GW2 (0 or 2 changes)→1; GW3 fallback 0 prior→2; GW3 1 prior in-window→1; **GW3 draft-branch 2 prior in-window→raw 0→1 (locks the `<= 0` clamp boundary — a `< 0` or `Math.max(1,…)` reimpl would break this exact-zero case)**; GW7 draft-branch 0 in-window→6 clamp→5; GW4 5 prior→-2 clamp→1; window boundary (cg-5 counts, cg-6 doesn't, gw==1 excluded).

**`computeTransferCost` (headline)**: (2 made,1 free)→**-4**; (1,1)→0; (0,1)→0; (3,1)→-8; (4,2 rolled)→-8; (2,5 max)→0; (6,5)→-4; **(2,"∞")→0 (GW1 infinite free → no hit)**.

**`squad` (budget/club/composition)**: `bankAfterTransfer(bank5,out50,in45)`→10; overspend out40/in55/bank10→bankAfter-5→`{valid:false}`; `validateSquadComposition` 2/5/5/3→valid, 3 GK→invalid, 14-man→invalid; `validateMaxPerClub` 3-from-club→valid, 4→invalid (names club); `getNumPlayersByType` (XI-only) vs `getSquadCountByType` (full) differ when bench (position>11) present.

**`validateSubstitution`**: GK→GK valid; GK↔DEF invalid (GK reason); DEF out w/ 4→valid, w/ 3→invalid ("minimum of 3 defenders"); MID out w/ 2→invalid, 3→valid; FWD out w/ 1→invalid, 2→valid; same-type always valid.

**`swapPlayers`**: transfer case (out replaced at its position, `bank = old + out.price - in.price`, length unchanged); position-swap case tested **purely** — pass an arbitrary `DraftTransfer` with non-zero `in.price`/`out.price` and assert positions exchanged AND `bank += out.price - in.price` (the "bank unchanged" property is a consequence of `makeSubs` building `price:0` transfers, not of `swapPlayers` itself); no-op when out-player absent (returns original, bank untouched); immutability (original array not mutated).

**`makeSubs` (separate from `swapPlayers`)**: asserts the pushed `DraftTransfer` carries `in.price === 0 && out.price === 0` — the property that keeps substitution bank-neutral.

**store helpers** (`updateTransfer`/`removeTransfer`, local bank + closures): `updateTransfer` on `transfersOut` add-then-toggle-off → bank returns to start; `removeTransfer` on `transfersIn` → bank untouched (error-rollback path never credited bank, so nothing to refund — confirms `utils.ts:92` commented-out `removeFromBank` is correct, not a bug).

**Pure utils**: `elementTypeToPosition` 1/2/3/4→GK/DEF/MID/FWD, else "None". (`filterData` deferred — nested-fixture cost, see Phase 1.)

---

## Risks (from exploration — flag, don't silently "fix")
1. **Double JSON-encoding** in `route.ts` (`Response.json(JSON.stringify(...))`) that `Gameweek.tsx` compensates for with `JSON.parse`. Brittle but **out of scope** — Gameweek depends on it; separate ticket.
2. **In-place mutation** in `updateTransfer`/`removeTransfer` (`app/store/utils.ts`). Keep new validators reading `picks` (committed squad), not in-flight buckets.
3. **Commented-out `removeFromBank`** in `removeTransfer` (utils.ts:92) — **investigated: likely correct, NOT a bug.** It sits on the `transfersIn` error-rollback path (only caller: `columns.tsx:182`, rolling back an invalid transfer-in). Transfer-in adds are inline `.push()` with **no `addToBank`** (`columns.tsx:148`), so there is no credit to reverse — refunding here would double-debit (and crash, since the callback is optional and unpassed at the call site). The real bank accounting lives in `updateTransfer` on `transfersOut` (`utils.ts:63/70`), which is symmetric. The two store-helper tests (Phase 1) lock this in. **Do not "fix" by uncommenting.**
4. **`makeTransfers` drains buckets via `.pop()` inside `set`** — extracting a pure `pairTransfers` changes drain timing → treat as behavior-changing, not Phase 2.
5. **Substitute bank formula uses price 0** — correct today; ensure budget/club validators wired into the sub path don't treat a sub as a £0 transfer.

## Critical files
- `app/store/index.ts` — move `swapPlayers`, rewire `makeSubs`.
- `components/pitch/Gameweek.tsx` — `computeFreeTransfers` + transfer-cost display.
- `app/api/gameweek/route.ts` — `computeSellingPrice`.
- `app/store/utils.ts` — types + mutation/bug risks.
- `scripts/lib/utils.ts` — already-pure fns (Phase 1 harness proof).
- **New**: `lib/fpl/{types,swap,pricing,formation,transfers,squad}.ts` + co-located `*.test.ts`, `vitest.config.ts`, `RULES.md`.

## Verification
- `bun run test` (all green) and `bun run test:coverage` (gate on `lib/fpl/**`).
- `bunx tsc --noEmit` — domain module type-checks under `strict` against real `FPLGameweekPicksData`/`PlayerData` (catches fixture drift). **Caveat:** the GW1 basecase (`route.ts:59–133`) is a hand-built `any[]`, double-JSON-encoded, so `tsc` does **not** type-check it — this verification does not cover the GW1 squad shape. (Validators are unaffected: they read only `team_code`/`element_type`, present identically on both shapes.)
- `bun run build` (`prisma generate && next build`) — confirms store re-export + rewires compile and don't break the client/server boundary.
- Runtime smoke: `bun run dev` against Supabase (`.env` has `FPL_SEASON_ID`), then: do an illegal GK substitution (toast text unchanged), page GW1→GW2→GW3 (free-transfer count identical to pre-refactor), and confirm the new -4 hit displays when making 2 transfers in GW2.
