import { describe, expect, it } from "vitest"

import { INITIAL_CAPACITIES, SAVE_VERSION } from "../constants"
import {
  applyOfflineProgress,
  deserializeState,
  loadState,
  serializeState,
} from "../persistence"
import { createInitialState } from "../store"

class MemoryStorage implements Storage {
  private values = new Map<string, string>()
  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe("persistence", () => {
  it("round trips the Trade Credits state", () => {
    const initial = createInitialState(1_000)
    const loaded = deserializeState(serializeState(initial))

    expect(loaded).toEqual(initial)
    expect(loaded?.capacities).toEqual(INITIAL_CAPACITIES)
  })

  it("falls back to a new state for malformed or unsupported saves", () => {
    const storage = new MemoryStorage()
    storage.setItem("convoy-save", "not-json")
    expect(loadState(storage, 5_000).lastSeenTimestamp).toBe(5_000)

    storage.setItem(
      "convoy-save",
      JSON.stringify({ ...createInitialState(), saveVersion: SAVE_VERSION + 1 }),
    )
    expect(loadState(storage, 6_000).lastSeenTimestamp).toBe(6_000)
  })

  it("applies capped offline credit production and keeps bond unchanged", () => {
    const initial = createInitialState(0)
    const withGenerator = {
      ...initial,
      generators: {
        ...initial.generators,
        fatherToolkit: {
          id: "fatherToolkit" as const,
          owned: 1,
          cycleProgressSeconds: 0,
        },
      },
    }
    const result = applyOfflineProgress(withGenerator, 12 * 60 * 60 * 1_000)

    expect(result.summary.offlineSeconds).toBe(10 * 60 * 60)
    expect(result.state.lastSeenTimestamp).toBe(12 * 60 * 60 * 1_000)
    expect(result.state.bond).toBe(initial.bond)
    expect(result.state.resources.credits).toBeGreaterThan(initial.resources.credits)
    expect(result.state.elapsedSeconds).toBe(10 * 60 * 60)
  })

  it("does not award progress when the clock moves backward", () => {
    const initial = createInitialState(10_000)
    const result = applyOfflineProgress(initial, 9_000)

    expect(result.summary.offlineSeconds).toBe(0)
    expect(result.state).toEqual({ ...initial, lastSeenTimestamp: 9_000 })
  })
})
