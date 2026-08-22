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

**MVP recommendation:** React + Zustand + CSS animation/Framer Motion. Phaser or PixiJS should only be introduced when the visual requirements justify it.

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

**Recommendation:** Start with geometric placeholders (colored shapes and labels) to validate the game systems. Move to Option A, B, or C after the core loop feels good.

---

## 5. Scene Structure

**Main layout: single screen, side-view cutaway**

```text
[ Sky and ruined-city background - slow parallax scroll ]
[ Front of pickup ] [ Cabin/bed - main interactive area ] [ Rear section ]
    Father (driver's seat, although the player does not steer)
    Mother and Child (cabin/bed positions change with assigned tasks)
[ Resource bar: Fuel, Provisions, Spare Parts, Bond ]
[ Upgrade panel: exterior/interior, accessed through separate tabs or buttons ]
```

The road background scrolls slowly and loops horizontally. The MVP only needs one or two parallax layers: the road and distant ruined buildings.

---

## 6. Core Systems

### 6.1 Resources (Idle Layer)

| Resource | Purpose | Change |
|---|---|---|
| Fuel | Keeps the vehicle moving; empty fuel triggers emergency events | Decreases over time; restored by generators and events |
| Food and water | Represents the family's physical condition | Combined into Provisions for the MVP; decreases over time and is restored by generators |
| Spare Parts | Main currency for vehicle upgrades and generator purchases | Produced by generators and events |
| Distance | Passive progress and score | Increases automatically with time |

### 6.1a Generator System

Generators are repeatable purchases inspired by classic idle incrementals such as *AdVenture Capitalist*. Each generator has an increasing price and produces resources automatically through discrete production cycles. There is no manual collection and no separate manager system.

**Generator roster**

| Generator | Theme | Resource | Base cycle | Output/cycle |
|---|---|---|---:|---:|
| Father's Toolkit | Small daily repairs | Spare Parts | 10 sec | 1 |
| Emergency Cans | Mother's emergency stores | Provisions | 30 sec | 1 |
| Hand Radio | Bartering information with survivors | Spare Parts | 2 min | 3 |
| Truck-Bed Garden | Growing emergency vegetables | Provisions | 3 min | 3 |
| Water Purifier | Filtering questionable water | Provisions | 5 min | 5 |
| Backup Battery | Additional energy storage | Fuel | 10 min | 2 |
| Mini Generator | Additional electricity | Fuel | 20 min | 5 |
| Child's Barter Network | The child's radio relationships | Spare Parts | 1 hour | 20 |

**Generator mechanics**

- Price increases exponentially: `next_price = base_price * growth^owned`.
- When a cycle completes, it produces `owned * output_per_cycle` of its resource.
- Partial cycle progress is preserved across active ticks, tab closing, reloads, and offline processing.
- Purchase quantities are **x1 / x10 / x25 / Next / xMax**. `Next` buys exactly enough units to reach the next milestone.
- Milestones occur at **25 / 50 / 100 / 200**, then every 100 units.
- Each reached milestone halves that generator's cycle duration. Milestones affect timing, not output per cycle, so their benefit is clear without multiplying the economy twice.

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
Legacy earned = floor(sqrt(total spare parts generated during the run / threshold) * bond multiplier)
```

The threshold must be chosen after the cycle-based generator economy has been balanced. The bond multiplier should use the run's average Bond Meter, rewarding a family that stayed united rather than only optimizing resources.

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
| Mother | Converts raw resources into provisions/medicine and handles simple crafting |
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

- Events appear periodically or when resource and exterior conditions trigger them.
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
2. Three resource groups: Fuel, Provisions, and Spare Parts, plus one combined Bond meter.
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
- Show a short return summary such as `While you were away: +120 Spare Parts, +40 Fuel`.

### 9.4 Endings and Variations

For solo development, avoid complex branching narrative endings early:

- **MVP:** Endless mode with a report card combining distance, vehicle upgrade level, and bond.
- **Later:** Two or three descriptive tiers based on final numbers, shown as text rather than separate cutscenes.
- **Later:** Legacy prestige resets and permanent meta-upgrades after the cycle economy has been balanced.
