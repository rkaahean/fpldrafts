# FPL Planner UI Refactor

## Context

The app currently crams everything — pitch/squad builder, player transfer market, saved drafts, and the fixtures difficulty grid — onto a single home page (`app/page.tsx`), composed differently for mobile vs desktop. This has become unwieldy: fixtures deserve their own space, and the player-selector/drafts area needs better organization. Alongside this, the UI mixes shadcn components, raw hand-rolled Tailwind, and a bespoke green/forest dark theme with inconsistent CSS variable formats (mixed hex/HSL) and no defined type scale (every component hand-picks arbitrary pixel font sizes).

Goal: split the home page into focused routes, migrate every hand-rolled UI piece to shadcn so there's "no pure radix, no pure tailwind, no pure anything," adopt a simple black-and-white theme, and establish consistent font sizing — all while keeping **picking players, making transfers, and viewing transfer plans** as the least-friction, most prominent part of the experience.

Decisions confirmed with the user:
- Persistent nav bar (extends existing `Navbar`) with real routes — not single-page tabs.
- Fixtures → dedicated `/fixtures` page.
- Drafts (saved list) → dedicated `/drafts` page.
- Player selector: full-featured version on its own `/players` page; a lightweight collapsible pane stays on Home next to the pitch (core workflow), linking out to `/players`.
- Full shadcn migration in this same pass (not deferred).
- Black/white theme, **dark-only** (no light/dark toggle — recolor existing hardcoded dark mode).
- Add a new shadcn `Collapsible` primitive for the Home player pane (not a repurposed `Accordion`).

## Route/page architecture

New route group `app/(app)/` consolidates the authenticated shell (auth gate + `Navbar` + mobile/desktop wrapper) so it isn't copy-pasted across 4 pages. Route group syntax means URLs stay `/`, `/fixtures`, `/players`, `/drafts` (no `/app` prefix).

```
app/
  (app)/
    layout.tsx        NEW — auth() + redirect() gate (moved from app/page.tsx),
                       renders Navbar + DeviceWrapper outer shell, wraps {children}
    page.tsx           MOVED from app/page.tsx — keeps newGameweek computation
                       (JWT decode + getUserTeamFromEmail + getLatestGameweek,
                       Home-specific, stays out of the layout), renders Team +
                       new collapsible player pane
    fixtures/page.tsx  NEW — thin wrapper, renders <Fixtures /> (components/fixtures/server.tsx unchanged)
    players/page.tsx   NEW — thin wrapper, renders <Selector /> (components/transfers/server.tsx unchanged)
    drafts/page.tsx    NEW — thin wrapper, renders <Drafts /> (components/drafts/table/overview.tsx unchanged)
  landing/, link/, about/, api/, layout.tsx, globals.css, store/, provider/   unchanged
```

`app/link/page.tsx` stays **outside** `(app)` — its redirect logic is inverted (only reachable by users without a team) and it shouldn't render the authenticated shell/Navbar.

This is a **thin-page, fat-component** pattern: `Fixtures`, `Selector`, `Drafts` are reused exactly as they exist today as page bodies. All relocation risk is about *where* they're mounted, not rewriting their internals.

### Known correctness gap to fix during the split

`FixturesClient` (`components/fixtures/table.tsx`) and the pitch (`Gameweek.tsx`) both read `currentGameweek` from the Zustand `picksStore`, but it's only ever seeded by `Gameweek.tsx`'s `useEffect(() => setCurrentGameweek(props.gameweek), ...)`. If a user navigates straight to `/fixtures` without visiting `/` first this session, fixtures will show gameweek 1 instead of "next gameweek." Fix: extract the `newGameweek` computation (JWT decode + `getUserTeamFromEmail` + `getLatestGameweek`, currently inline in `app/page.tsx`) into a small shared server helper (e.g. alongside `getLatestGameweek` in `app/api/index.ts`), call it from both `(app)/page.tsx` and `(app)/fixtures/page.tsx`, and seed `currentGameweek` via the same `useEffect`-on-mount pattern in a thin client wrapper around `<Fixtures />`.

