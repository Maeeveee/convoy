import {
  BASE_CONSUMPTION_PER_SECOND,
  BASE_DISTANCE_PER_SECOND,
  DAY_DURATION_SECONDS,
  GENERATORS,
  MAX_ACTIVE_TICK_SECONDS,
} from "./constants"
import type { GameState, ResourceKey } from "./types"
import { generatorMilestoneMultiplier } from "./generators"

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function getPassiveRates(state: GameState) {
  const rates: Record<ResourceKey, number> = {
    fuel: 0,
    provisions: 0,
    spareParts: 0,
  }

  for (const [id, generator] of Object.entries(state.generators) as [
    keyof typeof GENERATORS,
    GameState["generators"][keyof GameState["generators"]],
  ][]) {
    const definition = GENERATORS[id]
    rates[definition.resource] +=
      generator.owned *
      definition.ratePerSecond *
      generatorMilestoneMultiplier(generator.owned)
  }

  const fatherTask = state.characters.father.task
  const motherTask = state.characters.mother.task
  const childTask = state.characters.child.task

  if (fatherTask === "repair") rates.spareParts *= 1.35
  if (motherTask === "provision") rates.provisions *= 1.4
  if (childTask === "connect") rates.spareParts *= 1.1

  const bondModifier = 0.7 + state.bond / 333
  return {
    fuel: rates.fuel,
    provisions: rates.provisions * bondModifier,
    spareParts: rates.spareParts * bondModifier,
  }
}

export function simulate(
  state: GameState,
  elapsedSeconds: number,
  now = Date.now(),
): GameState {
  const seconds = clamp(elapsedSeconds, 0, MAX_ACTIVE_TICK_SECONDS)
  if (seconds === 0) return state

  const rates = getPassiveRates(state)
  const fuelConsumption = BASE_CONSUMPTION_PER_SECOND.fuel * seconds
  const provisionsConsumption = BASE_CONSUMPTION_PER_SECOND.provisions * seconds
  const fuel = clamp(
    state.resources.fuel + rates.fuel * seconds - fuelConsumption,
    0,
    state.capacities.fuel,
  )
  const provisions = clamp(
    state.resources.provisions + rates.provisions * seconds - provisionsConsumption,
    0,
    state.capacities.provisions,
  )
  const spareParts = state.resources.spareParts + rates.spareParts * seconds
  const fuelFactor = state.resources.fuel > 0 ? 1 : 0.15
  const distance = state.distance + BASE_DISTANCE_PER_SECOND * fuelFactor * seconds
  const childConnecting = state.characters.child.task === "connect"
  const restingCount = Object.values(state.characters).filter(
    (character) => character.task === "rest",
  ).length
  const bondDelta =
    (childConnecting ? 0.008 : -0.002) * seconds + restingCount * 0.001 * seconds
  const elapsedTotal = state.elapsedSeconds + seconds

  return {
    ...state,
    resources: { fuel, provisions, spareParts },
    distance,
    bond: clamp(state.bond + bondDelta, 0, 100),
    elapsedSeconds: elapsedTotal,
    day: Math.floor(elapsedTotal / DAY_DURATION_SECONDS) + 1,
    lastSeenTimestamp: now,
  }
}
