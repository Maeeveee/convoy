import type {
  CharacterId,
  ExteriorUpgradeId,
  GeneratorId,
  InteriorUpgradeId,
  TaskId,
  ObjectiveId,
  RouteId,
  SettlementId,
} from "./types"

export const SAVE_VERSION = 5
export const LEGACY_THRESHOLD = 10_000
export const DAY_DURATION_SECONDS = 5 * 60
export const MAX_ACTIVE_TICK_SECONDS = 10
export const MAX_OFFLINE_SECONDS = 10 * 60 * 60
export const OFFLINE_MULTIPLIER = 0.6

export const INITIAL_RESOURCES = {
  fuel: 60,
  credits: 50,
} as const

export const INITIAL_CAPACITIES = {
  fuel: 100,
  credits: Number.POSITIVE_INFINITY,
} as const

export const BASE_CONSUMPTION_PER_SECOND = {
  fuel: 0.03,
} as const

export const BASE_DISTANCE_PER_SECOND = 0.08
export const FUEL_PRICE_PER_UNIT = 2.5
export const FUEL_PRICE_GROWTH = 1.08

export function fuelPricePerUnit(purchases: number) {
  return FUEL_PRICE_PER_UNIT * FUEL_PRICE_GROWTH ** purchases
}

export const CHARACTER_IDS: CharacterId[] = ["father", "mother", "child"]

export const TASKS: Record<TaskId, { label: string; description: string }> = {
  drive: { label: "Keep watch", description: "Keeps the convoy moving steadily." },
  repair: { label: "Repair", description: "Improves Trade Credit production." },
  trade: { label: "Manage trade", description: "Improves Trade Credit production." },
  connect: { label: "Reach out", description: "Improves credits and bond." },
  rest: { label: "Rest", description: "Recovers energy and protects bond." },
}

export const ENERGY_COST_PER_SECOND: Record<TaskId, number> = {
  drive: 0.012,
  repair: 0.032,
  trade: 0.026,
  connect: 0.02,
  rest: -0.08,
}

export const ROUTES: Record<RouteId, { label: string; description: string; fuelMultiplier: number; creditMultiplier: number; distanceMultiplier: number; bondDelta: number; eventMultiplier: number }> = {
  safe: { label: "Safe road", description: "Reliable ground with fewer surprises.", fuelMultiplier: 0.9, creditMultiplier: 1, distanceMultiplier: 0.9, bondDelta: 0.0005, eventMultiplier: 0.75 },
  ruins: { label: "Through the ruins", description: "More salvage, more fuel use, more danger.", fuelMultiplier: 1.25, creditMultiplier: 1.25, distanceMultiplier: 1.15, bondDelta: -0.0005, eventMultiplier: 1.3 },
  community: { label: "Community road", description: "Slower travel with people willing to help.", fuelMultiplier: 1, creditMultiplier: 1, distanceMultiplier: 0.8, bondDelta: 0.002, eventMultiplier: 0.9 },
}

export const OBJECTIVES: Record<ObjectiveId, { label: string; description: string; target: number; rewardCredits?: number; rewardFuel?: number; rewardBond?: number }> = {
  firstExchange: { label: "Make the next exchange", description: "Generate 500 Trade Credits.", target: 500, rewardCredits: 150 },
  keepMoving: { label: "Keep moving", description: "Travel 30 km.", target: 30, rewardFuel: 15 },
  holdTogether: { label: "Hold together", description: "Raise Family Bond to 75.", target: 75, rewardCredits: 100, rewardBond: 3 },
  keepReserve: { label: "Keep a reserve", description: "Reach 80 Fuel without running dry.", target: 80, rewardFuel: 10 },
}

export const OBJECTIVE_ORDER: ObjectiveId[] = ["firstExchange", "keepMoving", "holdTogether", "keepReserve"]
export const SETTLEMENTS: Record<SettlementId, { label: string; threshold: number; rewardCredits: number; rewardFuel: number }> = {
  junction: { label: "The old junction", threshold: 50, rewardCredits: 120, rewardFuel: 8 },
  waterline: { label: "Waterline settlement", threshold: 150, rewardCredits: 300, rewardFuel: 15 },
  greenhouse: { label: "The greenhouse", threshold: 300, rewardCredits: 700, rewardFuel: 25 },
}
export const SETTLEMENT_ORDER: SettlementId[] = ["junction", "waterline", "greenhouse"]
export const MAX_MEMORIES = 12

