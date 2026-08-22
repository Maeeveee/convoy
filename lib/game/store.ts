import { create } from "zustand"

import {
  CHARACTER_IDS,
  EXTERIOR_BY_LEVEL,
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
  PurchaseQuantity,
  TaskId,
} from "./types"

export type GameStore = GameState & {
  tick: (elapsedSeconds: number) => void
  assignTask: (character: CharacterId, task: TaskId) => ActionResult
  buyGenerator: (
    generator: GeneratorId,
    quantity: PurchaseQuantity,
  ) => ActionResult
  buyExterior: (target: "emergencyTarp" | "enclosedVan") => ActionResult
  reset: () => void
}

export function createInitialState(now = Date.now()): GameState {
  return {
    saveVersion: SAVE_VERSION,
    resources: { ...INITIAL_RESOURCES },
    capacities: { ...INITIAL_CAPACITIES },
    characters: {
      father: { id: "father", task: "drive", energy: 100 },
      mother: { id: "mother", task: "provision", energy: 100 },
      child: { id: "child", task: "connect", energy: 100 },
    },
    generators: Object.fromEntries(
      Object.keys(GENERATORS).map((id) => [id, { id, owned: 0 }]),
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
  tick: (elapsedSeconds) => set((state) => simulate(state, elapsedSeconds)),
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
    if (quantity < 1) return { ok: false, reason: "Not enough spare parts." }
    const cost = bulkGeneratorPrice(
      generator,
      state.generators[generator].owned,
      quantity,
    )
    if (cost > state.resources.spareParts) {
      return { ok: false, reason: "Not enough spare parts." }
    }
    set({
      resources: {
        ...state.resources,
        spareParts: state.resources.spareParts - cost,
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
  reset: () => set(createInitialState()),
}))
