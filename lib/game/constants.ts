import type {
  CharacterId,
  ExteriorUpgradeId,
  GeneratorId,
  TaskId,
} from "./types"

export const SAVE_VERSION = 1
export const DAY_DURATION_SECONDS = 5 * 60
export const MAX_ACTIVE_TICK_SECONDS = 10
export const MAX_OFFLINE_SECONDS = 10 * 60 * 60
export const OFFLINE_MULTIPLIER = 0.6

export const INITIAL_RESOURCES = {
  fuel: 80,
  provisions: 65,
  spareParts: 120,
} as const

export const INITIAL_CAPACITIES = {
  fuel: 100,
  provisions: 100,
  spareParts: Number.POSITIVE_INFINITY,
} as const

export const BASE_CONSUMPTION_PER_SECOND = {
  fuel: 0.012,
  provisions: 0.006,
} as const

export const BASE_DISTANCE_PER_SECOND = 0.08

export const CHARACTER_IDS: CharacterId[] = ["father", "mother", "child"]

export const TASKS: Record<TaskId, { label: string; description: string }> = {
  drive: { label: "Keep watch", description: "Keeps the convoy moving steadily." },
  repair: { label: "Repair", description: "Improves spare-parts production." },
  provision: { label: "Manage stores", description: "Improves provisions production." },
  connect: { label: "Reach out", description: "Improves bond very slowly." },
  rest: { label: "Rest", description: "Recovers energy and protects bond." },
}

export const GENERATORS: Record<
  GeneratorId,
  {
    label: string
    description: string
    resource: "fuel" | "provisions" | "spareParts"
    cycleSeconds: number
    outputPerCycle: number
    basePrice: number
    growth: number
  }
> = {
  fatherToolkit: {
    label: "Father's toolkit",
    description: "Small repairs become a steady parts trickle.",
    resource: "spareParts",
    cycleSeconds: 10,
    outputPerCycle: 1,
    basePrice: 30,
    growth: 1.12,
  },
  emergencyFood: {
    label: "Emergency cans",
    description: "Mother keeps a reserve ready for lean days.",
    resource: "provisions",
    cycleSeconds: 30,
    outputPerCycle: 1,
    basePrice: 45,
    growth: 1.13,
  },
  handRadio: {
    label: "Hand radio",
    description: "Information opens better barter routes.",
    resource: "spareParts",
    cycleSeconds: 120,
    outputPerCycle: 3,
    basePrice: 160,
    growth: 1.14,
  },
  truckGarden: {
    label: "Truck-bed garden",
    description: "A little green life follows the family.",
    resource: "provisions",
    cycleSeconds: 180,
    outputPerCycle: 3,
    basePrice: 220,
    growth: 1.14,
  },
  waterPurifier: {
    label: "Water purifier",
    description: "Turns questionable finds into usable stores.",
    resource: "provisions",
    cycleSeconds: 300,
    outputPerCycle: 5,
    basePrice: 400,
    growth: 1.15,
  },
  backupBattery: {
    label: "Backup battery",
    description: "Keeps the old systems running longer.",
    resource: "fuel",
    cycleSeconds: 600,
    outputPerCycle: 2,
    basePrice: 600,
    growth: 1.15,
  },
  miniGenerator: {
    label: "Mini generator",
    description: "A noisy but dependable power source.",
    resource: "fuel",
    cycleSeconds: 1_200,
    outputPerCycle: 5,
    basePrice: 1_200,
    growth: 1.15,
  },
  childBarter: {
    label: "Child's barter network",
    description: "A growing web of voices and favors.",
    resource: "spareParts",
    cycleSeconds: 3_600,
    outputPerCycle: 20,
    basePrice: 2_500,
    growth: 1.15,
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
    cost: 1_500,
  },
  enclosedVan: {
    level: 3,
    label: "Enclosed van",
    description: "A safer shell for the family and their growing stores.",
    cost: 8_000,
  },
}

export const EXTERIOR_BY_LEVEL: ExteriorUpgradeId[] = [
  "openPickup",
  "emergencyTarp",
  "enclosedVan",
]
