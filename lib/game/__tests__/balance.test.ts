import { describe, expect, it } from "vitest"

import {
  BASE_CONSUMPTION_PER_SECOND,
  FUEL_PRICE_PER_UNIT,
  GENERATORS,
  INITIAL_RESOURCES,
} from "../constants"

describe("MVP balance guardrails", () => {
  it("keeps first-generator payback between 30 and 90 seconds", () => {
    for (const generator of Object.values(GENERATORS)) {
      const creditsPerSecond = generator.outputPerCycle / generator.cycleSeconds
      const paybackSeconds = generator.basePrice / creditsPerSecond
      expect(paybackSeconds).toBeGreaterThanOrEqual(30)
      expect(paybackSeconds).toBeLessThanOrEqual(90)
    }
  })

  it("gives a fresh journey at least 30 minutes of fuel runway", () => {
    const runwaySeconds =
      INITIAL_RESOURCES.fuel / BASE_CONSUMPTION_PER_SECOND.fuel
    expect(runwaySeconds).toBeGreaterThanOrEqual(30 * 60)
  })

  it("makes the smallest fuel purchase affordable at the start", () => {
    expect(INITIAL_RESOURCES.credits).toBeGreaterThanOrEqual(
      FUEL_PRICE_PER_UNIT * 10,
    )
  })

  it("starts with enough credits for Father's toolkit but not emergency cans", () => {
    expect(INITIAL_RESOURCES.credits).toBeGreaterThanOrEqual(GENERATORS.fatherToolkit.basePrice)
    expect(INITIAL_RESOURCES.credits).toBeLessThan(GENERATORS.emergencyFood.basePrice)
  })
})
