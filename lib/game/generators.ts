import {
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
  spareParts: number,
): number {
  let quantity = 0
  let total = 0
  while (quantity < 10_000) {
    const nextPrice = generatorPrice(id, owned + quantity)
    if (total + nextPrice > spareParts) break
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

export function generatorCycleSeconds(id: GeneratorId, owned: number): number {
  return GENERATORS[id].cycleSeconds / generatorMilestoneMultiplier(owned)
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
      state.resources.spareParts,
    )
  }
  return quantity
}
