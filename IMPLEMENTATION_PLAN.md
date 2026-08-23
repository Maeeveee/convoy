# Convoy Implementation Plan

## 1. Goal

Build the MVP described in `PROJECT.md`: a browser-based family survival idle game presented in one 2D cutaway scene. The player makes management decisions while the pickup, resources, and time progress automatically.

The MVP is complete when a player can:

- Open the game and understand the current family, vehicle, resources, bond, day, and distance.
- Leave the game open and see generator cycles, production, and consumption continue in real time.
- Assign one task to each family member and change assignments at any time.
- Buy repeatable generators using Trade Credits and purchase x1, x10, x25, Next milestone, or xMax quantities.
- Buy Fuel with Trade Credits to keep the convoy moving.
- Respond to random events with two or three choices and see their consequences.
- Receive an automatic night-family moment at each day boundary without being blocked from playing.
- Buy three instant exterior upgrades: open pickup, emergency tarp, and enclosed van.
- Close and reopen the game, receive capped offline progress, and see a summary of gains.
- Inspect a report card based on distance, vehicle upgrades, and bond.

## 2. MVP Decisions

These decisions keep the first release aligned with the design document and avoid premature scope expansion.

| Area | MVP decision |
|---|---|
| Framework | Existing Next.js 16, React 19, TypeScript, Tailwind/shadcn foundation |
| State | Zustand; keep simulation rules in framework-independent modules |
| Persistence | Versioned `localStorage` save; no backend or account system |
| Scene | HTML/CSS and lightweight CSS animation; no Phaser/PixiJS initially |
| Resources | Fuel, Trade Credits, distance, and bond; no provisions or spare-parts currency in the MVP |
| Relationship | One combined family bond value from 0 to 100 |
| Time | Configurable real-time day duration, initially 5 minutes |
| Offline progress | 60% effective cycle time, capped at 10 hours; bond does not gain offline |
| Events | 5–8 authored events, one active event at a time |
| Vehicle progression | Exterior path only; three tiers, instant purchases |
| Visual assets | Geometric placeholders first; final assets are a later phase |
| End state | Endless mode plus report card; narrative endings are post-MVP |
| Generator milestones | At 25, 50, 100, 200, then every 100 units; each reached milestone halves that generator's cycle time |
| Generator production | Discrete cycles with per-generator base duration and output; partial progress persists |
| Prestige | Legacy is designed but deferred until the cycle economy is balanced |
| Economy | Every generator produces Trade Credits; credits buy generators, Fuel, and vehicle upgrades |
| Early pacing | Start with 150 credits; first generator costs 25; shared generator growth is 1.10 |

## 3. Proposed Project Structure

The exact names can be adjusted during implementation, but responsibilities should remain separated:

```text
app/
  page.tsx                 # game shell and route entry
components/convoy/
  game-shell.tsx
  resource-bar.tsx
  convoy-scene.tsx
  character-card.tsx
  task-panel.tsx
  generator-panel.tsx
  event-dialog.tsx
  night-moment-dialog.tsx
  upgrade-panel.tsx
  offline-summary.tsx
  report-card.tsx
lib/game/
  types.ts                 # domain types and save schema
  constants.ts             # balance values and content IDs
  simulation.ts            # tick, consumption, production, distance
  generators.ts            # pricing and bulk purchase calculations
  events.ts                # event definitions and selection rules
  progression.ts           # upgrades, bond effects, report card
  persistence.ts           # serialize, validate, load, save, offline result
  __tests__/               # unit tests for deterministic game rules
hooks/
  use-game-loop.ts
  use-hydrated-game.ts
```

## 4. Phase Plan

### Phase 0: Technical and Gameplay Contract

**Purpose:** Turn the design document into implementable rules before building UI.

**Work items:**

