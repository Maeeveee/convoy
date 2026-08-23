export type ResourceKey = "fuel" | "credits"

export type CharacterId = "father" | "mother" | "child"

export type TaskId = "drive" | "repair" | "trade" | "connect" | "rest"

export type GeneratorId =
  | "fatherToolkit"
  | "emergencyFood"
  | "handRadio"
  | "truckGarden"
  | "waterPurifier"
  | "backupBattery"
  | "miniGenerator"
  | "childBarter"

export type ExteriorUpgradeId = "openPickup" | "emergencyTarp" | "enclosedVan"
export type InteriorUpgradeId = "emergencySetup" | "semiLivable" | "comfortableCabin"
export type BondPair = "fatherMother" | "fatherChild" | "motherChild"
export type EventId = "roadsideMarket" | "looseBelt" | "radioDistress" | "waterTower" | "nightWatch" | "strangerChild" | "emptyTank"
export type EventTrigger = "scheduled" | "lowFuel" | "emptyFuel" | "openPickup" | "lowBond"
export type RouteId = "safe" | "ruins" | "community"
export type ObjectiveId = "firstExchange" | "keepMoving" | "holdTogether" | "keepReserve"
export type SettlementId = "junction" | "waterline" | "greenhouse"

export type Resources = Record<ResourceKey, number>

export type CharacterState = {
  id: CharacterId
  task: TaskId
  energy: number
}

export type ObjectiveState = {
  id: ObjectiveId
  progress: number
  completed: boolean
}

export type FamilyMemory = {
  id: string
  text: string
  elapsedSeconds: number
}

export type GeneratorState = {
  id: GeneratorId
  owned: number
  cycleProgressSeconds: number
}

export type ExteriorState = {
  level: number
  id: ExteriorUpgradeId
}

export type InteriorState = { level: number; id: InteriorUpgradeId }
export type PairBonds = Record<BondPair, number>
export type MetaProgression = {
  legacy: number
  totalLegacyEarned: number
  upgrades: { productionLevel: number; discountLevel: number }
}

export type GameState = {
  saveVersion: number
  resources: Resources
  capacities: Resources
  characters: Record<CharacterId, CharacterState>
  generators: Record<GeneratorId, GeneratorState>
  exterior: ExteriorState
  interior: InteriorState
  bond: number
  pairBonds: PairBonds
  bondSum: number
  bondSampleSeconds: number
  totalCreditsGenerated: number
  meta: MetaProgression
  distance: number
  elapsedSeconds: number
  day: number
  lastSeenTimestamp: number
  eventTimerSeconds: number
  pendingEvent: EventId | null
  pendingNightDay: number | null
  fuelPurchases: number
  route: RouteId
  objective: ObjectiveState
  objectiveIndex: number
  pendingSettlement: SettlementId | null
  nextSettlementIndex: number
  memories: FamilyMemory[]
}

export type PersistedGameState = Omit<GameState, "capacities">

export type OfflineSummary = {
  offlineSeconds: number
  fuelChange: number
  creditsGained: number
  distanceGained: number
}

export type PurchaseQuantity = 1 | 10 | 25 | "next" | "max"

export type ActionResult =
  | { ok: true; amount?: number }
  | { ok: false; reason: string }
