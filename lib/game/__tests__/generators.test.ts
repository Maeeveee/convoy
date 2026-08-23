import { describe, expect, it } from "vitest"

import { createInitialState } from "../store"
import {
  affordableGeneratorQuantity,
  allGeneratorsMilestoneCount,
  allGeneratorsMilestoneRows,
  allGeneratorsOutputMultiplier,
  allGeneratorsSpeedMultiplier,
  bulkGeneratorPrice,
  generatorMilestoneMultiplier,
  generatorPrice,
  hasOwnedAllGenerators,
  nextGeneratorMilestone,
  nextGeneratorMilestoneQuantity,
  nextAllGeneratorsMilestone,
} from "../generators"

describe("generator pricing", () => {
  it("increases the price from the owned count", () => {
    expect(generatorPrice("fatherToolkit", 0)).toBe(25)
    expect(generatorPrice("fatherToolkit", 1)).toBeCloseTo(27.5)
  })

  it("calculates bulk prices as each sequential purchase", () => {
    expect(bulkGeneratorPrice("fatherToolkit", 0, 2)).toBeCloseTo(52.5)
  })

  it("returns the largest affordable quantity", () => {
    expect(affordableGeneratorQuantity("fatherToolkit", 0, 52.5)).toBe(2)
    expect(affordableGeneratorQuantity("fatherToolkit", 0, 24)).toBe(0)
  })

  it("calculates the next milestone and exact purchase quantity", () => {
    expect(nextGeneratorMilestone(0)).toBe(25)
    expect(nextGeneratorMilestoneQuantity(24)).toBe(1)
    expect(nextGeneratorMilestoneQuantity(25)).toBe(25)
    expect(nextGeneratorMilestone(200)).toBe(300)
    expect(nextGeneratorMilestone(347)).toBe(400)
  })

  it("doubles production at each milestone", () => {
    expect(generatorMilestoneMultiplier(24)).toBe(1)
    expect(generatorMilestoneMultiplier(25)).toBe(2)
    expect(generatorMilestoneMultiplier(50)).toBe(4)
    expect(generatorMilestoneMultiplier(200)).toBe(16)
    expect(generatorMilestoneMultiplier(300)).toBe(32)
  })

  it("detects when every generator has been purchased", () => {
    const state = createInitialState(0)
    expect(hasOwnedAllGenerators(state)).toBe(false)

    const generators = Object.fromEntries(
      Object.entries(state.generators).map(([id, generator]) => [
        id,
        { ...generator, owned: 1 },
      ]),
    ) as typeof state.generators
    expect(hasOwnedAllGenerators({ ...state, generators })).toBe(true)
  })

  it("scales all-generator output and speed milestones", () => {
    const initial = createInitialState(0)
    const withEveryGenerator = (owned: number) => ({
      ...initial,
      generators: Object.fromEntries(
        Object.entries(initial.generators).map(([id, generator]) => [
          id,
          { ...generator, owned },
        ]),
      ) as typeof initial.generators,
    })

    expect(allGeneratorsMilestoneCount(withEveryGenerator(1))).toBe(1)
    expect(allGeneratorsOutputMultiplier(withEveryGenerator(1))).toBe(1.5)
    expect(allGeneratorsSpeedMultiplier(withEveryGenerator(1))).toBe(1)
    expect(allGeneratorsOutputMultiplier(withEveryGenerator(25))).toBe(1.5)
    expect(allGeneratorsSpeedMultiplier(withEveryGenerator(25))).toBe(2)
    expect(allGeneratorsOutputMultiplier(withEveryGenerator(50))).toBe(2.25)
    expect(allGeneratorsSpeedMultiplier(withEveryGenerator(100))).toBe(4)
    expect(allGeneratorsOutputMultiplier(withEveryGenerator(200))).toBe(3.375)
    expect(allGeneratorsSpeedMultiplier(withEveryGenerator(300))).toBe(8)
    expect(nextAllGeneratorsMilestone(withEveryGenerator(200))).toBe(300)
    expect(nextAllGeneratorsMilestone(withEveryGenerator(347))).toBe(400)
  })

  it("describes unlocked and upcoming all-generator bonuses", () => {
    const initial = createInitialState(0)
    const generators = Object.fromEntries(
      Object.entries(initial.generators).map(([id, generator]) => [
        id,
        { ...generator, owned: 25 },
      ]),
    ) as typeof initial.generators
    const rows = allGeneratorsMilestoneRows({ ...initial, generators })

    expect(rows.map((row) => row.threshold)).toEqual([1, 25, 50, 100, 200])
    expect(rows[1]).toMatchObject({ unlocked: true, bonusType: "speed", speedMultiplier: 2 })
    expect(rows[2]).toMatchObject({ unlocked: false, bonusType: "output", outputMultiplier: 2.25 })
  })
})
