import {
  ALL_GENERATORS_MILESTONE_GROWTH,
  ALL_GENERATORS_MILESTONES,
  ALL_GENERATORS_OUTPUT_MULTIPLIER,
  ALL_GENERATORS_SPEED_MULTIPLIER,
  GENERATOR_MILESTONE_GROWTH,
  GENERATOR_MILESTONES,
  GENERATORS,
} from "./constants"
import type { GeneratorId, GameState, PurchaseQuantity } from "./types"

export function generatorPrice(id: GeneratorId, owned: number): number {
  const generator = GENERATORS[id]
  return generator.basePrice * generator.growth ** owned
}

export function bulkGeneratorPrice(
  id: GeneratorId,
  owned: number,
  quantity: number,
): number {
  let total = 0
  for (let index = 0; index < quantity; index += 1) {
    total += generatorPrice(id, owned + index)
  }
  return total
}

export function affordableGeneratorQuantity(
  id: GeneratorId,
  owned: number,
  credits: number,
): number {
  let quantity = 0
  let total = 0
  while (quantity < 10_000) {
    const nextPrice = generatorPrice(id, owned + quantity)
    if (total + nextPrice > credits) break
    total += nextPrice
    quantity += 1
  }
  return quantity
}

export function nextGeneratorMilestone(owned: number): number {
  const definedMilestone = GENERATOR_MILESTONES.find((milestone) => milestone > owned)
  if (definedMilestone) return definedMilestone

  const lastMilestone = GENERATOR_MILESTONES[GENERATOR_MILESTONES.length - 1]
  return (
    Math.floor((owned - lastMilestone) / GENERATOR_MILESTONE_GROWTH) + 1
  ) * GENERATOR_MILESTONE_GROWTH + lastMilestone
}

export function nextGeneratorMilestoneQuantity(owned: number): number {
  return Math.max(nextGeneratorMilestone(owned) - owned, 0)
}

export function generatorMilestonesReached(previousOwned: number, owned: number): number[] {
  const milestones: number[] = GENERATOR_MILESTONES.filter(
    (milestone) => previousOwned < milestone && owned >= milestone,
  )
  const lastMilestone = GENERATOR_MILESTONES.at(-1) ?? 0
  if (owned > lastMilestone) {
    for (
      let milestone = lastMilestone + GENERATOR_MILESTONE_GROWTH;
      milestone <= owned;
      milestone += GENERATOR_MILESTONE_GROWTH
    ) {
      if (previousOwned < milestone) milestones.push(milestone)
    }
  }
  return milestones
}

export function generatorMilestoneMultiplier(owned: number): number {
  if (owned < GENERATOR_MILESTONES[0]) return 1

  const firstMilestoneCount = GENERATOR_MILESTONES.filter(
    (milestone) => owned >= milestone,
  ).length
  const lastDefinedMilestone = GENERATOR_MILESTONES.at(-1) ?? 0
  const laterMilestoneCount =
    owned >= lastDefinedMilestone
      ? Math.floor((owned - lastDefinedMilestone) / GENERATOR_MILESTONE_GROWTH)
      : 0

  return 2 ** (firstMilestoneCount + laterMilestoneCount)
}

export function generatorCycleSeconds(id: GeneratorId, owned: number, speedMultiplier = 1): number {
  return GENERATORS[id].cycleSeconds / generatorMilestoneMultiplier(owned) / speedMultiplier
}

export function hasOwnedAllGenerators(state: GameState): boolean {
  return allGeneratorsMilestoneCount(state) > 0
}

export function allGeneratorsMilestoneCount(state: GameState): number {
  const minimumOwned = Math.min(
    ...Object.values(state.generators).map((generator) => generator.owned),
  )
  const definedCount = ALL_GENERATORS_MILESTONES.filter(
    (milestone) => minimumOwned >= milestone,
  ).length
  const lastMilestone = ALL_GENERATORS_MILESTONES.at(-1) ?? 0
  const laterCount = minimumOwned >= lastMilestone
    ? Math.floor((minimumOwned - lastMilestone) / ALL_GENERATORS_MILESTONE_GROWTH)
    : 0
  return definedCount + laterCount
}

export function allGeneratorsOutputMultiplier(state: GameState): number {
  return ALL_GENERATORS_OUTPUT_MULTIPLIER ** Math.ceil(allGeneratorsMilestoneCount(state) / 2)
}

export function allGeneratorsSpeedMultiplier(state: GameState): number {
  return ALL_GENERATORS_SPEED_MULTIPLIER ** Math.floor(allGeneratorsMilestoneCount(state) / 2)
}

export function nextAllGeneratorsMilestone(state: GameState): number {
  const minimumOwned = Math.min(
    ...Object.values(state.generators).map((generator) => generator.owned),
  )
  const definedMilestone = ALL_GENERATORS_MILESTONES.find(
    (milestone) => milestone > minimumOwned,
  )
  if (definedMilestone) return definedMilestone

  const lastMilestone = ALL_GENERATORS_MILESTONES.at(-1) ?? 0
  return (
    Math.floor((minimumOwned - lastMilestone) / ALL_GENERATORS_MILESTONE_GROWTH + 1) *
      ALL_GENERATORS_MILESTONE_GROWTH +
    lastMilestone
  )
}

export function allGeneratorsMilestoneRows(state: GameState, upcomingCount = 3) {
  const unlockedCount = allGeneratorsMilestoneCount(state)
  const rowCount = Math.max(unlockedCount + upcomingCount, ALL_GENERATORS_MILESTONES.length)
  const lastDefinedIndex = ALL_GENERATORS_MILESTONES.length - 1
  const lastDefinedMilestone = ALL_GENERATORS_MILESTONES[lastDefinedIndex]

  return Array.from({ length: rowCount }, (_, index) => {
    const count = index + 1
    const threshold = index <= lastDefinedIndex
      ? ALL_GENERATORS_MILESTONES[index]
      : lastDefinedMilestone + (index - lastDefinedIndex) * ALL_GENERATORS_MILESTONE_GROWTH
    return {
      threshold,
      unlocked: count <= unlockedCount,
      bonusType: count % 2 === 1 ? "output" as const : "speed" as const,
      outputMultiplier: ALL_GENERATORS_OUTPUT_MULTIPLIER ** Math.ceil(count / 2),
      speedMultiplier: ALL_GENERATORS_SPEED_MULTIPLIER ** Math.floor(count / 2),
    }
  })
}

export function allGeneratorsMilestonesReached(
  previousState: GameState,
  state: GameState,
 ) {
  const previousCount = allGeneratorsMilestoneCount(previousState)
  return allGeneratorsMilestoneRows(state, 0)
    .filter((milestone, index) => index >= previousCount && milestone.unlocked)
}

export function resolvePurchaseQuantity(
  state: GameState,
  id: GeneratorId,
  quantity: PurchaseQuantity,
): number {
  if (quantity === "next") {
    return nextGeneratorMilestoneQuantity(state.generators[id].owned)
  }
  if (quantity === "max") {
    return affordableGeneratorQuantity(
      id,
      state.generators[id].owned,
      state.resources.credits,
    )
  }
  return quantity
}
