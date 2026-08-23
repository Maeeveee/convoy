"use client"

import Image from "next/image"
import { AlarmClock, ChevronDown, Flag, SlidersHorizontal, Trophy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { AudioController, ThemeToggle } from "../feedback"
import { FuelPanel, InteriorPanel, TaskPanel, UpgradePanel } from "../panels"
import { JourneyObjective, MilestonesMenu } from "../progression"

type HeaderMenu = "objective" | "systems" | "milestones" | null

export function GameHeader({ day, secondsToNight }: { day: number; secondsToNight: number }) {
  const [openMenu, setOpenMenu] = useState<HeaderMenu>(null)

  return (
    <header className="border-b border-black/15 bg-[#202821] text-[#f0ebde] dark:border-white/10 dark:bg-[#111512]">
      <div className="mx-auto flex max-w-[120rem] items-center justify-between px-4 py-3 sm:px-6 lg:px-[24px] lg:py-[12px]">
        <div className="flex items-center gap-2 lg:gap-[8px]">
          <div className="grid size-9 place-items-center border border-[#d3a849]/50 bg-[#d3a849]/10 lg:size-[36px]"><Image src="/image/logo.png" alt="Convoy logo" width={30} height={30} className="size-7 object-contain lg:size-[30px]" /></div>
          <div className="min-w-0"><h1 className="truncate text-base font-semibold uppercase tracking-[0.18em] lg:text-[16px]">Convoy</h1><p className="flex items-center gap-1.5 text-xs text-[#aeb8ad] lg:gap-[6px] lg:text-[11px]"><AlarmClock className="size-3.5 shrink-0 text-[#d3a849] lg:size-[14px]" /><span>Day {day}</span><span className="hidden sm:inline">· Night in {formatClock(secondsToNight)}</span></p></div>
        </div>
        <div className="grid grid-cols-5 items-center gap-1 sm:flex sm:gap-3 lg:gap-[12px]">
          <div className="contents sm:flex sm:items-center sm:gap-1 lg:gap-[4px]"><AudioController /><ThemeToggle /></div>
          <div className="relative">
            <Button variant="ghost" size="sm" className="size-8 rounded-sm px-0 text-[#aeb8ad] hover:bg-white/10 hover:text-white sm:h-8 sm:w-auto sm:px-3 lg:gap-[4px] lg:px-[12px] lg:text-[14px]" onClick={() => setOpenMenu((menu) => menu === "objective" ? null : "objective")} aria-expanded={openMenu === "objective"} aria-controls="journey-objective-menu"><Flag className="size-4 lg:size-[16px]" /><span className="hidden sm:inline">Objective</span><ChevronDown className={`hidden size-3 transition-transform sm:block lg:size-[12px] ${openMenu === "objective" ? "rotate-180" : ""}`} /></Button>
            {openMenu === "objective" && <div id="journey-objective-menu" className="fixed top-[5.75rem] right-4 left-4 z-50 max-h-[calc(100svh-6.25rem)] overflow-y-auto border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl sm:absolute sm:top-[calc(100%+0.75rem)] sm:right-0 sm:left-auto sm:max-h-none sm:w-[calc(100vw-2rem)] sm:overflow-visible lg:top-[44px] lg:w-[384px]"><JourneyObjective embedded /></div>}
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" className="size-8 rounded-sm px-0 text-[#aeb8ad] hover:bg-white/10 hover:text-white sm:h-8 sm:w-auto sm:px-3 lg:gap-[4px] lg:px-[12px] lg:text-[14px]" onClick={() => setOpenMenu((menu) => menu === "systems" ? null : "systems")} aria-expanded={openMenu === "systems"} aria-controls="convoy-systems-menu"><SlidersHorizontal className="size-4 lg:size-[16px]" /><span className="hidden sm:inline">Systems</span><ChevronDown className={`hidden size-3 transition-transform sm:block lg:size-[12px] ${openMenu === "systems" ? "rotate-180" : ""}`} /></Button>
            {openMenu === "systems" && <div id="convoy-systems-menu" className="fixed top-[5.75rem] right-4 left-4 z-50 max-h-[calc(100svh-6.25rem)] overflow-y-auto divide-y divide-white/10 border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl sm:absolute sm:top-[calc(100%+0.75rem)] sm:right-0 sm:left-auto sm:w-[calc(100vw-2rem)] lg:top-[44px] lg:w-[400px]"><FuelPanel /><TaskPanel /><UpgradePanel /><InteriorPanel /></div>}
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" className="size-8 rounded-sm px-0 text-[#aeb8ad] hover:bg-white/10 hover:text-white sm:h-8 sm:w-auto sm:px-3 lg:gap-[4px] lg:px-[12px] lg:text-[14px]" onClick={() => setOpenMenu((menu) => menu === "milestones" ? null : "milestones")} aria-expanded={openMenu === "milestones"} aria-controls="convoy-milestones-menu"><Trophy className="size-4 lg:size-[16px]" /><span className="hidden sm:inline">Milestones</span><ChevronDown className={`hidden size-3 transition-transform sm:block lg:size-[12px] ${openMenu === "milestones" ? "rotate-180" : ""}`} /></Button>
            {openMenu === "milestones" && <div id="convoy-milestones-menu" className="fixed top-[5.75rem] right-4 left-4 z-50 max-h-[calc(100svh-6.25rem)] overflow-y-auto border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl sm:absolute sm:top-[calc(100%+0.75rem)] sm:right-0 sm:left-auto sm:w-[calc(100vw-2rem)] lg:top-[44px] lg:w-[520px]"><MilestonesMenu /></div>}
          </div>
        </div>
      </div>
    </header>
  )
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  return `${Math.max(minutes, 1)}m`
}
