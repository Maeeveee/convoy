import { RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { legacyReward } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

export function LegacyPanel() {
  const state = useGameStore()
  const reward = legacyReward(state)
  return (
    <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10">
      <div className="flex items-center gap-2"><Sparkles className="size-4 text-[#8c6125] dark:text-[#d3a849]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em]">Legacy</h2></div>
      <div className="mt-3 flex justify-between text-xs"><span>Banked Legacy</span><strong>{state.meta.legacy}</strong></div>
      <p className="mt-2 text-xs leading-5 text-black/55 dark:text-white/45">Reset this journey to earn {reward} Legacy. Generators, fuel, upgrades, and distance will restart.</p>
      <Button variant="outline" size="sm" className="mt-3 w-full rounded-sm" disabled={reward < 1} onClick={() => state.prestige()}><RotateCcw className="size-3.5" /> Begin a new journey</Button>
    </section>
  )
}