## Navbar redesign

`components/navbar/main.tsx` currently has only avatar + sign-out. Add real nav links (Home `/`, Fixtures `/fixtures`, Players `/players`, Drafts `/drafts`) using `next/link` + `usePathname()` for active-route highlighting (monochrome-appropriate: filled/bordered for active, muted-foreground for inactive — no hue). Reuse the existing `DeviceWrapper`/`isMobile` pattern (already client-side, already used by `components/home/main.tsx`) rather than inventing a new responsive mechanism — pass the mobile flag down from `(app)/layout.tsx` if link presentation needs to differ (icon-only mobile row vs icon+label desktop column), matching the icon-only convention already used by the draft toolbar buttons.

## Home page composition

`Team` (`components/pitch/team.tsx`, unchanged internally) stays the centerpiece and gets the reclaimed space once `Selector`/`Drafts`/`Fixtures` are removed from Home's layout.

New collapsible player pane: add `npx shadcn add collapsible`, build `MiniSelector` (new file, e.g. `components/transfers/mini-selector.tsx`) by extending the existing `DataTable` in `components/transfers/table.tsx` with a filter-visibility prop (mirroring the `isFilterable` prop pattern already used by the **separate** `DataTable` in `components/drafts/table/table.tsx` — confirmed these are two distinct implementations, so extending `transfers/table.tsx`'s version is self-contained and low-risk) so the mini pane shows just search + Add, reusing `columns.tsx`'s existing `makeTransfers()`/`transfersIn` wiring unchanged. Include a "View all players" link to `/players` inside the `CollapsibleContent`. Default collapsed; local `useState` is sufficient (pure UI state, doesn't belong in Zustand).

## Full player selector (`/players`) and Drafts (`/drafts`) pages

Both are near-verbatim relocations:
- `/players` renders `Selector` (`components/transfers/server.tsx`) unchanged, now with full page width/height instead of the old `w-[28%]` sidebar — all existing filters (position `ToggleGroup`, price `Slider`, team `Select`, name `Input`) stay as-is.
- `/drafts` renders `Drafts` (`components/drafts/table/overview.tsx`) unchanged, full page width instead of `h-1/3` of a `w-[22%]` column. Draft-mutating actions (`DraftSave`, `DraftUpdate`, `DraftChanges`, `RemoveAll`) stay on Home inside `Team`'s toolbar — `/drafts` is browse-only.

Because `picksStore` is a Zustand singleton (not React Context), transfers added from either the mini pane on Home or the full `/players` page immediately reflect on the pitch when the user returns to Home — no extra wiring needed.

## Fixtures (`/fixtures`) and shared helper relocation

Renders `Fixtures` (`components/fixtures/server.tsx`) unchanged. `getFixtureColorFromDifficulty` currently lives in `components/fixtures/table.tsx` and is cross-imported by `components/pitch/Player.tsx` — relocate it to `scripts/lib/utils.ts` (existing shared utility home, already imported by both files for `cn`/other helpers) and rename to `getFixtureIntensityClass` as part of the monochrome rewrite (below). Update both call sites.

## shadcn component inventory

**Add:** `collapsible` (Home player pane), `badge` (fixture difficulty numeric indicator, monochrome-safe redundant signal alongside shade). Do **not** add `tabs` — no confirmed use case once navigation is route-based.

**Rebuild on shadcn primitives:**
- `components/pitch/Player.tsx` — highest-risk rebuild (most complex, most-used). Move the hand-rolled `motion.div`/raw Tailwind card onto shadcn `Card`/`CardContent`, keep `framer-motion` for mount animation (legitimate animation lib, not a "raw Tailwind" violation), restyle substitution/transfer-out buttons as shadcn `Button variant="ghost" size="icon"`. Preserve click interactions and fixture/stats tickers functionally unchanged.
- `components/pitch/team.tsx` — replace ad hoc `bg-secondary rounded-md` nav styling with theme-token-driven classes (or wrap in `Card`).
- `components/fixtures/table.tsx` — monochrome intensity + `Badge` redesign (below).
- `components/drafts/table/changes.tsx` — has hardcoded `text-green-500 bg-green-500` / `text-red-500 bg-red-500` transfer in/out icons (found during exploration, not previously flagged) — convert to monochrome, rely on `+`/`−` shape plus optional border distinction rather than hue.
- `components/ui/header.tsx` / `footer.tsx` — opportunistic: swap `<a>` wrapped in `Button` for `Button asChild` + `next/link`. Low priority, cheap.

**Icon consolidation:** `@radix-ui/react-icons` and `lucide-react` currently coexist. Standardize on `lucide-react` (shadcn default). Mechanical icon-for-icon swap across: `components/navbar/main.tsx` (`ExitIcon`→`LogOut`), `components/transfers/table.tsx` (`Cross1Icon`→`X`), `components/pitch/Player.tsx` (`Cross2Icon`→`X`, `DoubleArrowDownIcon`→`ArrowDownToLine`), `components/pitch/Gameweek.tsx` (`ArrowLeftIcon`/`ArrowRightIcon`→`ArrowLeft`/`ArrowRight`), `components/drafts/remove.tsx`, `components/drafts/table/save.tsx`, `components/drafts/update.tsx`, `components/drafts/table/changes.tsx`, `components/ui/footer.tsx`. Remove `@radix-ui/react-icons` from `package.json` once done.

## Theme rewrite (`app/globals.css` + `tailwind.config.ts`)

Fix the existing format inconsistency: some `tailwind.config.ts` tokens wrap `hsl(var(--x))`, others don't, which is why `.dark` today mixes raw hex and HSL triplets. Standardize on **HSL triplets everywhere** in `globals.css`, and wrap every color token uniformly as `hsl(var(--x))` in `tailwind.config.ts`.

Replace the green/forest `.dark` palette with a grayscale scale (dark-only, per user decision — no toggle, `app/layout.tsx`'s hardcoded `className="dark"` stays):

```css
.dark {
  --background: 0 0% 7%;    --foreground: 0 0% 96%;
  --card: 0 0% 10%;         --card-foreground: 0 0% 96%;
  --popover: 0 0% 10%;      --popover-foreground: 0 0% 96%;
  --primary: 0 0% 96%;      --primary-foreground: 0 0% 9%;
  --secondary: 0 0% 16%;    --secondary-foreground: 0 0% 90%;
  --muted: 0 0% 20%;        --muted-foreground: 0 0% 60%;
  --accent: 0 0% 24%;       --accent-foreground: 0 0% 96%;
  --destructive: 0 0% 30%;  --destructive-foreground: 0 0% 96%;
  --success: 0 0% 85%;      --success-foreground: 0 0% 9%;
  --border: 0 0% 20%;       --input: 0 0% 20%;      --ring: 0 0% 80%;
  --player: 0 0% 14%;       --player-foreground: 0 0% 96%;
  --highlight: 0 0% 40%;    --bgsecondary: 0 0% 12%;
  --radius: 0.5rem;
}
```

`:root` (light) should mirror this as a consistent inverted grayscale scale too, even though unused today, so the theme file itself isn't left half-fixed.

**Success/destructive without hue:** distinguish via lightness (destructive darker/higher-contrast border, success lighter) plus icons in toasts (`CheckCircle`/`AlertTriangle` from lucide) so meaning isn't carried by shade alone — this is the accessible approach and was validated as the right call given full monochrome removes hue as a signal.

**Fixture difficulty (highest legibility risk in this refactor):** current 5-level red→green scale becomes a grayscale intensity scale **redundantly encoded with a numeric `Badge`** (1–5) in each cell, since 5 adjacent grays are harder to scan at a glance than 5 hues — the number makes the signal robust. Use Tailwind's built-in `neutral` scale directly (e.g. `bg-neutral-100` → `bg-neutral-900` for strength 1→5) rather than adding 5 new dedicated theme tokens, since these are inherently grayscale and don't need dark/light theming. Both `/fixtures`'s grid and the pitch's `PlayerFixtureTicker` consume the same `getFixtureIntensityClass` helper so the visual language stays identical in both places.

## Font/type scale

Add a named scale to `tailwind.config.ts`'s `theme.extend.fontSize`, anchored around a new `3xs`/`2xs` step pairing (covering the `text-[6px]`–`text-[10px]` cluster of arbitrary values found across `Player.tsx`, `Gameweek.tsx`, `fixtures/table.tsx`) alongside the standard `xs`/`sm`/`base`/`lg`/`xl`/`2xl`/`3xl` steps. Audit and replace arbitrary `text-[Npx]` usages with named steps, **preserving the existing multi-breakpoint responsive pattern** (`text-3xs lg:text-xs 2xl:text-sm` instead of `text-[8px] lg:text-xs 2xl:text-sm`) — this is a normalize pass, not a redesign of the responsive density strategy the pitch/player-table views depend on. Heaviest audit targets: `components/pitch/Player.tsx`, `components/pitch/Gameweek.tsx` (`GameweekStat`), `components/fixtures/table.tsx`.

## Migration phasing

Ordered so the app stays demoable after each phase, front-loading low-risk foundational work:

1. [x] **Theme + type scale foundation** — rewrite `globals.css`/`tailwind.config.ts` (color tokens + font scale). No component logic changes. Expect transient visual mismatches (fixture colors, success/destructive) until Phase 4/5 catch up — app stays functionally correct throughout.
2. [x] **Route restructuring** — create `(app)/layout.tsx`, move `app/page.tsx`, add `fixtures/`, `players/`, `drafts/` thin pages, implement the `currentGameweek` seeding fix for `/fixtures`. Keep Home's old inline rendering of `Selector`/`Drafts`/`Fixtures` temporarily to isolate "routing works" from "composition changed."
3. [x] **Home composition change** — remove duplicated `Drafts`/`Fixtures` from Home, add `Collapsible` + `MiniSelector`, reflow Home layout to give the pitch the reclaimed space. Highest risk for `Gameweek.tsx` mount-lifecycle regressions — test transfer/substitution flows thoroughly.
4. [x] **Component-by-component shadcn migration + icon consolidation** — `Player.tsx` rebuild (highest complexity), `team.tsx` cleanup, icon swaps file-by-file, `header.tsx`/`footer.tsx` opportunistic fixes.
5. [x] **Fixture/success/destructive monochrome redesign** — relocate `getFixtureIntensityClass`, update fixture grid + pitch ticker + toasts + draft-changes icons. Budget extra manual QA here specifically — legibility risk, not correctness risk.
6. [x] **Navbar nav-link buildout** — real links, active-route highlighting, responsive treatments.
7. [x] **Cleanup (optional)** — delete dead code (`components/charts/player.tsx`, `components/timeline/Timeline.tsx`); optionally fix the pre-existing nested `ReactQueryProvider` in `Gameweek.tsx` (redundant but not currently destructive — same singleton client, separable from this refactor).

## Verification

- `npm run dev` after each phase, confirm no build/type errors.
- Test on **both** mobile and desktop: `DeviceWrapper`'s `isMobile` uses `react-device-detect` (real UA sniffing), so use browser dev-tools device emulation (mobile UA), not just window resizing.
- Core workflow smoke test after every phase touching it: load Home → pitch renders current squad → add a player via mini pane or `/players` → confirm pending transfer appears on pitch → substitute a player → save a draft → confirm it shows on `/drafts` → navigate Home→Fixtures→Players→Drafts→Home via nav, confirming state persists (proves the Zustand-singleton cross-route wiring holds).
- Auth flow: sign out, confirm redirect to `/landing` from every `(app)` route; sign in without a team, confirm redirect to `/link`.
- Phase 5 specifically: view fixture grid and pitch ticker at each breakpoint, confirm a user can still quickly distinguish easy vs hard fixture runs using only grayscale + badge numbers.
