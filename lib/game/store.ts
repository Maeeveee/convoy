import { create } from "zustand"

import {
  CHARACTER_IDS,
  EXTERIOR_BY_LEVEL,
  INTERIOR_BY_LEVEL,
  fuelPricePerUnit,
  GENERATORS,
  INITIAL_CAPACITIES,
  INITIAL_RESOURCES,
  SAVE_VERSION,
} from "./constants"
import { bulkGeneratorPrice, resolvePurchaseQuantity } from "./generators"
import { buyExteriorUpgrade, buyInteriorUpgrade, legacyReward } from "./progression"
import { chooseEvent, eventById, EVENT_COOLDOWN_SECONDS, EVENT_INTERVAL_SECONDS, NIGHT_CHOICES } from "./events"
import { simulate } from "./simulation"
import type {
  ActionResult,
  CharacterId,
  GameState,
  GeneratorId,
  OfflineSummary,
  PurchaseQuantity,
  TaskId,
} from "./types"

export type GameStore = GameState & {
  isHydrated: boolean
  offlineSummary: OfflineSummary | null
  tick: (elapsedSeconds: number) => void
  hydrate: (state: GameState, summary: OfflineSummary) => void
  dismissOfflineSummary: () => void
  assignTask: (character: CharacterId, task: TaskId) => ActionResult
  buyGenerator: (
    generator: GeneratorId,
    quantity: PurchaseQuantity,
  ) => ActionResult
  buyExterior: (target: "emergencyTarp" | "enclosedVan") => ActionResult
  buyInterior: (target: "semiLivable" | "comfortableCabin") => ActionResult
  buyFuel: (amount: number) => ActionResult
  resolveEvent: (choiceId: string) => ActionResult
  resolveNight: (choiceId: string) => ActionResult
  prestige: () => ActionResult
  reset: () => void
}