- Confirm the MVP values listed above and record any balance changes in `lib/game/constants.ts`.
- Define TypeScript types for resources, characters, tasks, generators, upgrades, events, time state, and save data.
- Define invariants: resources cannot become negative, bond stays within 0–100, upgrade levels are monotonic, and timestamps are valid.
- Define the simulation clock as elapsed seconds, not render frames.
- Define formulas for cycle production, partial cycle progress, consumption, distance, bond decay, event effects, generator pricing, and upgrade costs.
- Define initial state and a version number for persisted saves.

**Deliverables:**

- Domain model and initial balance table.
- Written formula/invariant tests or test cases ready to implement.
- A short list of content IDs for tasks, generators, upgrades, and events.

**Exit criteria:**

- Another developer can calculate the result of a one-second tick and a bulk generator purchase without referring back to prose in `PROJECT.md`.
- No UI component owns game rules.

### Phase 1: Game State and Deterministic Simulation

**Purpose:** Implement the playable idle loop independently from the visual scene.

**Work items:**

- Add Zustand and create the game store around the typed state model.
- Implement a simulation action that accepts elapsed seconds and applies:
  - completed generator cycles and partial cycle progress;
  - fuel consumption;
  - distance gain;
  - gradual bond decay;
  - low-resource and low-bond modifiers.
- Clamp elapsed time per active tick to prevent large browser-throttling jumps from corrupting state.
- Implement task assignment for Ayah, Ibu, and Anak.
- Implement generator ownership, next-price calculation, and bulk purchase quantities x1/x10/x25/Next milestone/xMax.
- Implement generator milestones at 25, 50, 100, 200, then every 100 units; each milestone halves that generator's cycle time.
- Use cycle durations from seconds to minutes and hours by generator tier, with integer output per completed cycle.
- Implement instant exterior upgrades and their effects on capacity, event risk, or efficiency.
- Keep all actions deterministic and return explicit success/failure results for UI feedback.

**Deliverables:**

- `lib/game/types.ts`, `constants.ts`, `simulation.ts`, `generators.ts`, and `progression.ts`.
- Zustand store and a browser-safe game-loop hook.
- Unit tests for tick calculations, task changes, bulk purchases, and upgrades.

**Exit criteria:**

- A test can advance the game by any chosen number of seconds and assert exact state changes.
- Buying a generator immediately changes its future cycle output and/or cycle timing.
- Upgrades resolve immediately and cannot be purchased without enough Trade Credits.
- Fuel purchases spend 2.5 Trade Credits per unit and cannot exceed tank capacity.

### Phase 2: Persistence and Offline Progress

**Purpose:** Make the idle game reliable across reloads and absences.

**Work items:**

- Add a versioned `localStorage` save format with `lastSeenTimestamp`.
- Save on meaningful state changes and at a bounded interval; save again on page visibility changes and unload where supported.
- Validate and sanitize loaded data. If a save is invalid or from an unsupported version, fall back to a fresh game rather than crashing.
- Calculate offline elapsed time using the 10-hour cap and 60% effective production-time multiplier.
- Resolve completed generator cycles offline, preserve partial cycle progress, and prevent offline bond gains or excessive bond loss.
- Return a structured offline summary for the UI.
- Add a reset-save action for development and QA.

**Deliverables:**

- `lib/game/persistence.ts` and migration-ready save schema.
- Offline summary state and tests for cap, multiplier, missing saves, malformed saves, and clock edge cases.

**Exit criteria:**

- Reloading preserves all meaningful progress.
- A simulated absence produces the expected capped summary.
- Malformed `localStorage` data never prevents the app from loading.

Phase 2 implementation uses a client hydration hook, a five-second autosave interval, visibility-change saves, a ten-hour offline cap, and a structured offline summary held by the game store for the return dialog.

### Phase 3: MVP Game Interface and Scene

**Purpose:** Expose the simulation through the single-screen decision interface.

**Work items:**