export const GENERATORS: Record<
  GeneratorId,
  {
    label: string
    description: string
    cycleSeconds: number
    outputPerCycle: number
    basePrice: number
    growth: number
  }
> = {
  fatherToolkit: {
    label: "Father's toolkit",
    description: "Small repairs earn dependable Trade Credits.",
    cycleSeconds: 10,
    outputPerCycle: 4,
    basePrice: 25,
    growth: 1.1,
  },
  emergencyFood: {
    label: "Emergency cans",
    description: "Mother trades carefully managed emergency stock.",
    cycleSeconds: 30,
    outputPerCycle: 30,
    basePrice: 75,
    growth: 1.1,
  },
  handRadio: {
    label: "Hand radio",
    description: "Information opens better barter routes.",
    cycleSeconds: 120,
    outputPerCycle: 400,
    basePrice: 250,
    growth: 1.1,
  },
  truckGarden: {
    label: "Truck-bed garden",
    description: "A little green life follows the family.",
    cycleSeconds: 180,
    outputPerCycle: 1_200,
    basePrice: 500,
    growth: 1.1,
  },
  waterPurifier: {
    label: "Water purifier",
    description: "Turns questionable finds into usable stores.",
    cycleSeconds: 300,
    outputPerCycle: 4_000,
    basePrice: 1_000,
    growth: 1.1,
  },
  backupBattery: {
    label: "Backup battery",
    description: "Keeps the old systems running longer.",
    cycleSeconds: 600,
    outputPerCycle: 16_000,
    basePrice: 2_000,
    growth: 1.1,
  },
  miniGenerator: {
    label: "Mini generator",
    description: "A noisy but dependable power source.",
    cycleSeconds: 1_200,
    outputPerCycle: 80_000,
    basePrice: 5_000,
    growth: 1.1,
  },
  childBarter: {
    label: "Child's barter network",
    description: "A growing web of voices and favors.",
    cycleSeconds: 3_600,
    outputPerCycle: 600_000,
    basePrice: 12_000,
    growth: 1.1,
  },
}

export const GENERATOR_MILESTONES = [25, 50, 100, 200] as const
export const GENERATOR_MILESTONE_GROWTH = 100
export const ALL_GENERATORS_MILESTONES = [1, 25, 50, 100, 200] as const
export const ALL_GENERATORS_MILESTONE_GROWTH = 100
export const ALL_GENERATORS_OUTPUT_MULTIPLIER = 1.5
export const ALL_GENERATORS_SPEED_MULTIPLIER = 2
export const LEGACY_PRODUCTION_BONUS = 0.002

export const EXTERIOR_UPGRADES: Record<
  ExteriorUpgradeId,
  { level: number; label: string; description: string; cost: number }
> = {
  openPickup: {
    level: 1,
    label: "Open pickup",
    description: "Fast and exposed. The journey starts here.",
    cost: 0,
  },
  emergencyTarp: {
    level: 2,
    label: "Emergency tarp",
    description: "Shelter from the worst weather and watchful eyes.",
    cost: 3_000,
  },
  enclosedVan: {
    level: 3,
    label: "Enclosed van",
    description: "A safer shell for the family and their growing stores.",
    cost: 20_000,
  },
}

export const EXTERIOR_BY_LEVEL: ExteriorUpgradeId[] = [
  "openPickup",
  "emergencyTarp",
  "enclosedVan",
]

export const INTERIOR_UPGRADES: Record<InteriorUpgradeId, { level: number; label: string; description: string; cost: number }> = {
  emergencySetup: { level: 1, label: "Emergency setup", description: "A mattress, stove, and enough order to sleep safely.", cost: 0 },
  semiLivable: { level: 2, label: "Semi-livable cabin", description: "A real bed and a compact kitchen make long days easier.", cost: 5_000 },
  comfortableCabin: { level: 3, label: "Comfortable cabin", description: "A divider, clear radio, and organized storage restore privacy.", cost: 35_000 },
}
export const INTERIOR_BY_LEVEL: InteriorUpgradeId[] = ["emergencySetup", "semiLivable", "comfortableCabin"]
