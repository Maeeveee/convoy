import { Map } from "lucide-react"

import { ROUTES } from "@/lib/game/constants"
import type { RouteId } from "@/lib/game/types"

export function SettlementRouteChoice({ settlement, chooseRoute }: { settlement: string; chooseRoute: (route: RouteId) => void }) {
  return <div className="mt-4 border border-[#ad7c2c]/50 bg-[#ad7c2c]/10 p-3 lg:mt-[16px] lg:p-[12px]"><div className="flex items-center gap-2 text-xs font-bold lg:gap-[8px] lg:text-[12px]"><Map className="size-3.5 lg:size-[14px]" /> Arrived at {settlement}</div><p className="mt-1 text-xs text-black/60 dark:text-white/55 lg:mt-[4px] lg:text-[12px] lg:leading-[16px]">Choose the next road. The settlement provides fuel and Trade Credits.</p><div className="mt-3 grid gap-2 lg:mt-[12px] lg:gap-[8px]">{(Object.keys(ROUTES) as RouteId[]).map((id) => <button key={id} type="button" onClick={() => chooseRoute(id)} className="border border-black/15 bg-black/[0.03] px-3 py-2 text-left text-xs hover:border-[#ad7c2c] dark:border-white/15 dark:bg-white/[0.03] lg:px-[12px] lg:py-[8px] lg:text-[12px] lg:leading-[16px]"><strong>{ROUTES[id].label}</strong><span className="ml-2 text-black/55 dark:text-white/50 lg:ml-[8px]">{ROUTES[id].description}</span></button>)}</div></div>
}
