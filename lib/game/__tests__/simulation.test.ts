import { describe, expect, it } from "vitest"

import { createInitialState } from "../store"
import { simulate } from "../simulation"

describe("simulation", () => {
  it("produces a deterministic one-minute tick", () => {
    const initial = createInitialState(1_000)
    const next = simulate(initial, 60, 2_000)

    expect(next.resources.fuel).toBeCloseTo(79.88)
    expect(next.resources.provisions).toBeCloseTo(64.94)
    expect(next.distance).toBeCloseTo(0.8)
    expect(next.bond).toBeCloseTo(62.08)
    expect(next.lastSeenTimestamp).toBe(2_000)
  })

  it("does not move at full speed when fuel is empty", () => {
    const initial = createInitialState(1_000)
    const next = simulate(
      { ...initial, resources: { ...initial.resources, fuel: 0 } },
      60,
      2_000,
    )

    expect(next.distance).toBeCloseTo(0.12)
  })

  it("applies the active tick cap", () => {
    const initial = createInitialState(1_000)
    const next = simulate(initial, 20_000, 2_000)

    expect(next.elapsedSeconds).toBe(10)
  })

  it("applies a generator's milestone multiplier", () => {
    const initial = createInitialState(1_000)
    const next = simulate(
      {
        ...initial,
        generators: {
          ...initial.generators,
          fatherToolkit: { id: "fatherToolkit", owned: 25 },
        },
      },
      1,
      2_000,
    )

    // 25 * 0.12 * x2 milestone * bond modifier * child connection bonus.
    expect(next.resources.spareParts).toBeCloseTo(125.8488, 3)
  })
})
