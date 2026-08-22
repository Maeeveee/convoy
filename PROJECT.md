# Game Design Document
## Working Title: Convoy - Family Survival Idle Game

---

## 1. Concept Summary

A small family (Father, Mother, Child) lives in a pickup truck that keeps moving through a post-apocalyptic city. The player does **not control the vehicle**. The vehicle moves automatically as a representation of time and progress. The focus is **resource management (idle/incremental)** and **maintaining family relationships**, presented in one relatively static visual scene.

**Genre:** Idle/Incremental + Family Simulation (narrative-light)
**Perspective:** 2D side-view/cutaway, similar to a cross-section diagram of a vehicle
**Platform:** Web browser
**Target sessions:** Short 5-15 minute sessions or passive idle play in an open tab

---

## 2. Design Pillars

These principles guide every design decision. If a feature does not support one of them, it is probably scope creep:

1. **One place, not exploration:** Everything happens in or around the vehicle. The outside world reaches the player through events, radio, and scrolling scenery.
2. **Decisions, not actions:** There is no manual looting or movement control. The player assigns tasks, responds to dialogue, and chooses upgrade priorities while the system executes the work.
3. **Family versus survival trade-offs:** Survival efficiency and family warmth pull against each other. No solution should win in every dimension.

---

## 3. Platform and Technical Recommendation

### Why Web-Based

- No app-store distribution is required; the game can be shared by link.
- Development, playtesting, and iteration are fast.
- The game can later be wrapped with Capacitor or Electron/Tauri without a major rewrite.

### Tech Stack Options

| Need | Recommendation | Reason |
|---|---|---|
| Scene rendering and light animation | **HTML/CSS + a little Canvas**, or **React + Framer Motion** | A static scene with a few animated characters and scrolling layers does not need a full game engine. |
| State management | **React + Zustand/Context**, or a vanilla JS class-based state model | The game has many values and flags, so state needs a clear structure. |
| More game-engine-like visuals later | **Phaser 3** or **PixiJS** | Optional; only relevant if the visual layers and animation become significantly more complex. |
| Data persistence | **localStorage** | This is a single-player game with no initial need for a backend. |

**MVP recommendation:** React + Zustand + CSS animation/Framer Motion. Phaser or PixiJS should only be introduced when the visual requirements justify it. Mobile/desktop packaging is explicitly deferred for now.

---

## 4. Visual Asset Strategy

Because the game has one main scene and a small number of character states, three realistic asset paths are available:

### Option A - Ready-Made Asset Pack

