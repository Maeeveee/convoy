import { ClipboardCheck } from "lucide-react"

import { reportCard } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

export function ReportCard() {
  const state = useGameStore()
  const report = reportCard(state)
  return (
    <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10">
      <div className="flex items-center gap-2"><ClipboardCheck className="size-4 text-[#8c6125] dark:text-[#d3a849]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em]">Journey report</h2></div>
      <div className="mt-3 flex items-end justify-between"><div><p className="text-xs text-black/50 dark:text-white/45">Current outcome</p><p className="mt-1 font-semibold">{report.label}</p></div><span className="font-mono text-2xl font-bold">{report.score}</span></div>
      <div className="mt-3 h-1.5 bg-black/10 dark:bg-white/10"><div className="h-full bg-[#ad7c2c]" style={{ width: `${Math.min(report.score, 100)}%` }} /></div>
      <div className="mt-4 border-t border-black/10 pt-3 dark:border-white/10"><p className="text-xs font-semibold">Family memories</p>{state.memories.length === 0 ? <p className="mt-2 text-xs text-black/50 dark:text-white/45">The journey has just begun.</p> : <div className="mt-2 space-y-2">{state.memories.slice(-3).reverse().map((memory) => <p key={memory.id} className="text-xs leading-5 text-black/60 dark:text-white/55">{memory.text}</p>)}</div>}</div>
    </section>
  )
}
