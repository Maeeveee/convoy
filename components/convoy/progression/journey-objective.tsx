import { Flag, Route } from "lucide-react"

import { OBJECTIVES, ROUTES, SETTLEMENTS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import { ObjectiveProgress } from "./objective-progress"
import { SettlementRouteChoice } from "./settlement-route-choice"

export function JourneyObjective() {
  const objective = useGameStore((state) => state.objective)
  const route = useGameStore((state) => state.route)
  const pendingSettlement = useGameStore((state) => state.pendingSettlement)
  const chooseRoute = useGameStore((state) => state.chooseRoute)
  const definition = OBJECTIVES[objective.id]
  const settlement = pendingSettlement ? SETTLEMENTS[pendingSettlement] : null

  return (
    <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10">
      <div className="flex items-center gap-2"><Flag className="size-4 text-[#8c6125] dark:text-[#d3a849]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em]">Next objective</h2></div>
      <p className="mt-2 text-sm font-semibold">{definition.label}</p>
      <p className="mt-1 text-xs text-black/55 dark:text-white/50">{definition.description}</p>
      <ObjectiveProgress progress={objective.progress} target={definition.target} />
      <div className="mt-4 flex items-center gap-2 text-xs"><Route className="size-3.5" /><span>Current route: <strong>{ROUTES[route].label}</strong></span></div>
      <p className="mt-1 text-xs text-black/55 dark:text-white/50">{ROUTES[route].description}</p>
      {settlement && <SettlementRouteChoice settlement={settlement.label} chooseRoute={chooseRoute} />}
    </section>
  )
}
