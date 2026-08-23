import { Flag, Map, Route } from "lucide-react"

import { OBJECTIVES, ROUTES, SETTLEMENTS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import type { RouteId } from "@/lib/game/types"

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
      <div className="mt-3 h-1.5 bg-black/10 dark:bg-white/10"><div className="h-full bg-[#ad7c2c]" style={{ width: `${Math.min((objective.progress / definition.target) * 100, 100)}%` }} /></div>
      <p className="mt-1 text-right font-mono text-xs tabular-nums">{Math.floor(objective.progress)} / {definition.target}</p>
      <div className="mt-4 flex items-center gap-2 text-xs"><Route className="size-3.5" /><span>Current route: <strong>{ROUTES[route].label}</strong></span></div>
      <p className="mt-1 text-xs text-black/55 dark:text-white/50">{ROUTES[route].description}</p>
      {settlement && <SettlementChoice settlement={settlement.label} chooseRoute={chooseRoute} />}
    </section>
  )
}

function SettlementChoice({ settlement, chooseRoute }: { settlement: string; chooseRoute: (route: RouteId) => void }) {
  return (
    <div className="mt-4 border border-[#ad7c2c]/50 bg-[#ad7c2c]/10 p-3">
      <div className="flex items-center gap-2 text-xs font-bold"><Map className="size-3.5" /> Arrived at {settlement}</div>
      <p className="mt-1 text-xs text-black/60 dark:text-white/55">Choose the next road. The settlement provides fuel and Trade Credits.</p>
      <div className="mt-3 grid gap-2">
        {(Object.keys(ROUTES) as RouteId[]).map((id) => <button key={id} type="button" onClick={() => chooseRoute(id)} className="border border-black/15 bg-black/[0.03] px-3 py-2 text-left text-xs hover:border-[#ad7c2c] dark:border-white/15 dark:bg-white/[0.03]"><strong>{ROUTES[id].label}</strong><span className="ml-2 text-black/55 dark:text-white/50">{ROUTES[id].description}</span></button>)}
      </div>
    </div>
  )
}
