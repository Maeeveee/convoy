import { TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { GeneratorId, GameState, PurchaseQuantity } from "@/lib/game/types"
import { GENERATORS } from "@/lib/game/constants"
import { bulkGeneratorPrice, generatorCycleSeconds, nextGeneratorMilestone, resolvePurchaseQuantity } from "@/lib/game/generators"
import { creditOutputPerCycle } from "@/lib/game/simulation"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function GeneratorCard({ id, state, quantity, visualNow, onBuy }: { id: GeneratorId; state: GameState; quantity: PurchaseQuantity; visualNow: number; onBuy: (id: GeneratorId, quantity: PurchaseQuantity) => void }) {
  const definition = GENERATORS[id]
  const generator = state.generators[id]
  const cycle = generatorCycleSeconds(id, generator.owned)
  const visualElapsed = Math.min(Math.max((visualNow - state.lastSeenTimestamp) / 1_000, 0), 1.1)
  const visualProgress = generator.owned > 0 ? ((generator.cycleProgressSeconds + visualElapsed) % cycle) / cycle : 0
  const secondsRemaining = generator.owned > 0 ? Math.max(cycle - (generator.cycleProgressSeconds + visualElapsed) % cycle, 0) : cycle
  const purchaseCount = resolvePurchaseQuantity(state, id, quantity)
  const cost = bulkGeneratorPrice(id, generator.owned, purchaseCount)
  const affordable = purchaseCount > 0 && cost <= state.resources.credits
  const milestone = nextGeneratorMilestone(generator.owned)
  return <article className="grid min-h-36 grid-rows-[auto_1fr_auto] border border-black/15 bg-white/30 p-3 dark:border-white/10 dark:bg-white/[0.035] lg:min-h-[150px] lg:p-[12px]"><div className="flex items-start justify-between gap-3 lg:gap-[12px]"><div className="min-w-0"><h3 className="truncate text-sm font-bold lg:text-[14px]">{definition.label}</h3><p className="mt-0.5 line-clamp-2 text-xs leading-5 text-black/55 dark:text-white/45 lg:mt-[4px] lg:text-[12px] lg:leading-[20px]">{definition.description}</p></div><span className="font-mono text-lg font-bold tabular-nums lg:text-[18px]">{generator.owned}</span></div><div className="mt-3 lg:mt-[12px]"><div className="mb-1.5 flex justify-between text-xs font-semibold uppercase tracking-[0.08em] text-black/50 dark:text-white/45 lg:mb-[6px] lg:text-[10px]"><span>+{number.format(creditOutputPerCycle(state, generator.owned, definition.outputPerCycle))} credits / cycle</span><span>{generator.owned > 0 ? `${formatDuration(secondsRemaining)} left` : formatDuration(cycle)}</span></div><div className="h-1.5 overflow-hidden bg-black/10 dark:bg-white/10 lg:h-[6px]"><div className="h-full bg-[#7d913f] dark:bg-[#afc45d]" style={{ width: `${visualProgress * 100}%` }} /></div><div className="mt-2 flex items-center gap-1 text-xs text-black/45 dark:text-white/40 lg:mt-[8px] lg:gap-[4px] lg:text-[10px]"><TimerReset className="size-3 lg:size-[12px]" /> Milestone {generator.owned}/{milestone}</div><div className="mt-1 h-1 overflow-hidden bg-black/10 dark:bg-white/10 lg:mt-[4px] lg:h-[4px]"><div className="h-full bg-[#ad7c2c] transition-[width] duration-500" style={{ width: `${Math.min(generator.owned / milestone, 1) * 100}%` }} /></div></div><Button size="sm" variant={affordable ? "default" : "outline"} disabled={!affordable} className="mt-3 w-full rounded-sm lg:mt-[12px] lg:h-[32px] lg:gap-[6px] lg:px-[12px] lg:text-[14px]" onClick={() => onBuy(id, quantity)}>Buy {purchaseCount || "-"} · {number.format(cost)} credits</Button>{!affordable && purchaseCount > 0 && <p className="mt-1 text-center text-xs text-black/45 dark:text-white/40 lg:mt-[4px] lg:text-[10px]">{number.format(cost - state.resources.credits)} credits short</p>}</article>
}

function formatDuration(seconds: number) {
  if (seconds >= 3_600) return `${number.format(seconds / 3_600)} hr`
  if (seconds >= 60) return `${number.format(seconds / 60)} min`
  return `${number.format(seconds)} sec`
}
