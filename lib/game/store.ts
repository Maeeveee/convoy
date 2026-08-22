import { create } from "zustand"

import {
  CHARACTER_IDS,
  EXTERIOR_BY_LEVEL,
  FUEL_PRICE_PER_UNIT,
  GENERATORS,
  INITIAL_CAPACITIES,
  INITIAL_RESOURCES,
  SAVE_VERSION,
} from "./constants"
import { bulkGeneratorPrice, resolvePurchaseQuantity } from "./generators"
import { buyExteriorUpgrade } from "./progression"
import { simulate } from "./simulation"
import type {
  ActionResult,
  CharacterId,
  GameState,
  GeneratorId,
  OfflineSummary,
  PurchaseQuantity,
  TaskId,
} from "./types"

export type GameStore = GameState & {
  isHydrated: boolean
  offlineSummary: OfflineSummary | null
  tick: (elapsedSeconds: number) => void
  hydrate: (state: GameState, summary: OfflineSummary) => void
  dismissOfflineSummary: () => void
  assignTask: (character: CharacterId, task: TaskId) => ActionResult
  buyGenerator: (
    generator: GeneratorId,
    quantity: PurchaseQuantity,
  ) => ActionResult
  buyExterior: (target: "emergencyTarp" | "enclosedVan") => ActionResult
  buyFuel: (amount: number) => ActionResult
  reset: () => void
}

export function createInitialState(now = Date.now()): GameState {
  return {
    saveVersion: SAVE_VERSION,
    resources: { ...INITIAL_RESOURCES },
    capacities: { ...INITIAL_CAPACITIES },
    characters: {
      father: { id: "father", task: "drive", energy: 100 },
      mother: { id: "mother", task: "trade", energy: 100 },
      child: { id: "child", task: "connect", energy: 100 },
    },
    generators: Object.fromEntries(
      Object.keys(GENERATORS).map((id) => [id, { id, owned: 0, cycleProgressSeconds: 0 }]),
    ) as GameState["generators"],
    exterior: { level: 1, id: EXTERIOR_BY_LEVEL[0] },
    bond: 62,
    distance: 0,
    elapsedSeconds: 0,
    day: 1,
    lastSeenTimestamp: now,
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  isHydrated: false,
  offlineSummary: null,
  tick: (elapsedSeconds) => set((state) => simulate(state, elapsedSeconds)),
  hydrate: (state, summary) =>
    set({
      ...state,
      isHydrated: true,
      offlineSummary: summary.offlineSeconds > 1 ? summary : null,
    }),
  dismissOfflineSummary: () => set({ offlineSummary: null }),
  assignTask: (character, task) => {
    if (!CHARACTER_IDS.includes(character)) {
      return { ok: false, reason: "Unknown character." }
    }
    set((state) => ({
      characters: {
        ...state.characters,
        [character]: { ...state.characters[character], task },
      },
      lastSeenTimestamp: Date.now(),
    }))
    return { ok: true }
  },
  buyGenerator: (generator, requestedQuantity) => {
    const state = get()
    const quantity = resolvePurchaseQuantity(state, generator, requestedQuantity)
    if (quantity < 1) return { ok: false, reason: "Not enough Trade Credits." }
    const cost = bulkGeneratorPrice(
      generator,
      state.generators[generator].owned,
      quantity,
    )
    if (cost > state.resources.credits) {
      return { ok: false, reason: "Not enough Trade Credits." }
    }
    set({
      resources: {
        ...state.resources,
        credits: state.resources.credits - cost,
      },
      generators: {
        ...state.generators,
        [generator]: {
          ...state.generators[generator],
          owned: state.generators[generator].owned + quantity,
        },
      },
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true, amount: quantity }
  },
  buyExterior: (target) => {
    const result = buyExteriorUpgrade(get(), target)
    if (result.result.ok) set(result.state)
    return result.result
  },
  buyFuel: (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, reason: "Enter a valid fuel amount." }
    }
    const state = get()
    const availableCapacity = state.capacities.fuel - state.resources.fuel
    const fuel = Math.min(Math.floor(amount), Math.floor(availableCapacity))
    const cost = fuel * FUEL_PRICE_PER_UNIT
    if (fuel < 1) return { ok: false, reason: "Fuel tank is already full." }
    if (cost > state.resources.credits) {
      return { ok: false, reason: "Not enough Trade Credits." }
    }
    set({
      resources: {
        ...state.resources,
        fuel: state.resources.fuel + fuel,
        credits: state.resources.credits - cost,
      },
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true, amount: fuel }
  },
  reset: () =>
    set({ ...createInitialState(), isHydrated: true, offlineSummary: null }),
}))
