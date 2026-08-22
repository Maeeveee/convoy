import { describe, expect, it } from "vitest"

import { bulkGeneratorPrice } from "../generators"
import { createInitialState, useGameStore } from "../store"
import { buyExteriorUpgrade } from "../progression"

describe("progression transactions", () => {
  it("rejects an upgrade without enough spare parts", () => {
    const state = createInitialState(1_000)
    const result = buyExteriorUpgrade(state, "emergencyTarp")

    expect(result.result).toEqual({ ok: false, reason: "Not enough spare parts." })
    expect(result.state.exterior.level).toBe(1)
  })

  it("purchases the next upgrade instantly", () => {
    const state = {
      ...createInitialState(1_000),
      resources: { ...createInitialState(1_000).resources, spareParts: 1_500 },
    }
    const result = buyExteriorUpgrade(state, "emergencyTarp")

    expect(result.result).toEqual({ ok: true })
    expect(result.state.exterior.level).toBe(2)
    expect(result.state.resources.spareParts).toBe(0)
  })

  it("buys exactly enough generators to reach the next milestone", () => {
    useGameStore.getState().reset()
    const cost = bulkGeneratorPrice("fatherToolkit", 24, 1)
    useGameStore.setState((state) => ({
      resources: { ...state.resources, spareParts: cost },
      generators: {
        ...state.generators,
        fatherToolkit: {
          id: "fatherToolkit",
          owned: 24,
          cycleProgressSeconds: 0,
        },
      },
    }))

    const result = useGameStore.getState().buyGenerator("fatherToolkit", "next")

    expect(result).toEqual({ ok: true, amount: 1 })
    expect(useGameStore.getState().generators.fatherToolkit.owned).toBe(25)
    expect(useGameStore.getState().resources.spareParts).toBeCloseTo(0)
  })

  it("rejects a next-milestone purchase when the full quantity is unaffordable", () => {
    useGameStore.getState().reset()

    const result = useGameStore.getState().buyGenerator("fatherToolkit", "next")

    expect(result).toEqual({ ok: false, reason: "Not enough spare parts." })
    expect(useGameStore.getState().generators.fatherToolkit.owned).toBe(0)
  })
})
