import { useState } from "react"
import { Cog, TimerReset } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GENERATORS } from "@/lib/game/constants"
import {
  bulkGeneratorPrice,
  generatorCycleSeconds,
  nextGeneratorMilestone,
  resolvePurchaseQuantity,
} from "@/lib/game/generators"
import { useGameStore } from "@/lib/game/store"
import { creditOutputPerCycle } from "@/lib/game/simulation"
import type { GeneratorId, PurchaseQuantity } from "@/lib/game/types"

const generatorIds = Object.keys(GENERATORS) as GeneratorId[]
const quantities: { value: PurchaseQuantity; label: string }[] = [
  { value: 1, label: "x1" },
  { value: 10, label: "x10" },
  { value: 25, label: "x25" },
  { value: "next", label: "Next" },
  { value: "max", label: "Max" },
]
const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function GeneratorPanel() {
  const state = useGameStore()
  const [quantity, setQuantity] = useState<PurchaseQuantity>(1)
  const [message, setMessage] = useState<string | null>(null)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cog className="size-4 text-[#8c6125] dark:text-[#d3a849]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em]">Field systems</h2>
            <p className="text-xs text-black/55 dark:text-white/50">Automatic production cycles</p>
          </div>
        </div>
        <div className="flex border border-black/20 dark:border-white/15" aria-label="Purchase quantity">
          {quantities.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setQuantity(item.value)}
              className={`h-8 border-r border-black/15 px-2.5 text-xs font-semibold last:border-r-0 dark:border-white/10 ${quantity === item.value ? "bg-[#2e382f] text-white dark:bg-[#d3a849] dark:text-[#1d211d]" : "bg-white/35 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {message && <p className="mb-3 border-l-2 border-[#b2683c] pl-2 text-xs text-[#7a3a24] dark:text-[#e8a47f]">{message}</p>}

      <div className="grid gap-2 xl:grid-cols-2">
        {generatorIds.map((id) => {
          const definition = GENERATORS[id]
          const generator = state.generators[id]
          const cycle = generatorCycleSeconds(id, generator.owned)
          const progress = generator.owned > 0 ? Math.min(generator.cycleProgressSeconds / cycle, 1) : 0
          const purchaseCount = resolvePurchaseQuantity(state, id, quantity)
          const cost = bulkGeneratorPrice(id, generator.owned, purchaseCount)
          const affordable = purchaseCount > 0 && cost <= state.resources.credits

          return (
            <article key={id} className="grid min-h-[150px] grid-rows-[auto_1fr_auto] border border-black/15 bg-white/30 p-3 dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold">{definition.label}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-black/55 dark:text-white/45">{definition.description}</p>
                </div>
                <span className="font-mono text-lg font-bold tabular-nums">{generator.owned}</span>
              </div>
              <div className="mt-3">
                <div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-[0.08em] text-black/50 dark:text-white/45">
                  <span>+{number.format(creditOutputPerCycle(state, generator.owned, definition.outputPerCycle))} credits / cycle</span>
                  <span>{formatDuration(cycle)}</span>
                </div>
                <div className="h-1.5 overflow-hidden bg-black/10 dark:bg-white/10">
                  <div className="h-full bg-[#7d913f] transition-[width] duration-300 dark:bg-[#afc45d]" style={{ width: `${progress * 100}%` }} />
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-black/45 dark:text-white/40">
                  <TimerReset className="size-3" /> Next milestone at {nextGeneratorMilestone(generator.owned)}
                </div>
              </div>
              <Button
                size="sm"
                variant={affordable ? "default" : "outline"}
                disabled={!affordable}
                className="mt-3 w-full rounded-sm"
                onClick={() => {
                  const result = state.buyGenerator(id, quantity)
                  setMessage(result.ok ? null : result.reason)
                }}
              >
                Buy {purchaseCount || "-"} · {number.format(cost)} credits
              </Button>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function formatDuration(seconds: number) {
  if (seconds >= 3_600) return `${number.format(seconds / 3_600)} hr`
  if (seconds >= 60) return `${number.format(seconds / 60)} min`
  return `${number.format(seconds)} sec`
}