- Replace the starter `app/page.tsx` with a client game shell that hydrates safely.
- Build the resource header with current values, rates, day/time, and distance.
- Build the cutaway pickup scene using responsive HTML/CSS placeholders.
- Show family members in the scene and reflect their current assignments and broad mood/state.
- Add the task panel with one clear control per character and immediate assignment feedback.
- Add the generator panel with ownership, production rate, cost, affordability, and bulk purchase controls.
- Add the exterior upgrade panel with current tier, next tier, cost, and effects.
- Add a visible event area or dialog without interrupting the simulation clock.
- Add the night-family moment dialog and ensure it can be answered later without blocking the game.
- Add loading/hydration states so server rendering and client `localStorage` access do not conflict.

**Deliverables:**

- Responsive desktop and mobile MVP screen.
- Accessible controls with labels, keyboard focus, disabled states, and readable consequence text.
- Placeholder visual treatment consistent with the post-apocalyptic family theme.

**Exit criteria:**

- A new player can identify what to do without developer instructions.
- The primary loop is usable at narrow mobile widths and normal desktop widths.
- UI actions update the same state used by the simulation; no duplicated local game state exists.

### Phase 4: Events, Night Moments, and Report Card

**Purpose:** Add the decision layer that creates the family-versus-survival trade-off.

**Work items:**

- Author 5–8 MVP events with clear prerequisites, choices, costs, and rewards.
- Implement slower event scheduling with a three-minute baseline, a 45-second reactive cooldown, and condition triggers for low Fuel, open pickup exposure, and low Bond.
- Prevent duplicate active events and define what happens when an event is pending during a reload.
- Implement event choices as atomic state transitions with a result message.
- Implement automatic day rollover and queue a night-family moment once per day.
- Add two or three night choices that primarily affect bond and may trade against resources or efficiency.
- Implement report-card calculations from distance, exterior upgrade level, and average/current bond.
- Define the Legacy economy after cycle balancing: total credits generated in the run, threshold, average-bond multiplier, reset state, and permanent upgrade costs.

**Deliverables:**

- Event and night-moment content definitions.
- Event dialog, result feedback, and report-card UI.
- Tests for event prerequisites, one-time resolution, day rollover, and report-card tiers.

Phase 4 uses six authored road events, one queued night ritual per crossed day, and save version 3 for pending event/night decisions.

Generator cards use a 100 ms visual animation layer for smooth progress, while the economy remains discrete and only awards credits when a full cycle completes. Each card shows the live time remaining and a separate progress bar toward its next ownership milestone. Live Bond changes do not alter generator payout amounts, preventing income from drifting without a purchase or task change.

**Exit criteria:**

- A complete play session produces recurring decisions rather than only passive number changes.
- Every event choice has a visible and testable consequence.
- The report card is available at any time and does not require a separate ending flow.

### Phase 5: Balance, UX Hardening, and MVP QA

**Purpose:** Validate that the game loop is understandable, fair, and stable for short active sessions and idle returns.

**Work items:**

- Playtest 5–15 minute sessions and tune production, consumption, event frequency, upgrade costs, and bond effects.
- Verify that no single strategy dominates both survival and bond.
- Add clear low-resource warnings and explain gradual penalties before they become severe.
- Add number formatting, rate display, purchase affordability, and feedback for failed actions.
- Test active simulation, browser tab throttling, reloads, offline return, clock changes, and reset-save behavior.
- Display the live day countdown and verify empty Fuel stalls distance until the emergency decision or refill restores Fuel.
- Verify Fuel price escalation across multiple successful refuels and persisted reloads.
- Run lint, typecheck, production build, and manual responsive checks.
- Add lightweight browser smoke coverage if a browser test runner is introduced; otherwise document the manual smoke script.

**Deliverables:**

- Tuned MVP balance constants.
- QA checklist with pass/fail results.
- Production build that can be deployed as a static/client-rendered browser game within the existing Next.js app.

**Exit criteria:**

- No critical gameplay, hydration, persistence, or accessibility defects remain.
- A fresh save and a returning save both support the complete MVP loop.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

**QA results (current pass):**

