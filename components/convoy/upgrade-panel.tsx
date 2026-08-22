import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EXTERIOR_UPGRADES } from "@/lib/game/constants"
import { nextExteriorUpgrade } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 0 })

export function UpgradePanel() {
  const state = useGameStore()
  const result = nextExteriorUpgrade(state)
  const affordable = Boolean(result && state.resources.spareParts >= result.cost)

  return (
    <section className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="size-4 text-[#8c6125] dark:text-[#d3a849]" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em]">Vehicle shell</h2>
          <p className="text-xs text-black/55 dark:text-white/50">Instant exterior upgrades</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((level) => (
            <div key={level} className={`h-1.5 flex-1 ${level <= state.exterior.level ? "bg-[#ad7c2c]" : "bg-black/10 dark:bg-white/10"}`} />
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50 dark:text-white/45">Current</p>
          <p className="mt-1 font-semibold">{EXTERIOR_UPGRADES[state.exterior.id].label}</p>
        </div>
        {result ? (
          <div className="border border-black/15 bg-white/25 p-3 dark:border-white/10 dark:bg-white/[0.035]">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50 dark:text-white/45">Next tier</p>
            <p className="mt-1 font-semibold">{result.label}</p>
            <p className="mt-1 text-xs leading-5 text-black/55 dark:text-white/45">{result.description}</p>
            <Button
              className="mt-3 w-full rounded-sm"
              size="sm"
              disabled={!affordable}
              onClick={() => state.buyExterior(result.id as "emergencyTarp" | "enclosedVan")}
            >
              Upgrade · {number.format(result.cost)} parts
            </Button>
          </div>
        ) : (
          <p className="border border-[#7d913f]/40 bg-[#7d913f]/10 p-3 text-xs font-semibold text-[#516126] dark:text-[#bdcf72]">Exterior fully upgraded.</p>
        )}
      </div>
    </section>
  )
}
