import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EXTERIOR_UPGRADES } from "@/lib/game/constants"
import { nextExteriorUpgrade } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 0 })

export function UpgradePanel() {
  const state = useGameStore()
  const result = nextExteriorUpgrade(state)
  const affordable = Boolean(result && state.resources.credits >= result.cost)

  return (
    <section className="p-4 sm:p-5 lg:p-[20px]">
      <div className="mb-4 flex items-center gap-2 lg:mb-[16px] lg:gap-[8px]">
        <ShieldCheck className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Vehicle shell</h2>
          <p className="text-xs text-black/55 dark:text-white/50 lg:text-[12px]">Instant exterior upgrades</p>
        </div>
      </div>
      <div className="space-y-3 lg:space-y-[12px]">
        <div className="flex items-center gap-1 lg:gap-[4px]">
          {[1, 2, 3].map((level) => (
            <div key={level} className={`h-1.5 flex-1 lg:h-[6px] ${level <= state.exterior.level ? "bg-[#ad7c2c]" : "bg-black/10 dark:bg-white/10"}`} />
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50 dark:text-white/45 lg:text-[12px]">Current</p>
          <p className="mt-1 font-semibold lg:mt-[4px] lg:text-[16px]">{EXTERIOR_UPGRADES[state.exterior.id].label}</p>
        </div>
        {result ? (
          <div className="border border-black/15 bg-white/25 p-3 dark:border-white/10 dark:bg-white/[0.035] lg:p-[12px]">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50 dark:text-white/45 lg:text-[12px]">Next tier</p>
            <p className="mt-1 font-semibold lg:mt-[4px] lg:text-[16px]">{result.label}</p>
            <p className="mt-1 text-xs leading-5 text-black/55 dark:text-white/45 lg:mt-[4px] lg:text-[12px] lg:leading-[20px]">{result.description}</p>
            <Button
              className="mt-3 w-full rounded-sm lg:mt-[12px] lg:h-[32px] lg:px-[12px] lg:text-[14px]"
              size="sm"
              disabled={!affordable}
              onClick={() => state.buyExterior(result.id as "emergencyTarp" | "enclosedVan")}
            >
              Upgrade · {number.format(result.cost)} credits
            </Button>
            {!affordable && (
              <p className="mt-2 text-xs text-black/50 dark:text-white/45 lg:mt-[8px] lg:text-[12px]" role="status">
                Need {number.format(result.cost - state.resources.credits)} more credits.
              </p>
            )}
          </div>
        ) : (
          <p className="border border-[#7d913f]/40 bg-[#7d913f]/10 p-3 text-xs font-semibold text-[#516126] dark:text-[#bdcf72] lg:p-[12px] lg:text-[12px]">Exterior fully upgraded.</p>
        )}
      </div>
    </section>
  )
}
