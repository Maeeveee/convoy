import {
  BASE_CONSUMPTION_PER_SECOND,
  BASE_DISTANCE_PER_SECOND,
  DAY_DURATION_SECONDS,
  GENERATORS,
  MAX_ACTIVE_TICK_SECONDS,
  ENERGY_COST_PER_SECOND,
  ROUTES,
  LEGACY_PRODUCTION_BONUS,
} from "./constants"
import { allGeneratorsOutputMultiplier, allGeneratorsSpeedMultiplier, generatorCycleSeconds } from "./generators"
import type { GameState, ResourceKey } from "./types"

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

function taskModifiers(state: GameState) {
  const energyModifier = (character: GameState["characters"][keyof GameState["characters"]]) =>
    character.energy >= 60 ? 1 : character.energy >= 25 ? 0.75 : 0.4
  return {
    credits:
      (state.characters.father.task === "repair" ? 1 + 0.35 * energyModifier(state.characters.father) : 1) *
      (state.characters.mother.task === "trade" ? 1 + 0.4 * energyModifier(state.characters.mother) : 1) *
      (state.characters.child.task === "connect" ? 1 + 0.1 * energyModifier(state.characters.child) : 1) *
      ROUTES[state.route].creditMultiplier,
    fuel: ROUTES[state.route].fuelMultiplier,
  }
}

export function creditCycleMultiplier(state: GameState) {
  const legacyMultiplier = 1 + state.meta.totalLegacyEarned * LEGACY_PRODUCTION_BONUS
  return taskModifiers(state).credits * allGeneratorsOutputMultiplier(state) * legacyMultiplier
}

export function creditOutputPerCycle(state: GameState, owned: number, baseOutput: number) {
  return owned * baseOutput * creditCycleMultiplier(state)
}

export function getPassiveRates(state: GameState) {
  const rates: Record<ResourceKey, number> = {
    fuel: 0,
    credits: 0,
  }
  const creditMultiplier = creditCycleMultiplier(state)

  for (const [id, generator] of Object.entries(state.generators) as [
    keyof typeof GENERATORS,
    GameState["generators"][keyof GameState["generators"]],
  ][]) {
    const definition = GENERATORS[id]
    const rate = (generator.owned * definition.outputPerCycle) / generatorCycleSeconds(id, generator.owned, allGeneratorsSpeedMultiplier(state))
    rates.credits += rate * creditMultiplier
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
    const cycleSeconds = generatorCycleSeconds(id, generator.owned, allGeneratorsSpeedMultiplier(state))
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
    cycled.resources.fuel - BASE_CONSUMPTION_PER_SECOND.fuel * seconds * taskModifiers(state).fuel,
    0,
    state.capacities.fuel,
  )
  const fuelFactor = state.resources.fuel > 0 ? 1 : 0
  const distance = state.distance + BASE_DISTANCE_PER_SECOND * fuelFactor * productionSeconds * ROUTES[state.route].distanceMultiplier
  const childConnecting = state.characters.child.task === "connect"
  const restingCount = Object.values(state.characters).filter(
    (character) => character.task === "rest",
  ).length
  const bondDelta =
    ((childConnecting ? 0.008 : -0.002) + ROUTES[state.route].bondDelta) * seconds + restingCount * 0.001 * seconds
  const elapsedTotal = state.elapsedSeconds + seconds
  const pairDelta = bondDelta * 0.8
  const characters = Object.fromEntries(
    Object.entries(state.characters).map(([id, character]) => [
      id,
      { ...character, energy: clamp(character.energy - ENERGY_COST_PER_SECOND[character.task] * seconds, 0, 100) },
    ]),
  ) as GameState["characters"]

  return {
    ...state,
    resources: { ...cycled.resources, fuel },
    generators: cycled.generators,
    characters,
    distance,
    bond: clamp(state.bond + bondDelta, 0, 100),
    pairBonds: {
      fatherMother: clamp(state.pairBonds.fatherMother + pairDelta, 0, 100),
      fatherChild: clamp(state.pairBonds.fatherChild + pairDelta * 1.1, 0, 100),
      motherChild: clamp(state.pairBonds.motherChild + pairDelta * 0.9, 0, 100),
    },
    elapsedSeconds: elapsedTotal,
    day: Math.floor(elapsedTotal / DAY_DURATION_SECONDS) + 1,
    lastSeenTimestamp: now,
  }
}
