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
  MAX_MEMORIES,
  OBJECTIVE_ORDER,
  OBJECTIVES,
  SETTLEMENT_ORDER,
  SETTLEMENTS,
  ROUTES,
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
  RouteId,
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
  chooseRoute: (route: RouteId) => ActionResult
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
    route: "safe",
    objective: { id: OBJECTIVE_ORDER[0], progress: 0, completed: false },
    objectiveIndex: 0,
    pendingSettlement: null,
    nextSettlementIndex: 0,
    memories: [],
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
      const nextWithTotals = {
        ...next,
        totalCreditsGenerated: state.totalCreditsGenerated + Math.max(next.resources.credits - state.resources.credits, 0),
      }
      const objectiveResult = updateObjective(state, nextWithTotals)
      const settlement = SETTLEMENT_ORDER[state.nextSettlementIndex]
      const reachedSettlement = Boolean(
        settlement &&
          !state.pendingEvent &&
          !state.pendingNightDay &&
          !state.pendingSettlement &&
          next.distance >= SETTLEMENTS[settlement].threshold &&
          state.distance < SETTLEMENTS[settlement].threshold,
      )
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
        !state.pendingSettlement &&
        !reachedSettlement &&
        (timer >= EVENT_INTERVAL_SECONDS * ROUTES[next.route].eventMultiplier ||
          (trigger !== "scheduled" && timer >= EVENT_COOLDOWN_SECONDS * ROUTES[next.route].eventMultiplier))
      return {
        ...nextWithTotals,
        eventTimerSeconds: shouldEvent ? 0 : timer,
        pendingEvent: shouldEvent ? chooseEvent(next, trigger).id : state.pendingEvent,
        pendingNightDay: crossedDay ? next.day : state.pendingNightDay,
        pendingSettlement: reachedSettlement ? settlement : state.pendingSettlement,
        objective: objectiveResult.objective,
        objectiveIndex: objectiveResult.objectiveIndex,
        resources: {
          ...next.resources,
          credits: next.resources.credits + objectiveResult.rewardCredits,
          fuel: Math.min(next.capacities.fuel, next.resources.fuel + objectiveResult.rewardFuel),
        },
        bond: Math.min(100, next.bond + objectiveResult.rewardBond),
        memories: [...next.memories, ...objectiveResult.memories].slice(-MAX_MEMORIES),
        bondSum: state.bondSum + next.bond * elapsedSeconds,
        bondSampleSeconds: state.bondSampleSeconds + elapsedSeconds,
        totalCreditsGenerated: nextWithTotals.totalCreditsGenerated,
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
      memories: addMemory(state, `The family chose: ${choice.label}.`),
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
      memories: addMemory(state, `The family chose: ${choice.label}.`),
      lastSeenTimestamp: Date.now(),
    })
    return { ok: true }
  },
  chooseRoute: (route: RouteId) => {
    const state = get()
    if (!state.pendingSettlement) return { ok: false, reason: "No settlement is waiting." }
    const settlement = SETTLEMENTS[state.pendingSettlement]
    set({
      route,
      pendingSettlement: null,
      resources: {
        ...state.resources,
        credits: state.resources.credits + settlement.rewardCredits,
        fuel: Math.min(state.capacities.fuel, state.resources.fuel + settlement.rewardFuel),
      },
      nextSettlementIndex: state.nextSettlementIndex + 1,
      memories: addMemory(state, `The family reached ${settlement.label} and took the ${ROUTE_LABELS[route].toLowerCase()}.`),
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

const ROUTE_LABELS: Record<RouteId, string> = { safe: "Safe road", ruins: "Ruins road", community: "Community road" }

function addMemory(state: GameState, text: string) {
  return [...state.memories, { id: `${Date.now()}-${state.memories.length}`, text, elapsedSeconds: state.elapsedSeconds }].slice(-MAX_MEMORIES)
}

function updateObjective(state: GameState, next: GameState) {
  const definition = OBJECTIVES[state.objective.id]
  const progress = Math.min(definition.target, objectiveProgress(state.objective.id, state, next))
  if (state.objective.completed || progress < definition.target) {
    return { objective: { ...state.objective, progress }, objectiveIndex: state.objectiveIndex, rewardCredits: 0, rewardFuel: 0, rewardBond: 0, memories: [] }
  }
  const nextIndex = state.objectiveIndex + 1
  const nextId = OBJECTIVE_ORDER[nextIndex % OBJECTIVE_ORDER.length]
  return {
    objective: { id: nextId, progress: 0, completed: false },
    objectiveIndex: nextIndex,
    rewardCredits: definition.rewardCredits ?? 0,
    rewardFuel: definition.rewardFuel ?? 0,
    rewardBond: definition.rewardBond ?? 0,
    memories: [{ id: `objective-${nextIndex}`, text: `The family completed: ${definition.label}.`, elapsedSeconds: next.elapsedSeconds }],
  }
}

function objectiveProgress(id: GameState["objective"]["id"], before: GameState, after: GameState) {
  if (id === "firstExchange") return after.totalCreditsGenerated
  if (id === "keepMoving") return after.distance
  if (id === "holdTogether") return after.bond
  return after.resources.fuel
}
