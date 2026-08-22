import {
  CHARACTER_IDS,
  BASE_CONSUMPTION_PER_SECOND,
  EXTERIOR_BY_LEVEL,
  GENERATORS,
  INITIAL_CAPACITIES,
  DAY_DURATION_SECONDS,
  MAX_OFFLINE_SECONDS,
  OFFLINE_MULTIPLIER,
  SAVE_VERSION,
} from "./constants"
import { getPassiveRates } from "./simulation"
import { createInitialState } from "./store"
import type {
  GeneratorId,
  GameState,
  OfflineSummary,
  PersistedGameState,
  ResourceKey,
} from "./types"

const TASK_IDS = ["drive", "repair", "provision", "connect", "rest"] as const

export const STORAGE_KEY = "convoy-save"

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function isValidSave(value: unknown): value is PersistedGameState {
  if (!value || typeof value !== "object") return false
  const save = value as Partial<PersistedGameState>
  if (save.saveVersion !== SAVE_VERSION) return false
  if (!isFiniteNumber(save.bond) || save.bond < 0 || save.bond > 100) return false
  if (!isFiniteNumber(save.distance) || save.distance < 0) return false
  if (!isFiniteNumber(save.elapsedSeconds) || save.elapsedSeconds < 0) return false
  if (!isFiniteNumber(save.day) || save.day < 1) return false
  if (!isFiniteNumber(save.lastSeenTimestamp) || save.lastSeenTimestamp < 0) {
    return false
  }
  if (!save.resources || !save.characters || !save.generators || !save.exterior) {
    return false
  }

  const resourceKeys: ResourceKey[] = ["fuel", "provisions", "spareParts"]
  if (
    resourceKeys.some(
      (key) =>
        !isFiniteNumber(save.resources?.[key]) || save.resources[key] < 0,
    )
  ) {
    return false
  }

  if (
    CHARACTER_IDS.some((id) => {
      const character = save.characters?.[id]
      return (
        !character ||
        character.id !== id ||
        !TASK_IDS.includes(character.task) ||
        !isFiniteNumber(character.energy) ||
        character.energy < 0 ||
        character.energy > 100
      )
    })
  ) {
    return false
  }

  const generatorIds = Object.keys(GENERATORS) as GeneratorId[]
  if (
    generatorIds.some((id) => {
      const generator = save.generators?.[id]
      return (
        !generator ||
        generator.id !== id ||
        !Number.isInteger(generator.owned) ||
        generator.owned < 0
      )
    })
  ) {
    return false
  }

  if (
    save.exterior.level !== 1 &&
    save.exterior.level !== 2 &&
    save.exterior.level !== 3
  ) {
    return false
  }
  if (save.exterior.id !== EXTERIOR_BY_LEVEL[save.exterior.level - 1]) {
    return false
  }

  return true
}

export function toPersistedState(state: GameState): PersistedGameState {
  return {
    saveVersion: state.saveVersion,
    resources: state.resources,
    characters: state.characters,
    generators: state.generators,
    exterior: state.exterior,
    bond: state.bond,
    distance: state.distance,
    elapsedSeconds: state.elapsedSeconds,
    day: state.day,
    lastSeenTimestamp: state.lastSeenTimestamp,
  }
}

export function serializeState(state: GameState): string {
  return JSON.stringify(toPersistedState(state))
}

export function deserializeState(raw: string): GameState | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isValidSave(parsed)) return null
    return {
      ...parsed,
      capacities: { ...INITIAL_CAPACITIES },
      lastSeenTimestamp: parsed.lastSeenTimestamp,
    }
  } catch {
    return null
  }
}

export function loadState(storage: Storage | undefined, now = Date.now()): GameState {
  if (!storage) return createInitialState(now)
  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) return createInitialState(now)
  return deserializeState(raw) ?? createInitialState(now)
}

export function saveState(storage: Storage | undefined, state: GameState): void {
  if (!storage) return
  storage.setItem(STORAGE_KEY, serializeState(state))
}

export function clearSavedState(storage: Storage | undefined): void {
  storage?.removeItem(STORAGE_KEY)
}

export function applyOfflineProgress(
  state: GameState,
  now: number,
): { state: GameState; summary: OfflineSummary } {
  const elapsedSinceSave = Math.max((now - state.lastSeenTimestamp) / 1_000, 0)
  const offlineSeconds = Math.min(elapsedSinceSave, MAX_OFFLINE_SECONDS)
  if (offlineSeconds === 0) {
    return {
      state: { ...state, lastSeenTimestamp: now },
      summary: {
        offlineSeconds: 0,
        fuelGained: 0,
        provisionsGained: 0,
        sparePartsGained: 0,
        distanceGained: 0,
      },
    }
  }

  const rates = getPassiveRates(state)
  const multiplier = OFFLINE_MULTIPLIER
  const fuelGained =
    (rates.fuel * multiplier - BASE_CONSUMPTION_PER_SECOND.fuel) *
    offlineSeconds
  const provisionsGained =
    (rates.provisions * multiplier - BASE_CONSUMPTION_PER_SECOND.provisions) *
    offlineSeconds
  const sparePartsGained = rates.spareParts * offlineSeconds * multiplier
  const distanceGained = offlineSeconds * 0.08 * multiplier * (state.resources.fuel > 0 ? 1 : 0.15)

  return {
    state: {
      ...state,
      resources: {
        fuel: Math.max(
          Math.min(state.resources.fuel + fuelGained, state.capacities.fuel),
          0,
        ),
        provisions: Math.min(
          Math.max(state.resources.provisions + provisionsGained, 0),
          state.capacities.provisions,
        ),
        spareParts: state.resources.spareParts + sparePartsGained,
      },
      distance: state.distance + distanceGained,
      elapsedSeconds: state.elapsedSeconds + offlineSeconds,
      day:
        Math.floor(
          (state.elapsedSeconds + offlineSeconds) / DAY_DURATION_SECONDS,
        ) + 1,
      lastSeenTimestamp: now,
    },
    summary: {
      offlineSeconds,
      fuelGained,
      provisionsGained,
      sparePartsGained,
      distanceGained,
    },
  }
}
