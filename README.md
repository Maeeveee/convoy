# Convoy

Convoy is a browser-based family survival idle game. Father, Mother, and Child live in a pickup truck that moves automatically through a post-apocalyptic city. The player manages resources, assigns family tasks, responds to events, and chooses how the journey develops.

The game is built around short active sessions of five to fifteen minutes, with progress continuing while the browser tab remains open or while the player is away.

## Features

- Automatic vehicle travel and distance progression
- Fuel and Trade Credits management
- Eight cycle-based generators with bulk purchases and milestones
- Family task assignment with character energy and rest mechanics
- Combined family bond and pair-specific bond values
- Road events and night family decisions
- Non-blocking decision panels that can be deferred and reopened
- Short-term journey objectives with rewards
- Safe, Ruins, and Community routes
- Named settlement milestones with route choices
- Exterior and interior vehicle upgrades
- Legacy prestige and persistent meta-progression
- LocalStorage saves with capped offline progress
- Family memory log shown in the journey report
- CSS-based vehicle, character, scenery, and road animation
- Optional road ambience and journey music
- First-run onboarding guide for new players

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Zustand
- Tailwind CSS 4
- shadcn/ui primitives
- Vitest
- pnpm 11

The project uses `pnpm@11.22.0`, declared in `package.json`. Use pnpm consistently rather than mixing npm and pnpm lockfiles.

## Getting Started

Requirements:

- Node.js 20 or newer
- pnpm 11

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Commands

```bash
pnpm dev          # Start the Next.js development server
pnpm build        # Create a production build
pnpm start        # Start the production server
pnpm test         # Run the Vitest suite
pnpm run lint     # Run ESLint
pnpm run typecheck # Run the TypeScript compiler without emitting files
pnpm run format   # Format TypeScript and TSX files
```

The current automated suite covers simulation, generator pricing, events, persistence, offline progress, progression, objectives, routes, energy, and settlement behavior.

## Project Structure

```text
app/
  page.tsx                 # Application entry point
  globals.css              # Global theme and scene styling

components/
  ui/                      # Shared shadcn/ui primitives
  convoy/
    layout/                # Game shell, header, resources, warnings
    scene/                 # Scenery, vehicle, and character actors
    panels/                # Fuel, tasks, generators, and upgrades
    progression/           # Objectives, routes, Legacy, reports, memories
    dialogs/               # Events, night decisions, and reset surfaces
    feedback/              # Offline summary and audio controls

hooks/
  use-game-loop.ts         # Active simulation loop
  use-hydrated-game.ts     # Save hydration and offline progress

lib/game/
  constants.ts             # Balance values and content definitions
  events.ts                # Event and night choice content
  generators.ts            # Generator pricing and milestone formulas
  persistence.ts           # Save validation and offline processing
  progression.ts           # Upgrades, Legacy, and report calculations
  simulation.ts            # Deterministic time-based simulation
  store.ts                 # Zustand game store and actions
  types.ts                 # Domain and persistence types
  __tests__/               # Deterministic game-rule tests

public/sound/              # Road ambience and music tracks
PROJECT.md                 # Game design document
IMPLEMENTATION_PLAN.md     # Development phases and QA status
```

## Game Design

Convoy intentionally keeps the player in one place. There is no manual driving, map exploration, or looting minigame. The vehicle and family continue working automatically while the player makes management decisions.

The main design tension is survival efficiency versus family warmth. Assignments, routes, upgrades, events, and night choices should create trade-offs rather than one permanently dominant strategy.

See [PROJECT.md](./PROJECT.md) for the full design document and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the implementation history, current phases, and QA notes.

## Persistence

Game progress is stored locally in the browser under the `convoy-save` key. Saves include a versioned schema, current-run progression, pending decisions, objectives, routes, settlement state, and family memories.

New players receive a short first-run field guide covering movement, resources, family assignments, and road decisions. Completing or skipping the guide is stored separately from the game save, so returning players go directly to their journey.

Offline progress is capped at ten hours and generator production runs at sixty percent effective time while away. Bond does not gain offline.

## Verification

Before publishing changes, run:

```bash
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run build
```

Real-browser QA is still required for visual responsive checks, keyboard navigation, LocalStorage reloads, offline return behavior, and a complete five-to-fifteen-minute play session.