- Automated balance guardrails pass: first-generator payback remains 30-90 seconds and fresh Fuel runway is at least 30 minutes.
- Automated state coverage passes for generator cycles, event choices, night choices, persistence, offline progress, affordability, and pending-decision precedence.
- `npm test` passes with 33 tests before the Phase 5.1 UI-only hardening batch.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.
- Headless Edge captured desktop and mobile viewport renders successfully; this environment cannot visually inspect the generated images, so final visual hierarchy and touch-target review remain manual QA items.
- HTTP smoke check returns status 200 from the Next development server. Hydrated client text is not exposed in the server DOM dump because the game shell is a client component; browser interaction remains a manual follow-up.

**Remaining manual QA:**

- Confirm desktop and mobile screenshots visually.
- Test keyboard focus order and modal focus behavior.
- Test localStorage reload, offline return, reset, and pending event recovery in a real browser session.
- Play a fresh 5-15 minute session and tune event frequency or generator values only if observed behavior differs from the guardrails.

### Phase 5.1: Decision and Release Hardening Batch

**Purpose:** Close the remaining interaction and accessibility gap identified during MVP review without expanding the game systems.

**Work items:**

- Keep road events and night rituals pending in game state while allowing the player to continue using the rest of the interface.
- Replace blocking decision overlays with a docked decision panel that can be deferred and reopened.
- Support Escape and explicit review-later controls without resolving the decision.
- Add dialog labels, non-modal semantics, initial focus when a decision opens, and a keyboard-accessible reopen control.
- Add regression coverage for pending-decision precedence and ensure automated checks remain green.
- Complete manual browser checks for responsive layout, keyboard navigation, persistence, offline return, reset, pending decision recovery, and a fresh 5-15 minute session.

**Deliverables:**

- Non-blocking decision interaction with documented defer/reopen behavior.
- Updated accessibility behavior for decision controls.
- Release QA checklist and results.

**Exit criteria:**

- A pending decision never prevents resource, task, generator, fuel, upgrade, or report-card controls from being used.
- Deferring a decision leaves it pending and makes it discoverable through the reopen control.
- Keyboard users can reach choices and defer the decision without a pointer.
- `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` pass.

**Batch status:** Implementation complete. Automated checks are tracked below; real-browser visual and persistence checks remain manual because this repository has no browser test runner.

### Phase 6: Legacy Prestige and Post-MVP Expansion

**Purpose:** Add the permanent Legacy meta-progression after the cycle-based economy has been measured and balanced, then expand content.

**Candidate work, in priority order:**

- Add Legacy reset at player choice or vehicle failure.
- Track total run production and average bond for Legacy rewards.
- Add persistent Legacy currency and permanent upgrades such as global production bonuses and upgrade discounts.
- Add the independent interior upgrade path.
- Add a separate physical-survival resource only if playtesting proves Fuel and Bond are not expressive enough.
- Add pair-specific bond values after validating the single bond meter.
- Replace geometric placeholders with a consistent final art direction.
- Add more event variety, character expressions, and scenery/parallax layers.
- Add descriptive ending tiers and optional narrative reports.
- Add audio polish using the existing road ambience and two music tracks.
- Evaluate Phaser or PixiJS only if CSS/HTML no longer handles the required visual complexity.
- Keep Capacitor, Electron, and Tauri packaging deferred until browser retention and balance are satisfactory.

Phase 6 browser implementation now includes Legacy reset/reward state, interior upgrade path, pair-specific Bond values, additional night choices, character mood inputs from pair Bond, and fuel-sensitive audio ambience. Packaging remains excluded.

**Exit criteria:**

- Each expansion has a demonstrated player or retention benefit and does not weaken the one-place, decision-focused design pillars.

Current Phase 6 preparation includes browser-safe playback for `road-sound.mp3`, `music-1.mp3`, and `music-2.mp3`, plus a richer geometric placeholder scene. Packaging remains explicitly deferred.

The scene interaction pass adds assignment-driven walking/work states, family meeting poses for events and night rituals, and contextual speech bubbles.

## 9. Mechanics Expansion Plan

The next mechanics batch adds depth to the existing decision loop without introducing manual driving, free exploration, or a second resource economy. Each phase is independently testable and builds on the previous phase.