export function createInitialState(now = Date.now()): GameState {
  return {
    saveVersion: SAVE_VERSION,
    resources: { ...INITIAL_RESOURCES },
    capacities: { ...INITIAL_CAPACITIES },
    characters: {
      father: { id: "father", task: "drive", energy: 100 },
      mother: { id: "mother", task: "trade", energy: 100 },
      child: { id: "child", task: "connect", energy: 100 },
    },
    generators: Object.fromEntries(
      Object.keys(GENERATORS).map((id) => [id, { id, owned: 0, cycleProgressSeconds: 0 }]),
    ) as GameState["generators"],
    exterior: { level: 1, id: EXTERIOR_BY_LEVEL[0] },
    interior: { level: 1, id: INTERIOR_BY_LEVEL[0] },
    bond: 62,
    pairBonds: { fatherMother: 62, fatherChild: 62, motherChild: 62 },
    bondSum: 0,
    bondSampleSeconds: 0,
    totalCreditsGenerated: 0,
    meta: { legacy: 0, totalLegacyEarned: 0, upgrades: { productionLevel: 0, discountLevel: 0 } },
    distance: 0,
    elapsedSeconds: 0,
    day: 1,
    lastSeenTimestamp: now,
    eventTimerSeconds: 0,
    pendingEvent: null,
    pendingNightDay: null,
    fuelPurchases: 0,
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createInitialState(),
  isHydrated: false,
  offlineSummary: null,
  tick: (elapsedSeconds) =>
    set((state) => {
      const next = simulate(state, elapsedSeconds)
      const crossedDay = next.day > state.day
      const timer = state.eventTimerSeconds + elapsedSeconds
      const trigger =
        next.resources.fuel <= 0
          ? "emptyFuel"
          : next.resources.fuel <= 20
          ? "lowFuel"
          : next.exterior.level === 1 && timer >= 120
            ? "openPickup"
            : next.bond <= 35
              ? "lowBond"
              : "scheduled"
      const shouldEvent =
        !state.pendingEvent &&
        !state.pendingNightDay &&
        (timer >= EVENT_INTERVAL_SECONDS ||
          (trigger !== "scheduled" && timer >= EVENT_COOLDOWN_SECONDS))
      return {
        ...next,
        eventTimerSeconds: shouldEvent ? 0 : timer,
        pendingEvent: shouldEvent ? chooseEvent(next, trigger).id : state.pendingEvent,
        pendingNightDay: crossedDay ? next.day : state.pendingNightDay,
        bondSum: state.bondSum + next.bond * elapsedSeconds,
        bondSampleSeconds: state.bondSampleSeconds + elapsedSeconds,
        totalCreditsGenerated: state.totalCreditsGenerated + Math.max(next.resources.credits - state.resources.credits, 0),
      }
    }),
  hydrate: (state, summary) =>
    set({
      ...state,
      isHydrated: true,
      offlineSummary: summary.offlineSeconds > 1 ? summary : null,
    }),
  dismissOfflineSummary: () => set({ offlineSummary: null }),
  assignTask: (character, task) => {
    if (!CHARACTER_IDS.includes(character)) {
      return { ok: false, reason: "Unknown character." }
    }
    set((state) => ({
      characters: {
        ...state.characters,
        [character]: { ...state.characters[character], task },
      },
      lastSeenTimestamp: Date.now(),
    }))
    return { ok: true }
  },
  buyGenerator: (generator, requestedQuantity) => {
    const state = get()
    const quantity = resolvePurchaseQuantity(state, generator, requestedQuantity)
    if (quantity < 1) return { ok: false, reason: "Not enough Trade Credits." }
    const cost = bulkGeneratorPrice(
      generator,
      state.generators[generator].owned,
      quantity,
    )
    if (cost > state.resources.credits) {
      return { ok: false, reason: "Not enough Trade Credits." }
    }
    set({
      resources: {
        ...state.resources,
        credits: state.resources.credits - cost,
      },
      generators: {
        ...state.generators,
        [generator]: {
          ...state.generators[generator],
          owned: state.generators[generator].owned + quantity,
        },
      },
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true, amount: quantity }
  },
  buyExterior: (target) => {
    const result = buyExteriorUpgrade(get(), target)
    if (result.result.ok) set(result.state)
    return result.result
  },
  buyInterior: (target) => {
    const result = buyInteriorUpgrade(get(), target)
    if (result.result.ok) set(result.state)
    return result.result
  },
  buyFuel: (amount) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, reason: "Enter a valid fuel amount." }
    }
    const state = get()
    const availableCapacity = state.capacities.fuel - state.resources.fuel
    const fuel = Math.min(Math.floor(amount), Math.floor(availableCapacity))
    const cost = fuel * fuelPricePerUnit(state.fuelPurchases)
    if (fuel < 1) return { ok: false, reason: "Fuel tank is already full." }
    if (cost > state.resources.credits) {
      return { ok: false, reason: "Not enough Trade Credits." }
    }
    set({
      resources: {
        ...state.resources,
        fuel: state.resources.fuel + fuel,
        credits: state.resources.credits - cost,
      },
      lastSeenTimestamp: Date.now(),
      fuelPurchases: state.fuelPurchases + 1,
    })
    return { ok: true, amount: fuel }
  },
  resolveEvent: (choiceId) => {
    const state = get()
    if (!state.pendingEvent) return { ok: false, reason: "No event is waiting." }
    const event = eventById(state.pendingEvent)
    const choice = event?.choices.find((item) => item.id === choiceId)
    if (!choice) return { ok: false, reason: "That event choice is unavailable." }
    set({
      resources: {
        fuel: Math.max(Math.min(state.resources.fuel + (choice.fuel ?? 0), state.capacities.fuel), 0),
        credits: Math.max(state.resources.credits + (choice.credits ?? 0), 0),
      },
      bond: Math.min(Math.max(state.bond + (choice.bond ?? 0), 0), 100),
      pendingEvent: null,
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true }
  },
  resolveNight: (choiceId) => {
    const state = get()
    if (!state.pendingNightDay) return { ok: false, reason: "No family moment is waiting." }
    const choice = NIGHT_CHOICES.find((item) => item.id === choiceId)
    if (!choice) return { ok: false, reason: "That family choice is unavailable." }
    set({
      resources: {
        fuel: Math.max(Math.min(state.resources.fuel + (choice.fuel ?? 0), state.capacities.fuel), 0),
        credits: Math.max(state.resources.credits + (choice.credits ?? 0), 0),
      },
      bond: Math.min(Math.max(state.bond + (choice.bond ?? 0), 0), 100),
      pendingNightDay: null,
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true }
  },
  prestige: () => {
    const state = get()
    const earned = legacyReward(state)
    if (earned < 1) return { ok: false, reason: "This journey has not earned Legacy yet." }
    const fresh = createInitialState(Date.now())
    set({
      ...fresh,
      meta: { ...state.meta, legacy: state.meta.legacy + earned, totalLegacyEarned: state.meta.totalLegacyEarned + earned },
      isHydrated: true,
      offlineSummary: null,
    })
    return { ok: true, amount: earned }
  },
  reset: () =>
    set({ ...createInitialState(), isHydrated: true, offlineSummary: null }),
}))
