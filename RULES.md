# FPL Planner — Rules & Correctness Invariants

This is the source of truth for the Fantasy Premier League ruleset the app
models, plus the app-specific correctness invariants. The correctness logic
lives in the framework-free `lib/fpl/` module and is proven by co-located
`*.test.ts` suites.

## Price convention

All prices and the bank are stored as **integer tenths of a million** (£100.0m
is `1000`). Divide by 10 for display.

## FPL ruleset (2025/26)

- **Budget**: £100.0m (`1000`) for a **15-player squad**: **2 GK, 5 DEF, 5 MID,
  3 FWD**.
- **Max 3 players per real Premier League club** (keyed on `team_code`).
- **Starting XI**: exactly **1 GK, 3–5 DEF, 2–5 MID, 1–3 FWD** (11 total).
  Valid formations: 3-4-3, 3-5-2, 4-3-3, 4-4-2, 4-5-1, 5-3-2, 5-4-1.
- **Transfers**: 1 free per gameweek, **bankable up to 5 max**; each extra
  transfer costs **-4 points**.
- **Selling price**: 50%-profit rule, profit rounded **down** —
  `sell = boughtPrice + floor((now - bought) / 2)` when in profit, else `now`.
  (Bought 60, now 63 → 61.)
- **Captain** = 2× points; vice-captain is the backup.

Sources: premierleague.com FPL help / news (2025/26), fplwire position rules.

## App correctness invariants

1. **Budget** — exceeding is *allowed but must be explicit*. Never silently
   overspend; surface the overspend. Enforced by `checkBudget` in
   `lib/fpl/squad.ts`, wired into `Gameweek.tsx` against the post-`swapPlayers`
   bank (display-level, non-blocking).
2. **Valid pitch (starting XI)** at all times: 1 GK, 3–5 DEF, 2–5 MID, 1–3 FWD.
   Enforced on substitution by `validateSubstitution` in `lib/fpl/formation.ts`.
3. **Max 3 players per club** — `validateMaxPerClub` in `lib/fpl/squad.ts`.
   Defined and unit-tested; not yet wired into the UI (needs the post-transfer
   squad, not the pre-transfer `picks` — deferred to its own ticket).
4. **Squad composition** — exactly 2/5/5/3, 15 total. `validateSquadComposition`
   in `lib/fpl/squad.ts`. Defined and unit-tested; not wired (future-gameweek
   picks can be empty/stale and would trigger spurious warnings).

## Where each rule is enforced

| Rule | Function | Module |
| --- | --- | --- |
| Selling price | `computeSellingPrice` | `lib/fpl/pricing.ts` |
| Starting-XI minimums on sub | `validateSubstitution` | `lib/fpl/formation.ts` |
| Free transfers available | `computeFreeTransfers` | `lib/fpl/transfers.ts` |
| Transfers made this GW | `countTransfersInGameweek` | `lib/fpl/transfers.ts` |
| Points hit (-4 per extra) | `computeTransferCost` | `lib/fpl/transfers.ts` |
| Budget guard | `checkBudget` / `bankAfterTransfer` | `lib/fpl/squad.ts` |
| Max 3 per club | `validateMaxPerClub` | `lib/fpl/squad.ts` |
| Squad composition | `validateSquadComposition` | `lib/fpl/squad.ts` |

## Notes / known limitations

- The **GW1 basecase** (`app/api/gameweek/route.ts`) is a hand-built `any[]`,
  double-JSON-encoded, so `tsc --noEmit` does **not** type-check its squad
  shape. The validators are unaffected — they read only `team_code` /
  `element_type`, which are present identically on both squad shapes.
- `computeFreeTransfers` windows its draft branch to `[currentGameweek-5,
  currentGameweek-1]` but trusts `serverTransferCount` as already scoped by the
  server query — an intentional asymmetry documented in `lib/fpl/transfers.ts`.
