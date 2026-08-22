import {
  BASE_CONSUMPTION_PER_SECOND,
  BASE_DISTANCE_PER_SECOND,
  DAY_DURATION_SECONDS,
  GENERATORS,
  MAX_ACTIVE_TICK_SECONDS,
} from "./constants"
import { generatorCycleSeconds } from "./generators"
import type { GameState, ResourceKey } from "./types"

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

function taskModifiers(state: GameState) {
  return {
    credits:
      (state.characters.father.task === "repair" ? 1.35 : 1) *
      (state.characters.mother.task === "trade" ? 1.4 : 1) *
      (state.characters.child.task === "connect" ? 1.1 : 1),
    fuel: 1,
  }
}

function bondModifier(state: GameState) {
  return 0.7 + state.bond / 333
}

export function creditCycleMultiplier(state: GameState) {
  return (
    (state.characters.father.task === "repair" ? 1.35 : 1) *
    (state.characters.mother.task === "trade" ? 1.4 : 1) *
    (state.characters.child.task === "connect" ? 1.1 : 1) *
    bondModifier(state)
  )
}

export function creditOutputPerCycle(state: GameState, owned: number, baseOutput: number) {
  return owned * baseOutput * creditCycleMultiplier(state)
}

export function getPassiveRates(state: GameState) {
  const rates: Record<ResourceKey, number> = {
    fuel: 0,
    credits: 0,
  }
  const modifiers = taskModifiers(state)

  for (const [id, generator] of Object.entries(state.generators) as [
    keyof typeof GENERATORS,
    GameState["generators"][keyof GameState["generators"]],
  ][]) {
    const definition = GENERATORS[id]
    const rate = (generator.owned * definition.outputPerCycle) / generatorCycleSeconds(id, generator.owned)
    rates.credits += rate * modifiers.credits * bondModifier(state)
  }

  return {
    fuel: rates.fuel,
    credits: rates.credits,
  }
}

export function applyGeneratorCycles(
  state: GameState,
  elapsedSeconds: number,
): { resources: GameState["resources"]; generators: GameState["generators"] } {
  const resources = { ...state.resources }
  const generators = { ...state.generators }

  for (const [id, generator] of Object.entries(state.generators) as [
    keyof typeof GENERATORS,
    GameState["generators"][keyof GameState["generators"]],
  ][]) {
    if (generator.owned === 0) continue
    const definition = GENERATORS[id]
    const cycleSeconds = generatorCycleSeconds(id, generator.owned)
    const totalProgress = generator.cycleProgressSeconds + elapsedSeconds
    const completedCycles = Math.floor(totalProgress / cycleSeconds)
    const progress = totalProgress % cycleSeconds
    const output =
      completedCycles *
      creditOutputPerCycle(state, generator.owned, definition.outputPerCycle)

    resources.credits += output
    generators[id] = { ...generator, cycleProgressSeconds: progress }
  }

  return { resources, generators }
}

export function simulate(
  state: GameState,
  elapsedSeconds: number,
  now = Date.now(),
): GameState {
  const seconds = clamp(elapsedSeconds, 0, MAX_ACTIVE_TICK_SECONDS)
  return simulateElapsed(state, seconds, seconds, now)
}

export function simulateElapsed(
  state: GameState,
  elapsedSeconds: number,
  productionSeconds = elapsedSeconds,
  now = Date.now(),
): GameState {
  const seconds = Math.max(elapsedSeconds, 0)
  if (seconds === 0) return state

  const cycled = applyGeneratorCycles(state, productionSeconds)
  const fuel = clamp(
    cycled.resources.fuel - BASE_CONSUMPTION_PER_SECOND.fuel * seconds,
    0,
    state.capacities.fuel,
  )
  const fuelFactor = state.resources.fuel > 0 ? 1 : 0.15
  const distance =
    state.distance + BASE_DISTANCE_PER_SECOND * fuelFactor * productionSeconds
  const childConnecting = state.characters.child.task === "connect"
  const restingCount = Object.values(state.characters).filter(
    (character) => character.task === "rest",
  ).length
  const bondDelta =
    (childConnecting ? 0.008 : -0.002) * seconds + restingCount * 0.001 * seconds
  const elapsedTotal = state.elapsedSeconds + seconds

  return {
    ...state,
    resources: { ...cycled.resources, fuel },
    generators: cycled.generators,
    distance,
    bond: clamp(state.bond + bondDelta, 0, 100),
    elapsedSeconds: elapsedTotal,
    day: Math.floor(elapsedTotal / DAY_DURATION_SECONDS) + 1,
    lastSeenTimestamp: now,
  }
}
