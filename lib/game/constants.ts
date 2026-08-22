import type {
  CharacterId,
  ExteriorUpgradeId,
  GeneratorId,
  TaskId,
} from "./types"

export const SAVE_VERSION = 2
export const DAY_DURATION_SECONDS = 5 * 60
export const MAX_ACTIVE_TICK_SECONDS = 10
export const MAX_OFFLINE_SECONDS = 10 * 60 * 60
export const OFFLINE_MULTIPLIER = 0.6

export const INITIAL_RESOURCES = {
  fuel: 60,
  credits: 150,
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

export const CHARACTER_IDS: CharacterId[] = ["father", "mother", "child"]

export const TASKS: Record<TaskId, { label: string; description: string }> = {
  drive: { label: "Keep watch", description: "Keeps the convoy moving steadily." },
  repair: { label: "Repair", description: "Improves Trade Credit production." },
  trade: { label: "Manage trade", description: "Improves Trade Credit production." },
  connect: { label: "Reach out", description: "Improves credits and bond." },
  rest: { label: "Rest", description: "Recovers energy and protects bond." },
}

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
