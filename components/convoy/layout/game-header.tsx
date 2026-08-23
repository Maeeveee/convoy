import { CarFront, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EXTERIOR_UPGRADES } from "@/lib/game/constants"
import { AudioController } from "../feedback"

export function GameHeader({ day, secondsToNight, exteriorId, onReset }: { day: number; secondsToNight: number; exteriorId: keyof typeof EXTERIOR_UPGRADES; onReset: () => void }) {
  return (
    <header className="border-b border-black/15 bg-[#202821] text-[#f0ebde] dark:border-white/10 dark:bg-[#111512]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3"><div className="grid size-9 place-items-center border border-[#d3a849]/50 bg-[#d3a849]/10"><CarFront className="size-5 text-[#e2bd66]" /></div><div><h1 className="text-base font-semibold uppercase tracking-[0.18em]">Convoy</h1><p className="text-[11px] text-[#aeb8ad]">Journey log · Day {day} · {formatClock(secondsToNight)} to night</p></div></div>
        <div className="flex items-center gap-2"><AudioController /><span className="hidden text-xs text-[#aeb8ad] sm:inline">{EXTERIOR_UPGRADES[exteriorId].label}</span><Button variant="ghost" size="icon-sm" className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white" onClick={onReset} aria-label="Reset journey" title="Reset journey"><RotateCcw /></Button></div>
      </div>
    </header>
  )
}

function formatClock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`
}
