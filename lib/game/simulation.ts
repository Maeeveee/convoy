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
    spareParts:
      (state.characters.father.task === "repair" ? 1.35 : 1) *
      (state.characters.child.task === "connect" ? 1.1 : 1),
    provisions: state.characters.mother.task === "provision" ? 1.4 : 1,
    fuel: 1,
  }
}

function bondModifier(state: GameState) {
  return 0.7 + state.bond / 333
}

export function getPassiveRates(state: GameState) {
  const rates: Record<ResourceKey, number> = {
    fuel: 0,
    provisions: 0,
    spareParts: 0,
  }
  const modifiers = taskModifiers(state)
  const bond = bondModifier(state)

  for (const [id, generator] of Object.entries(state.generators) as [
    keyof typeof GENERATORS,
    GameState["generators"][keyof GameState["generators"]],
  ][]) {
    const definition = GENERATORS[id]
    const rate =
      (generator.owned * definition.outputPerCycle) /
      generatorCycleSeconds(id, generator.owned)
    rates[definition.resource] += rate * modifiers[definition.resource]
  }

  return {
    fuel: rates.fuel,
    provisions: rates.provisions * bond,
    spareParts: rates.spareParts * bond,
  }
}

export function applyGeneratorCycles(
  state: GameState,
  elapsedSeconds: number,
): { resources: GameState["resources"]; generators: GameState["generators"] } {
  const resources = { ...state.resources }
  const generators = { ...state.generators }
  const modifiers = taskModifiers(state)
  const bond = bondModifier(state)

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
      generator.owned *
      definition.outputPerCycle *
      modifiers[definition.resource] *
      (definition.resource === "spareParts" || definition.resource === "provisions"
        ? bond
        : 1)

    resources[definition.resource] += output
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
  const provisions = clamp(
    cycled.resources.provisions -
      BASE_CONSUMPTION_PER_SECOND.provisions * seconds,
    0,
    state.capacities.provisions,
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
    resources: { ...cycled.resources, fuel, provisions },
    generators: cycled.generators,
    distance,
    bond: clamp(state.bond + bondDelta, 0, 100),
    elapsedSeconds: elapsedTotal,
    day: Math.floor(elapsedTotal / DAY_DURATION_SECONDS) + 1,
    lastSeenTimestamp: now,
  }
}
