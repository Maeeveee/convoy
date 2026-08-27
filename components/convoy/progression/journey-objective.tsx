import { Flag, Route } from "lucide-react"

import { OBJECTIVES, ROUTES, SETTLEMENTS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import { ObjectiveProgress } from "./objective-progress"
import { SettlementRouteChoice } from "./settlement-route-choice"

export function JourneyObjective({ embedded = false }: { embedded?: boolean }) {
  const objective = useGameStore((state) => state.objective)
  const route = useGameStore((state) => state.route)
  const pendingSettlement = useGameStore((state) => state.pendingSettlement)
  const chooseRoute = useGameStore((state) => state.chooseRoute)
  const definition = OBJECTIVES[objective.id]
  const settlement = pendingSettlement ? SETTLEMENTS[pendingSettlement] : null

  return (
    <section className={`${embedded ? "p-4 lg:p-[16px]" : "border-t border-black/15 p-4 sm:p-5 dark:border-white/10 lg:p-[20px]"}`}>
      <div className="flex items-center gap-2 lg:gap-[8px]"><Flag className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Next objective</h2></div>
      <p className="mt-2 text-sm font-semibold lg:mt-[8px] lg:text-[14px]">{definition.label}</p>
      <p className="mt-1 text-xs text-black/55 dark:text-white/50 lg:mt-[4px] lg:text-[12px] lg:leading-[16px]">{definition.description}</p>
      <ObjectiveProgress progress={objective.progress} target={definition.target} />
      <div className="mt-4 flex items-center gap-2 text-xs lg:mt-[16px] lg:gap-[8px] lg:text-[12px]"><Route className="size-3.5 lg:size-[14px]" /><span>Current route: <strong>{ROUTES[route].label}</strong></span></div>
      <p className="mt-1 text-xs text-black/55 dark:text-white/50 lg:mt-[4px] lg:text-[12px] lg:leading-[16px]">{ROUTES[route].description}</p>
      {settlement && <SettlementRouteChoice settlement={settlement.label} chooseRoute={chooseRoute} />}
    </section>
  )
}
