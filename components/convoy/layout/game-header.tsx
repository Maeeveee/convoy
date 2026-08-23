"use client"

import { AlarmClock, CarFront, ChevronDown, Flag, SlidersHorizontal } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { AudioController } from "../feedback"
import { FuelPanel, InteriorPanel, TaskPanel, UpgradePanel } from "../panels"
import { JourneyObjective } from "../progression"

export function GameHeader({ day, secondsToNight }: { day: number; secondsToNight: number }) {
  const [objectiveOpen, setObjectiveOpen] = useState(false)
  const [systemsOpen, setSystemsOpen] = useState(false)

  return (
    <header className="border-b border-black/15 bg-[#202821] text-[#f0ebde] dark:border-white/10 dark:bg-[#111512]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3"><div className="grid size-9 place-items-center border border-[#d3a849]/50 bg-[#d3a849]/10"><CarFront className="size-5 text-[#e2bd66]" /></div><div><h1 className="text-base font-semibold uppercase tracking-[0.18em]">Convoy</h1><p className="flex items-center gap-1.5 text-[11px] text-[#aeb8ad]"><AlarmClock className="size-3.5 text-[#d3a849]" />Day {day} · Night in {formatClock(secondsToNight)}</p></div></div>
        <div className="flex items-center gap-2"><AudioController /><div className="relative"><Button variant="ghost" size="sm" className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white" onClick={() => { setObjectiveOpen((open) => !open); setSystemsOpen(false) }} aria-expanded={objectiveOpen} aria-controls="journey-objective-menu"><Flag className="size-4" /><span className="hidden sm:inline">Objective</span><ChevronDown className={`size-3 transition-transform ${objectiveOpen ? "rotate-180" : ""}`} /></Button>{objectiveOpen && <div id="journey-objective-menu" className="absolute top-[calc(100%+0.75rem)] right-0 z-50 w-[min(24rem,calc(100vw-2rem))] border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl"><JourneyObjective embedded /></div>}</div><div className="relative"><Button variant="ghost" size="sm" className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white" onClick={() => { setSystemsOpen((open) => !open); setObjectiveOpen(false) }} aria-expanded={systemsOpen} aria-controls="convoy-systems-menu"><SlidersHorizontal className="size-4" /><span className="hidden sm:inline">Systems</span><ChevronDown className={`size-3 transition-transform ${systemsOpen ? "rotate-180" : ""}`} /></Button>{systemsOpen && <div id="convoy-systems-menu" className="absolute top-[calc(100%+0.75rem)] right-0 z-50 max-h-[calc(100svh-5rem)] w-[min(25rem,calc(100vw-2rem))] overflow-y-auto divide-y divide-white/10 border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl"><FuelPanel /><TaskPanel /><UpgradePanel /><InteriorPanel /></div>}</div></div>
      </div>
    </header>
  )
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  return `${Math.max(minutes, 1)}m`
}
