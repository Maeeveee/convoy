import { Check, Gauge, LockKeyhole, Sparkles, Trophy } from "lucide-react"

import { LEGACY_PRODUCTION_BONUS } from "@/lib/game/constants"
import {
  allGeneratorsMilestoneCount,
  allGeneratorsMilestoneRows,
} from "@/lib/game/generators"
import { legacyReward } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 3 })

export function MilestonesMenu() {
  const state = useGameStore()
  const unlockedCount = allGeneratorsMilestoneCount(state)
  const milestones = allGeneratorsMilestoneRows(state)
  const minimumOwned = Math.min(
    ...Object.values(state.generators).map((generator) => generator.owned),
  )
  const projectedLegacy = legacyReward(state)
  const legacyBonus = state.meta.totalLegacyEarned * LEGACY_PRODUCTION_BONUS * 100

  return (
    <section className="p-4 lg:p-[16px]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 lg:gap-[8px]">
          <Trophy className="size-4 text-[#d3a849] lg:size-[16px]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Milestones</h2>
        </div>
        <span className="font-mono text-xs text-[#aeb8ad]">{unlockedCount} unlocked</span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-b border-white/10 pb-3 lg:mt-[16px] lg:pb-[12px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#d3a849]">All systems</p>
          <p className="mt-1 text-xs text-[#aeb8ad]">Raise every generator to the required amount.</p>
        </div>
        <strong className="shrink-0 font-mono text-sm">{minimumOwned} each</strong>
      </div>

      <div className="mt-3 grid gap-2 lg:mt-[12px] lg:gap-[8px]">
        {milestones.map((milestone) => (
          <div
            key={milestone.threshold}
            className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 border px-3 py-2.5 lg:gap-[12px] lg:px-[12px] lg:py-[10px] ${milestone.unlocked ? "border-[#7d913f]/60 bg-[#7d913f]/10" : "border-white/10 bg-white/[0.025]"}`}
          >
            <span className={`grid size-6 place-items-center border lg:size-[24px] ${milestone.unlocked ? "border-[#afc45d]/60 text-[#afc45d]" : "border-white/15 text-white/35"}`}>
              {milestone.unlocked ? <Check className="size-3.5" /> : <LockKeyhole className="size-3" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold">Own {milestone.threshold} of every generator</p>
              <p className="mt-0.5 text-[11px] text-[#aeb8ad]">
                {milestone.bonusType === "output" ? "Output milestone: +50% output" : "Speed milestone: production time halved"}
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-[#d3a849]">
              <p>{number.format(milestone.outputMultiplier)}x output</p>
              <p>{number.format(milestone.speedMultiplier)}x speed</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4 lg:mt-[20px] lg:pt-[16px]">
        <div className="flex items-center gap-2 lg:gap-[8px]">
          <Sparkles className="size-4 text-[#d3a849] lg:size-[16px]" />
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#d3a849]">Legacy bonus</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-[#aeb8ad]">
          Generate enough Trade Credits to earn Legacy, then begin a new journey. Every lifetime Legacy permanently adds +0.2% production.
        </p>
        <div className="mt-3 grid grid-cols-3 divide-x divide-white/10 border border-white/10 bg-white/[0.025] text-center lg:mt-[12px]">
          <MilestoneStat label="Projected" value={`${projectedLegacy} Legacy`} />
          <MilestoneStat label="Lifetime" value={number.format(state.meta.totalLegacyEarned)} />
          <MilestoneStat label="Bonus" value={`+${number.format(legacyBonus)}%`} />
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#aeb8ad]">
          <Gauge className="size-3" /> {number.format(state.totalCreditsGenerated)} Trade Credits generated this journey
        </p>
      </div>
    </section>
  )
}

function MilestoneStat({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 px-2 py-3 lg:px-[8px] lg:py-[12px]"><p className="text-[10px] uppercase tracking-[0.08em] text-[#aeb8ad]">{label}</p><strong className="mt-1 block truncate font-mono text-xs text-[#ebe5d7]">{value}</strong></div>
}
