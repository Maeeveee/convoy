import { Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { INTERIOR_UPGRADES } from "@/lib/game/constants"
import { nextInteriorUpgrade } from "@/lib/game/progression"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 0 })

export function InteriorPanel() {
  const state = useGameStore()
  const next = nextInteriorUpgrade(state)
  return (
    <section className="border-t border-black/15 p-4 sm:p-5 dark:border-white/10">
      <div className="mb-3 flex items-center gap-2"><Home className="size-4 text-[#8c6125] dark:text-[#d3a849]" /><h2 className="text-sm font-bold uppercase tracking-[0.12em]">Interior</h2></div>
      <p className="text-xs text-black/55 dark:text-white/50">{INTERIOR_UPGRADES[state.interior.id].label}</p>
      {next ? <Button size="sm" className="mt-3 w-full rounded-sm" disabled={state.resources.credits < next.cost} onClick={() => state.buyInterior(next.id as "semiLivable" | "comfortableCabin")}>Improve cabin · {number.format(next.cost)} credits</Button> : <p className="mt-3 text-xs text-[#64762e]">Cabin fully upgraded.</p>}
    </section>
  )
}