### Phase 7: Character Energy and Task Trade-offs

**Purpose:** Make character assignments meaningful over time and give the existing `rest` task a real strategic role.

**Work items:**

- Consume character energy while working and recover it while resting.
- Scale task effectiveness through high, normal, low, and exhausted energy bands.
- Apply task-specific costs and benefits: repair/trade/connect improve production or bond while consuming energy; drive protects travel; rest restores energy and bond.
- Show each character's energy, current task effect, and tired state in the task panel and scene.
- Persist energy through the versioned save schema and test clamping, recovery, and output penalties.

**Exit criteria:**

- Energy changes deterministically from elapsed time.
- Exhausted characters cannot silently provide full task bonuses.
- Resting is a viable alternative to continuous production.

### Phase 8: Short-term Journey Objectives

**Purpose:** Give active players a reason to make a decision during each short session.

**Work items:**

- Define a small deterministic roster of objectives based on credits, distance, fuel discipline, bond, and upgrades.
- Track one active objective, progress, completion, and reward claim state.
- Show objective progress and the next reward in the main decision interface.
- Resolve objective rewards atomically and write a memory entry when an objective is completed.
- Persist objective state and test progress across ticks, reloads, and offline processing.

**Exit criteria:**

- A fresh run receives an understandable objective.
- Objectives complete through normal play rather than requiring special hidden actions.
- Rewards cannot be claimed twice.

### Phase 9: Route Selection

**Purpose:** Turn distance into an occasional strategic choice while preserving automatic vehicle movement.

**Work items:**

- Add Safe, Ruins, and Community route profiles with distinct fuel, credit, distance, bond, and event-risk modifiers.
- Offer route selection at settlement decisions and allow the current route to be inspected between decisions.
- Apply route modifiers in the simulation and event scheduler without changing generator ownership rules.
- Add route consequences to the decision UI and tests for switching, persistence, and fuel depletion.

**Exit criteria:**

- Each route has a visible trade-off rather than a dominant best choice.
- The player never manually steers or controls movement.
- Route state survives reload and offline progress.

### Phase 10: Settlement Milestones

**Purpose:** Give distance a readable sense of place and create a natural cadence for route decisions.

**Work items:**

- Define named settlements at deterministic distance thresholds.
- Queue one settlement arrival at a time when a threshold is crossed.
- Give each arrival a small reward and a route choice with no duplicate rewards after reload.
- Show the current settlement progress in the resource header and scene.
- Record arrivals as family memories and test threshold crossing, pending precedence, and recovery.

**Exit criteria:**

- Distance produces recognizable milestones beyond a score increase.
- Settlement rewards are atomic and idempotent.
- A pending settlement never spams or replaces an unresolved event/night decision.

### Phase 11: Family Memory Log

**Purpose:** Make the family story persist through the player's decisions without requiring branching cutscenes.

**Work items:**

- Add a bounded chronological memory log for resolved events, night choices, objectives, routes, and settlements.
- Display the latest memories in the report card with a readable empty state.
- Use concise authored text with dynamic values only where useful.
- Persist and validate the log, trimming old entries deterministically.
- Add tests for ordering, limits, save round trips, and reset/prestige behavior.

**Exit criteria:**

- Important decisions leave a visible trace in the journey report.
- The log remains small enough for localStorage and readable on mobile.
- Reset starts a new journey log while Legacy persists across prestige.

**Recommended execution order:** Phase 7, Phase 8, Phase 9, Phase 10, Phase 11. Run automated checks after each phase and complete the existing real-browser QA batch after all five phases.

**Current implementation status:** Phases 7-11 are implemented in the browser game and covered by automated state, simulation, persistence, and UI-facing store tests. Real-browser QA remains intentionally deferred.

### Phase 12: UI Component Extraction and Maintainability

**Purpose:** Break the large game shell and dense UI sections into focused, reusable components without changing gameplay behavior, visual language, or state ownership.

