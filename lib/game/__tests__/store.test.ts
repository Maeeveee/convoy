import { describe, expect, it } from "vitest"

import { bulkGeneratorPrice } from "../generators"
import { createInitialState, useGameStore } from "../store"
import { buyExteriorUpgrade } from "../progression"

describe("progression transactions", () => {
  it("rejects an upgrade without enough Trade Credits", () => {
    const state = createInitialState(1_000)
    const result = buyExteriorUpgrade(state, "emergencyTarp")

    expect(result.result).toEqual({ ok: false, reason: "Not enough Trade Credits." })
    expect(result.state.exterior.level).toBe(1)
  })

  it("purchases the next upgrade instantly", () => {
    const initial = createInitialState(1_000)
    const state = {
      ...initial,
      resources: { ...initial.resources, credits: 3_000 },
    }
    const result = buyExteriorUpgrade(state, "emergencyTarp")

    expect(result.result).toEqual({ ok: true })
    expect(result.state.exterior.level).toBe(2)
    expect(result.state.resources.credits).toBe(0)
  })

  it("buys exactly enough generators to reach the next milestone", () => {
    useGameStore.getState().reset()
    const cost = bulkGeneratorPrice("fatherToolkit", 24, 1)
    useGameStore.setState((state) => ({
      resources: { ...state.resources, credits: cost },
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
    expect(useGameStore.getState().resources.credits).toBeCloseTo(0)
  })

  it("converts credits into fuel up to tank capacity", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({
      resources: { ...state.resources, fuel: 60, credits: 100 },
    }))

    const result = useGameStore.getState().buyFuel(20)

    expect(result).toEqual({ ok: true, amount: 20 })
    expect(useGameStore.getState().resources.fuel).toBe(80)
    expect(useGameStore.getState().resources.credits).toBe(50)
  })

  it("raises the fuel price after each successful refill", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({
      resources: { ...state.resources, fuel: 0, credits: 1_000 },
    }))

    useGameStore.getState().buyFuel(10)
    expect(useGameStore.getState().fuelPurchases).toBe(1)
    expect(useGameStore.getState().resources.credits).toBe(975)

    useGameStore.getState().buyFuel(10)
    expect(useGameStore.getState().fuelPurchases).toBe(2)
    expect(useGameStore.getState().resources.credits).toBe(948)
  })

  it("does not schedule a reactive event while a decision is pending", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({
      resources: { ...state.resources, fuel: 10 },
      pendingNightDay: 2,
      eventTimerSeconds: 60,
    }))

    useGameStore.getState().tick(1)

    expect(useGameStore.getState().pendingEvent).toBeNull()
    expect(useGameStore.getState().pendingNightDay).toBe(2)
  })

  it("completes the first objective and records a memory", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({
      totalCreditsGenerated: 494,
      resources: { ...state.resources, credits: 640 },
      generators: {
        ...state.generators,
        fatherToolkit: { ...state.generators.fatherToolkit, owned: 1, cycleProgressSeconds: 9 },
      },
    }))

    useGameStore.getState().tick(10)

    expect(useGameStore.getState().objective.id).toBe("keepMoving")
    expect(useGameStore.getState().memories.at(-1)?.text).toContain("Make the next exchange")
  })

  it("opens a settlement and applies the chosen route reward", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({ distance: 49.5, resources: { ...state.resources, fuel: 50 } }))

    useGameStore.getState().tick(10)
    expect(useGameStore.getState().pendingSettlement).toBe("junction")

    expect(useGameStore.getState().chooseRoute("ruins")).toEqual({ ok: true })
    expect(useGameStore.getState().route).toBe("ruins")
    expect(useGameStore.getState().memories.at(-1)?.text).toContain("ruins road")
  })

  it("does not loop completed objectives or keep adding memories", () => {
    useGameStore.getState().reset()
    useGameStore.setState((state) => ({
      objective: { ...state.objective, id: "keepReserve", progress: 79, completed: false },
      objectiveIndex: 3,
      resources: { ...state.resources, fuel: 81 },
      memories: [],
    }))

    useGameStore.getState().tick(1)
    const completedMemories = useGameStore.getState().memories.length
    expect(useGameStore.getState().objective.completed).toBe(true)

    useGameStore.getState().tick(1)
    expect(useGameStore.getState().memories.length).toBe(completedMemories)
  })

  it("removes duplicate memory IDs when hydrating a legacy save", () => {
    const state = createInitialState(0)
    const duplicate = { id: "objective-706", text: "Repeated memory", elapsedSeconds: 10 }

    useGameStore.getState().hydrate(
      { ...state, memories: [duplicate, duplicate] },
      { offlineSeconds: 0, fuelChange: 0, creditsGained: 0, distanceGained: 0 },
    )

    expect(useGameStore.getState().memories).toEqual([duplicate])
  })
})
