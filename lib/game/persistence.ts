import {
  CHARACTER_IDS,
  EXTERIOR_BY_LEVEL,
  GENERATORS,
  INITIAL_CAPACITIES,
  MAX_OFFLINE_SECONDS,
  OFFLINE_MULTIPLIER,
  SAVE_VERSION,
} from "./constants"
import { simulateElapsed } from "./simulation"
import { eventById } from "./events"
import { createInitialState } from "./store"
import type {
  GeneratorId,
  GameState,
  OfflineSummary,
  PersistedGameState,
  ResourceKey,
} from "./types"

const TASK_IDS = ["drive", "repair", "trade", "connect", "rest"] as const

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
  if (!isFiniteNumber(save.eventTimerSeconds) || save.eventTimerSeconds < 0) return false
  if (
    !Number.isInteger(save.fuelPurchases) ||
    (save.fuelPurchases ?? -1) < 0
  ) return false
  if (
    save.pendingEvent !== null &&
    (typeof save.pendingEvent !== "string" || !eventById(save.pendingEvent))
  ) return false
  if (save.pendingNightDay !== null && (!isFiniteNumber(save.pendingNightDay) || save.pendingNightDay < 1)) return false
  if (!save.interior || !save.pairBonds || !save.meta) return false
  if (save.interior.level < 1 || save.interior.level > 3) return false
  if (Object.values(save.pairBonds).some((value) => !isFiniteNumber(value) || value < 0 || value > 100)) return false
  if (!isFiniteNumber(save.bondSum) || save.bondSum < 0 || !isFiniteNumber(save.bondSampleSeconds) || save.bondSampleSeconds < 0) return false
  if (!isFiniteNumber(save.totalCreditsGenerated) || save.totalCreditsGenerated < 0) return false
  if (!isFiniteNumber(save.meta.legacy) || save.meta.legacy < 0 || !isFiniteNumber(save.meta.totalLegacyEarned) || save.meta.totalLegacyEarned < 0) return false
  if (!save.resources || !save.characters || !save.generators || !save.exterior) {
    return false
  }

  const resourceKeys: ResourceKey[] = ["fuel", "credits"]
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
        generator.owned < 0 ||
        !isFiniteNumber(generator.cycleProgressSeconds) ||
        generator.cycleProgressSeconds < 0
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
    eventTimerSeconds: state.eventTimerSeconds,
    pendingEvent: state.pendingEvent,
    pendingNightDay: state.pendingNightDay,
    fuelPurchases: state.fuelPurchases,
    interior: state.interior,
    pairBonds: state.pairBonds,
    bondSum: state.bondSum,
    bondSampleSeconds: state.bondSampleSeconds,
    totalCreditsGenerated: state.totalCreditsGenerated,
    meta: state.meta,
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
        fuelChange: 0,
        creditsGained: 0,
        distanceGained: 0,
      },
    }
  }

  const multiplier = OFFLINE_MULTIPLIER
  const progressed = simulateElapsed(
    state,
    offlineSeconds,
    offlineSeconds * multiplier,
    now,
  )
  const resolvedState = { ...progressed, bond: state.bond }
  const fuelChange = resolvedState.resources.fuel - state.resources.fuel
  const creditsGained = resolvedState.resources.credits - state.resources.credits
  const distanceGained = resolvedState.distance - state.distance

  return {
    state: resolvedState,
    summary: {
      offlineSeconds,
        fuelChange,
        creditsGained,
      distanceGained,
    },
  }
}
