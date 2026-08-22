export type ResourceKey = "fuel" | "provisions" | "spareParts"

export type CharacterId = "father" | "mother" | "child"

export type TaskId = "drive" | "repair" | "provision" | "connect" | "rest"

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

export type Resources = Record<ResourceKey, number>

export type CharacterState = {
  id: CharacterId
  task: TaskId
  energy: number
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

export type GameState = {
  saveVersion: number
  resources: Resources
  capacities: Resources
  characters: Record<CharacterId, CharacterState>
  generators: Record<GeneratorId, GeneratorState>
  exterior: ExteriorState
  bond: number
  distance: number
  elapsedSeconds: number
  day: number
  lastSeenTimestamp: number
}

export type PersistedGameState = Omit<GameState, "capacities">

export type OfflineSummary = {
  offlineSeconds: number
  fuelGained: number
  provisionsGained: number
  sparePartsGained: number
  distanceGained: number
}

export type PurchaseQuantity = 1 | 10 | 25 | "next" | "max"

export type ActionResult =
  | { ok: true; amount?: number }
  | { ok: false; reason: string }