**Architecture rules:**

- Components render state and dispatch store actions; simulation and progression rules remain in `lib/game`.
- Each extracted component owns one visual responsibility and has a small, explicit prop surface where possible.
- Shared display primitives should not know about Convoy-specific game rules.
- Keep the existing responsive layout and accessibility semantics unchanged during extraction.
- Prefer composition through props over duplicating `useGameStore()` subscriptions in deeply nested components.

**Phase 12.1: Shared Display Primitives**

- Extract `ResourceStat` from `game-shell.tsx` into `resource-stat.tsx`.
- Extract the warning row into `game-warning-bar.tsx`.
- Add shared primitives for section headings, progress bars, and compact value rows only where at least two panels use the same structure.
- Keep number formatting and tone classes centralized rather than redefining them in each panel.

**Phase 12.2: Shell and Header**

- Extract the top header into `game-header.tsx`.
- Extract the resource strip into `resource-bar.tsx`.
- Extract reset confirmation into `reset-journey-dialog.tsx`.
- Keep hydration/loading behavior and the game-loop activation in `game-shell.tsx`.

**Phase 12.3: Gameplay Panels**

- Split `task-panel.tsx` into `character-task-row.tsx` and a task-panel container.
- Split `generator-panel.tsx` into generator list, generator card, purchase quantity control, and generator progress components.
- Split `fuel-panel.tsx` into fuel summary, refill controls, and purchase feedback components.
- Split `upgrade-panel.tsx` and `interior-panel.tsx` into reusable upgrade card/action components where their contracts match.
- Keep all action result handling at the panel/container boundary so feedback remains consistent.

**Phase 12.4: Decisions and Progression**

- Split `decision-dialogs.tsx` into decision surface, decision choice, pending-decision trigger, and focus behavior helpers.
- Split `journey-objective.tsx` into objective progress, current-route summary, and settlement route-choice sections.
- Split `report-card.tsx` into score summary and family-memory list.
- Split `legacy-panel.tsx` into Legacy summary and prestige action sections.
- Preserve non-blocking decision behavior and keyboard interactions from Phase 5.1.

**Phase 12.5: Scene and Audio Boundaries**

- Split `convoy-scene.tsx` into background layers, vehicle shell, character actor, and speech-bubble components.
- Keep scene animation state derived from game state; do not move simulation logic into visual actors.
- Keep `audio-controller.tsx` as the browser side-effect boundary, extracting only control presentation if it improves readability.

**Phase 12.6: Verification and Cleanup**

- Add component-level tests only for non-trivial rendering branches and keyboard interactions; keep formula coverage in `lib/game` tests.
- Verify no component introduces duplicated game state or subscriptions that disagree with the store.
- Run lint, typecheck, production build, and existing unit tests after each extraction batch.
- Complete manual responsive and keyboard QA after the full extraction.
- Remove only obsolete local helpers and imports; avoid unrelated styling or naming changes.

**Deliverables:**

- A thin `game-shell.tsx` responsible for composition, hydration, loop startup, and page-level layout.
- Focused Convoy components with clear names and maintainable file sizes.
- Shared UI primitives used consistently across panels.
- No gameplay behavior changes.

**Exit criteria:**

- `game-shell.tsx` contains composition and page orchestration, not detailed panel markup.
- Each extracted component has one primary responsibility and a testable boundary.
- Existing automated tests and production checks pass unchanged.
- Desktop/mobile layout and decision keyboard behavior remain equivalent to the pre-extraction implementation.

**Recommended execution order:** Phase 12.1, Phase 12.2, Phase 12.3, Phase 12.4, Phase 12.5, Phase 12.6. Commit each batch separately so UI regressions can be isolated.

**Current implementation status:** Phase 12.1 through 12.5 are implemented, including separate car, scenery, vehicle actor, generator card, task row, objective, route-choice, memory, header, resource, warning, and reset-dialog components. Phase 12.6 verification is in progress; behavior and styling are intentionally unchanged.

