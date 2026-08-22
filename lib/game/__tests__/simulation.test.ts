import { describe, expect, it } from "vitest"

import { createInitialState } from "../store"
import { creditOutputPerCycle, simulate } from "../simulation"

describe("simulation", () => {
  it("consumes fuel and produces credits through a completed cycle", () => {
    const initial = createInitialState(1_000)
    const next = simulate(
      {
        ...initial,
        generators: {
          ...initial.generators,
          fatherToolkit: {
            id: "fatherToolkit",
            owned: 1,
            cycleProgressSeconds: 0,
          },
        },
      },
      10,
      2_000,
    )

    expect(next.resources.fuel).toBeCloseTo(59.7)
    expect(next.resources.credits).toBeCloseTo(156.16, 2)
    expect(next.distance).toBeCloseTo(0.8)
    expect(next.bond).toBeCloseTo(62.08)
    expect(next.lastSeenTimestamp).toBe(2_000)
  })

  it("does not move at full speed when fuel is empty", () => {
    const initial = createInitialState(1_000)
    const next = simulate(
      { ...initial, resources: { ...initial.resources, fuel: 0 } },
      10,
      2_000,
    )

    expect(next.distance).toBe(0)
  })

  it("applies the active tick cap", () => {
    const initial = createInitialState(1_000)
    const next = simulate(initial, 20_000, 2_000)

    expect(next.elapsedSeconds).toBe(10)
  })

  it("halves a generator cycle at its milestone", () => {
    const initial = createInitialState(1_000)
    const next = simulate(
      {
        ...initial,
        generators: {
          ...initial.generators,
          fatherToolkit: {
            id: "fatherToolkit",
            owned: 25,
            cycleProgressSeconds: 0,
          },
        },
      },
      5,
      2_000,
    )

    expect(next.resources.credits).toBeGreaterThan(initial.resources.credits)
    expect(next.generators.fatherToolkit.cycleProgressSeconds).toBe(0)
  })

  it("uses the same modified payout shown by the generator panel", () => {
    const state = createInitialState(1_000)

    expect(creditOutputPerCycle(state, 14, 4)).toBeCloseTo(86.24, 2)
  })

  it("keeps generator payout stable when bond changes", () => {
    const state = createInitialState(1_000)
    expect(creditOutputPerCycle(state, 14, 4)).toBe(
      creditOutputPerCycle({ ...state, bond: 100 }, 14, 4),
    )
  })

  it("does not award credits before a cycle completes", () => {
    const initial = {
      ...createInitialState(0),
      generators: {
        ...createInitialState(0).generators,
        fatherToolkit: { id: "fatherToolkit" as const, owned: 1, cycleProgressSeconds: 0 },
      },
    }
    const next = simulate(initial, 9, 9_000)
    expect(next.resources.credits).toBe(initial.resources.credits)
    expect(next.generators.fatherToolkit.cycleProgressSeconds).toBe(9)
  })
})
