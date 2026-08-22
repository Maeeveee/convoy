import { EXTERIOR_BY_LEVEL, EXTERIOR_UPGRADES, INTERIOR_BY_LEVEL, INTERIOR_UPGRADES, LEGACY_THRESHOLD } from "./constants"
import type { ActionResult, ExteriorUpgradeId, GameState } from "./types"

export function buyExteriorUpgrade(
  state: GameState,
  target: ExteriorUpgradeId,
): { state: GameState; result: ActionResult } {
  const upgrade = EXTERIOR_UPGRADES[target]
  if (upgrade.level !== state.exterior.level + 1) {
    return { state, result: { ok: false, reason: "That upgrade is not next." } }
  }
  if (state.resources.credits < upgrade.cost) {
    return { state, result: { ok: false, reason: "Not enough Trade Credits." } }
  }

  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        credits: state.resources.credits - upgrade.cost,
      },
      exterior: { level: upgrade.level, id: target },
      lastSeenTimestamp: Date.now(),
    },
    result: { ok: true },
  }
}

export function reportCard(state: GameState) {
  const upgradeScore = (state.exterior.level - 1) * 30
  const distanceScore = Math.min(state.distance / 20, 30)
  const bondScore = state.bond * 0.4
  const score = Math.round(upgradeScore + distanceScore + bondScore)
  const label = score >= 80 ? "Full Survivor" : score >= 45 ? "Barely Making It" : "Broken but Alive"
  return { score, label }
}

export function nextExteriorUpgrade(state: GameState) {
  const id = EXTERIOR_BY_LEVEL[state.exterior.level]
  return id ? { id, ...EXTERIOR_UPGRADES[id] } : null
}

export function buyInteriorUpgrade(
  state: GameState,
  target: "semiLivable" | "comfortableCabin",
): { state: GameState; result: ActionResult } {
  const upgrade = INTERIOR_UPGRADES[target]
  const cost = upgrade.cost * (1 - state.meta.upgrades.discountLevel * 0.05)
  if (upgrade.level !== state.interior.level + 1) return { state, result: { ok: false, reason: "That interior upgrade is not next." } }
  if (state.resources.credits < cost) return { state, result: { ok: false, reason: "Not enough Trade Credits." } }
  return {
    state: {
      ...state,
      resources: { ...state.resources, credits: state.resources.credits - cost },
      interior: { level: upgrade.level, id: target },
      lastSeenTimestamp: Date.now(),
    },
    result: { ok: true },
  }
}

export function nextInteriorUpgrade(state: GameState) {
  const id = INTERIOR_BY_LEVEL[state.interior.level]
  return id ? { id, ...INTERIOR_UPGRADES[id] } : null
}

export function legacyReward(state: GameState) {
  const averageBond = state.bondSampleSeconds > 0 ? state.bondSum / state.bondSampleSeconds : state.bond
  return Math.floor(Math.sqrt(state.totalCreditsGenerated / LEGACY_THRESHOLD) * (0.5 + averageBond / 100))
}
