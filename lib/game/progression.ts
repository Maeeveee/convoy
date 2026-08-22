import { EXTERIOR_BY_LEVEL, EXTERIOR_UPGRADES } from "./constants"
import type { ActionResult, ExteriorUpgradeId, GameState } from "./types"

export function buyExteriorUpgrade(
  state: GameState,
  target: ExteriorUpgradeId,
): { state: GameState; result: ActionResult } {
  const upgrade = EXTERIOR_UPGRADES[target]
  if (upgrade.level !== state.exterior.level + 1) {
    return { state, result: { ok: false, reason: "That upgrade is not next." } }
  }
  if (state.resources.spareParts < upgrade.cost) {
    return { state, result: { ok: false, reason: "Not enough spare parts." } }
  }

  return {
    state: {
      ...state,
      resources: {
        ...state.resources,
        spareParts: state.resources.spareParts - upgrade.cost,
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