- Sources include [Kenney.nl](https://kenney.nl) (free, CC0) and 2D post-apocalyptic asset packs from itch.io.
- Fastest when gameplay is the priority.
- Risk: the visual style may feel generic or not fully match the intended atmosphere.

### Option B - AI-Generated Art with Manual Editing

- Generate base art for characters, backgrounds, and resource icons, then unify the palette, outline, and proportions manually.
- Fast for exploring visual direction.
- Risk: consistency across characters, expressions, and vehicle upgrade stages requires additional editing.

### Option C - Simple Custom Vector/Flat Illustration

- Flat vector art is cheaper to create and maintain than detailed pixel art.
- Characters only need a few expression states: neutral, happy, sad, and sick.
- Best fit for a clean, consistent visual identity.

**Recommendation:** Start with geometric placeholders (colored shapes and labels) to validate the game systems. The current placeholder scene is intentionally improved with layered skyline silhouettes, lights, atmospheric dust, vehicle trim/cargo details, and readable character silhouettes. Move to Option A, B, or C after the core loop feels good.

### Audio Assets

The current audio pass uses the existing files in `public/sound`:

- `road-sound.mp3` for looping road ambience
- `music-1.mp3` and `music-2.mp3` for alternating journey music

Audio starts only after the player activates the sound control because browsers block unsolicited autoplay. Music ducks while an event or night decision is open.

---

## 5. Scene Structure

**Main layout: single screen, side-view cutaway**

```text
[ Sky and ruined-city background - slow parallax scroll ]
[ Front of pickup ] [ Cabin/bed - main interactive area ] [ Rear section ]
    Father (driver's seat, although the player does not steer)
    Mother and Child (cabin/bed positions change with assigned tasks)
[ Resource bar: Fuel, Trade Credits, Bond ]
[ Upgrade panel: exterior/interior, accessed through separate tabs or buttons ]
```

The road background scrolls slowly and loops horizontally. The MVP only needs one or two parallax layers: the road and distant ruined buildings.

---

## 6. Core Systems

### 6.1 Resources (Idle Layer)

| Resource | Purpose | Change |
|---|---|---|
| Fuel | Keeps the vehicle moving; empty fuel slows travel and can trigger emergency events | Decreases over time; purchased with Trade Credits or awarded by events |
| Trade Credits | Universal currency for generators, fuel, and vehicle upgrades | Produced by every generator and some events |
| Distance | Passive progress and score | Increases automatically with time |

The MVP intentionally omits food, water, and spare parts as separate resources. A single universal currency makes generator value easy to compare and creates one clear decision: reinvest credits into production, buy fuel to keep moving, or save for a vehicle upgrade.

### 6.1a Generator System

Generators are repeatable purchases inspired by classic idle incrementals such as *AdVenture Capitalist*. Each generator has an increasing price and produces resources automatically through discrete production cycles. There is no manual collection and no separate manager system.

**Generator roster**

| Generator | Theme | Base cycle | Credits/cycle | Base price |
|---|---|---|---:|---:|
| Father's Toolkit | Paid repair work | 10 sec | 4 | 25 |
| Emergency Cans | Trading managed emergency stock | 30 sec | 30 | 75 |
| Hand Radio | Bartering information with survivors | 2 min | 400 | 250 |
| Truck-Bed Garden | Trading mobile-grown produce | 3 min | 1,200 | 500 |
| Water Purifier | Trading safe filtered water | 5 min | 4,000 | 1,000 |
| Backup Battery | Selling stored energy and charging access | 10 min | 16,000 | 2,000 |
| Mini Generator | Selling dependable mobile power | 20 min | 80,000 | 5,000 |
| Child's Barter Network | The child's long-distance trade relationships | 1 hour | 600,000 | 12,000 |

**Generator mechanics**

- Every generator uses a shared 10% price growth: `next_price = base_price * 1.10^owned`.
- When a cycle completes, it produces `owned * credits_per_cycle` Trade Credits.
- Partial cycle progress is preserved across active ticks, tab closing, reloads, and offline processing.
- Purchase quantities are **x1 / x10 / x25 / Next / xMax**. `Next` buys exactly enough units to reach the next milestone.
- Milestones occur at **25 / 50 / 100 / 200**, then every 100 units.
- Each reached milestone halves that generator's cycle duration. Milestones affect timing, not output per cycle, so their benefit is clear without multiplying the economy twice.
- The card shows two independent indicators: smooth current-cycle progress with a live countdown, and ownership progress toward the next milestone.
- The starting state is 150 Trade Credits and 60/100 Fuel, allowing an immediate first purchase.
- Early generator purchases target a payback period of roughly 30-90 seconds before task and bond modifiers.

**Fuel purchase**

- Fuel costs 2.5 Trade Credits per unit in the first balance pass.
- Fuel price increases by 8% after each successful refill transaction: `current_price = 2.5 * 1.08^refill_count`.
- The player may buy 10, 25, or enough Fuel to fill the tank.
- Fuel is never generated automatically by normal generators.
- When Fuel reaches zero, distance stops completely and an emergency event offers recovery choices. The emergency event is cooldown-protected so an unresolved fuel problem does not repeat every second.

**Relationship to other systems**

- Generators provide continuous micro-progression through completed cycles.
- Major exterior and interior vehicle upgrades are macro-progression purchased with accumulated generator income.
- The intended pattern is many small sources that grow over time and fund occasional large jumps.

### 6.1b Prestige System - Legacy

When the vehicle breaks down beyond repair, or when the player chooses to reset, the family begins a new journey with a different vehicle. The family keeps the hard-earned wisdom of previous journeys as a permanent currency called **Legacy**.

**Reset trigger:** The player may trigger a reset at any time. A deeper run should produce a more valuable reset.

**Reset:**

- All generator ownership and run-specific generator progression
- Current resources
- Exterior and interior vehicle upgrades
- Character delegation/task assignments
- Current-run production and relationship history

**Persists:**

- Unspent Legacy currency
- Permanent meta-upgrades purchased with Legacy

**Proposed reward formula:**

```text
Legacy earned = floor(sqrt(total Trade Credits generated during the run / threshold) * bond multiplier)
```

The threshold must be chosen after the cycle-based generator economy has been balanced. The Legacy bond multiplier should use the run's average Bond Meter, rewarding a family that stayed united rather than only optimizing resources. Live Bond does not continuously alter generator cycle payouts; generator output stays stable until ownership, milestones, or task assignments change.

**Legacy spending:** Permanent upgrades may include global generator production bonuses, cycle-time reductions, or discounts on vehicle upgrades. These upgrades persist across future runs.

### 6.2 Bond Meter (Relationship Layer)

- Each pair of characters may eventually have a separate value, but the MVP uses one combined family bond from 0 to 100.
- Bond increases through interaction, comfort, and required night-family moments.
- Bond gradually decreases when ignored and can drop sharply through overwork trade-offs.
- Low bond reduces related work efficiency as a gradual penalty; it is not an immediate game over.

### 6.3 Character Roles

| Character | Idle function |
|---|---|
| Father | Driving and repair efficiency; affects fuel consumption and emergency repair speed |
| Mother | Manages trade inventory and improves Trade Credit production |
| Child | Main bond generator; can help with low efficiency but becomes tired faster |

### 6.4 Vehicle Upgrades (Two Paths)

**Exterior: protection and capacity**

1. Open pickup (starting tier)
2. Emergency tarp/canvas
3. Fully enclosed container/van

**Interior: efficiency and comfort**

1. Emergency setup: mattress and portable stove
2. Semi-livable: bed and mini kitchen
3. Comfortable: divider, clear radio, and organized storage

The two paths are independent. Players can prioritize either path and create different strategies across runs.

### 6.5 Event System

- Events appear slowly on a three-minute baseline or react to conditions such as low Fuel, an exposed open pickup, or low Bond. Reactive events have a cooldown so a single condition cannot spam the player.
- Each event is a short dialogue choice with two or three options. There are no minigames or manual controls.
- Event frequency and danger are influenced by the exterior vehicle state; an open pickup is more exposed and risky.

### 6.6 Day Cycle

- **Morning:** Assign tasks to each character.
- **Day and afternoon:** Events appear while resources and generator cycles continue.
- **Night:** An automatic family ritual provides the main active source of bond.

---

## 7. Progression and End States

The game is not a binary win/loss experience. Outcomes combine survival and relationship results after a number of days, or continue indefinitely in endless mode:

- **Full Survivor:** Fully upgraded vehicle and high bond.
- **Barely Making It:** The family survives with minimal resources and vehicle progress.
- **Broken but Alive:** The family survives physically but has low family bond.
- **Endless mode (optional):** No fixed ending; score combines distance and average bond.

---

## 8. MVP Scope

To avoid overscoping, the MVP includes:

1. One static scene with simple scrolling background.
2. Fuel and Trade Credits, plus one combined Bond meter.
3. Assignable character tasks without deep submenus.
4. Five to eight dialogue events to validate the loop.
5. One upgrade path first: exterior, with three stages from pickup to tarp to van.
6. Geometric placeholder visuals before final art.
7. Cycle-based generator production with persisted partial progress.

After the loop feels good, expand to the interior path, more events, character expressions, final assets, and Legacy prestige.

---

## 9. Time, Upgrades, and Offline Progress (Finalized)

### 9.1 Instant Upgrades

Exterior and interior purchases resolve immediately. There is no construction bar or wait timer. Resource generation, generator cycles, and the day cycle are time-based; upgrades are not.

### 9.2 Time Cycle

- Resources update automatically while the game is open through completed generator cycles and consumption.
- One in-game day is a fixed real-time interval, initially 3-5 minutes.
- A night ritual appears automatically at each day boundary. The player can answer it later and the game does not pause.
- Character assignments can be changed at any time.

### 9.3 Offline Progress

- Save `lastSeenTimestamp` in localStorage whenever state is saved or the page is closed.
- On return, calculate `delta_time = now - lastSeenTimestamp`.
- Resolve generator cycles using 60% effective offline time, preserving each generator's partial cycle progress.
- Apply the recommended offline cap of 10 hours; excess time is ignored.
- Bond does not increase offline and remains stable rather than suffering a large decay.
- Show a short return summary such as `While you were away: +1,200 Trade Credits, -18 Fuel`.

### 9.4 Endings and Variations

For solo development, avoid complex branching narrative endings early:

- **MVP:** Endless mode with a report card combining distance, vehicle upgrade level, and bond.
- **Later:** Two or three descriptive tiers based on final numbers, shown as text rather than separate cutscenes.
- **Later:** Legacy prestige resets and permanent meta-upgrades after the cycle economy has been balanced.
- **Deferred:** Capacitor, Electron, and Tauri packaging.
- Phase 6 currently includes Legacy reset/rewards, interior upgrades, pair-specific Bond values, extra night choices, and Fuel-sensitive road ambience. Packaging remains deferred.
- Characters now visibly walk or work based on assignments, gather when an event or night ritual is active, and show short contextual speech bubbles.
