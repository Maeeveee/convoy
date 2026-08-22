import { describe, expect, it } from "vitest"

import { createInitialState } from "../store"
import { buyInteriorUpgrade, legacyReward } from "../progression"
import { serializeState, deserializeState } from "../persistence"

describe("Phase 6 progression", () => {
  it("awards Legacy from generated credits and average bond", () => {
    const state = {
      ...createInitialState(0),
      totalCreditsGenerated: 100_000,
      bondSum: 100 * 1_000,
      bondSampleSeconds: 1_000,
    }

    expect(legacyReward(state)).toBe(4)
  })

  it("buys interior upgrades independently from the exterior", () => {
    const initial = createInitialState(0)
    const result = buyInteriorUpgrade(
      { ...initial, resources: { ...initial.resources, credits: 5_000 } },
      "semiLivable",
    )

    expect(result.result).toEqual({ ok: true })
    expect(result.state.interior.level).toBe(2)
    expect(result.state.exterior.level).toBe(1)
  })

  it("persists Phase 6 state fields", () => {
    const state = createInitialState(0)
    const loaded = deserializeState(
      serializeState({ ...state, meta: { legacy: 4, totalLegacyEarned: 7, upgrades: { productionLevel: 1, discountLevel: 2 } } }),
    )

    expect(loaded?.meta.legacy).toBe(4)
    expect(loaded?.interior.id).toBe("emergencySetup")
    expect(loaded?.pairBonds.fatherChild).toBe(62)
  })
})
