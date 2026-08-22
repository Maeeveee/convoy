import { describe, expect, it } from "vitest"

import {
  affordableGeneratorQuantity,
  bulkGeneratorPrice,
  generatorMilestoneMultiplier,
  generatorPrice,
  nextGeneratorMilestone,
  nextGeneratorMilestoneQuantity,
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
})
