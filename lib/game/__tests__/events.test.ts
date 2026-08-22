import { describe, expect, it } from "vitest"

import { chooseEvent, eventById, EVENTS, NIGHT_CHOICES } from "../events"
import { reportCard } from "../progression"
import { createInitialState } from "../store"

describe("events and report card", () => {
  it("selects only events eligible for the current exterior", () => {
    const state = { ...createInitialState(0), exterior: { level: 1, id: "openPickup" as const } }
    const selected = chooseEvent({ ...state, distance: 5_000, elapsedSeconds: 5_000 })

    expect(selected.minExteriorLevel ?? 1).toBeLessThanOrEqual(state.exterior.level)
    expect(EVENTS.length).toBeGreaterThanOrEqual(5)
  })

  it("supports condition-based event pools", () => {
    const state = { ...createInitialState(0), resources: { fuel: 10, credits: 0 } }
    expect(chooseEvent(state, "lowFuel").trigger).toBe("lowFuel")
    expect(chooseEvent({ ...state, exterior: { level: 1, id: "openPickup" } }, "openPickup").trigger).toBe("openPickup")
  })

  it("exposes authored choices with deterministic consequences", () => {
    const event = eventById("roadsideMarket")

    expect(event?.choices[0]).toMatchObject({ id: "trade", credits: 180, bond: 1 })
    expect(NIGHT_CHOICES.length).toBeGreaterThanOrEqual(3)
  })

  it("scores distance, upgrade level, and bond", () => {
    const initial = createInitialState(0)
    const report = reportCard({
      ...initial,
      distance: 600,
      bond: 100,
      exterior: { level: 3, id: "enclosedVan" },
    })

    expect(report.score).toBe(130)
    expect(report.label).toBe("Full Survivor")
  })
})
