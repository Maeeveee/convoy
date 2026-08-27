import { ClipboardCheck } from "lucide-react"

import { reportCard } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"
import { FamilyMemoryList } from "./family-memory-list"

export function ReportCard() {
  const state = useGameStore()
  const report = reportCard(state)
  return (
    <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10 lg:p-[20px]">
      <div className="flex items-center gap-2 lg:gap-[8px]"><ClipboardCheck className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Journey report</h2></div>
      <div className="mt-3 flex items-end justify-between lg:mt-[12px]"><div><p className="text-xs text-black/50 dark:text-white/45 lg:text-[12px]">Current outcome</p><p className="mt-1 font-semibold lg:mt-[4px] lg:text-[16px]">{report.label}</p></div><span className="font-mono text-2xl font-bold lg:text-[24px] lg:leading-[32px]">{report.score}</span></div>
      <div className="mt-3 h-1.5 bg-black/10 dark:bg-white/10 lg:mt-[12px] lg:h-[6px]"><div className="h-full bg-[#ad7c2c]" style={{ width: `${Math.min(report.score, 100)}%` }} /></div>
      <FamilyMemoryList memories={state.memories} />
    </section>
  )
}
