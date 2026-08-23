import { RotateCcw, Sparkles } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ResetJourneyDialog } from "@/components/convoy/dialogs/reset-journey-dialog"
import { legacyReward } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

export function LegacyPanel() {
  const state = useGameStore()
  const reward = legacyReward(state)
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10 lg:p-[20px]">
      <div className="flex items-center gap-2 lg:gap-[8px]"><Sparkles className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Legacy</h2></div>
      <div className="mt-3 flex items-end justify-between text-xs lg:mt-[12px] lg:text-[12px]"><span>Banked Legacy</span><strong className="lg:text-[16px] lg:leading-[20px]">{state.meta.legacy}</strong></div>
      <p className="mt-2 text-xs leading-5 text-black/55 dark:text-white/45 lg:mt-[8px] lg:text-[12px] lg:leading-[20px]">Reset this journey to earn {reward} Legacy. Generators, fuel, upgrades, and distance will restart.</p>
      <Button variant="outline" size="sm" className="mt-3 w-full rounded-sm lg:mt-[12px] lg:h-[32px] lg:px-[12px] lg:text-[14px]" disabled={reward < 1} onClick={() => setConfirmReset(true)}><RotateCcw className="size-3.5 lg:size-[14px]" /> Begin a new journey</Button>
      </section>
      {confirmReset && <ResetJourneyDialog onCancel={() => setConfirmReset(false)} onConfirm={() => { setConfirmReset(false); state.prestige() }} />}
    </>
  )
}