**Component directory convention:** Convoy UI is grouped under `components/convoy` by responsibility: `layout/` for shell and page chrome, `scene/` for scenery and vehicle actors, `panels/` for gameplay controls, `progression/` for objectives/report/Legacy, `dialogs/` for decision and reset surfaces, and `feedback/` for audio/offline feedback. Shared shadcn primitives remain in `components/ui/`.

## 5. Core Rules to Implement

### Resource and Cycle Simulation

For each simulation interval:

```text
cycleDuration = baseCycleDuration / milestoneTimeMultiplier
cycleProgressNext = cycleProgressCurrent + elapsedSeconds
completedCycles = floor(cycleProgressNext / cycleDuration)
cycleProgressRemainder = cycleProgressNext % cycleDuration
production = completedCycles * owned * outputPerCycle
modifiedProduction = production * characterTaskModifiers * bondModifiers
consumption = baseConsumption * elapsedSeconds
resourceNext = clamp(resourceCurrent + modifiedProduction - consumption, 0, capacity)
distanceNext = distanceCurrent + effectiveTravelRate * elapsedSeconds
bondNext = clamp(bondCurrent + bondDelta * elapsedSeconds, 0, 100)
```

The implementation should use floating-point values internally and format values for display. It should not depend on a fixed render frame rate. Offline processing uses `elapsedSeconds * offlineMultiplier` as effective generator-cycle time while applying normal consumption and preserving the remainder.

### Generator Pricing

```text
nextPrice = basePrice * growth ^ owned
bulkPrice(quantity) = sum(price for each purchase in the quantity)
```

`xMax` must calculate the largest affordable quantity without looping forever or spending more than the player owns.

### Offline Progress

```text
offlineSeconds = min(max(now - lastSeenTimestamp, 0), 10 hours)
effectiveCycleTime = offlineSeconds * 0.60
offlineGain = completedCycles(effectiveCycleTime) * owned * outputPerCycle
```

Offline processing must be idempotent: loading the same saved state twice must not award the same offline gain twice.

## 6. Testing Strategy

- Unit test pure formulas and state transitions before styling the UI.
- Test boundary values: zero resources, full capacity, bond 0 and 100, no affordable purchase, maximum affordable purchase, and day rollover exactly at the boundary.
- Test persistence with missing, malformed, old-version, future-version, and valid saves.
- Test offline caps and negative/invalid system-clock deltas.
- Test cycle completion, partial cycle remainder, milestone cycle halving, and long-duration offline cycle resolution.
- Test event choices as deterministic state transitions.
- Manually smoke-test a fresh browser profile, reload, close/reopen, mobile layout, keyboard navigation, and dark/light theme behavior.
- Run `npm run lint`, `npm run typecheck`, and `npm run build` at the end of every major phase from Phase 1 onward.

## 7. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Balance feels like a spreadsheet | Make rates, consequences, and next decisions visible; playtest short sessions early |
| Idle loop runs too fast or too slowly | Centralize constants and use elapsed-time simulation tests |
| Duplicate rewards after reload | Save only the timestamp before applying offline gains, then persist the resulting state atomically |
| Browser throttling creates giant active ticks | Cap active tick deltas and rely on the offline calculation after a real absence |
| Hydration mismatch from localStorage | Load client state after mount and render a stable loading shell |
| Event or modal blocks play | Keep the clock running and store pending decisions separately from the simulation |
| Placeholder art hides usability issues | Validate hierarchy and interactions before commissioning final art |
| Scope expands into a full engine | Enforce the MVP list and defer Phaser/PixiJS until a concrete visual requirement exists |

## 8. Recommended Execution Order

1. Complete Phase 0 and agree on balance values.
2. Implement and test the deterministic simulation in Phase 1.
3. Add persistence and offline calculations in Phase 2.
4. Build the scene and control surfaces in Phase 3.
5. Add authored events, night moments, and report card in Phase 4.
6. Playtest, tune, and harden the MVP in Phase 5.
7. Start Phase 6 only after the MVP exit criteria are met.
