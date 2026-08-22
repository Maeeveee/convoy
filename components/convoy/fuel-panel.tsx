import { Fuel } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FUEL_PRICE_PER_UNIT } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function FuelPanel() {
  const fuel = useGameStore((state) => state.resources.fuel)
  const credits = useGameStore((state) => state.resources.credits)
  const capacity = useGameStore((state) => state.capacities.fuel)
  const buyFuel = useGameStore((state) => state.buyFuel)
  const remaining = Math.max(Math.floor(capacity - fuel), 0)
  const options = [10, 25, remaining]

  return (
    <section className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Fuel className="size-4 text-[#8c6125] dark:text-[#d3a849]" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em]">Fuel stop</h2>
          <p className="text-xs text-black/55 dark:text-white/50">
            {number.format(FUEL_PRICE_PER_UNIT)} credits per fuel
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((requested, index) => {
          const amount = Math.min(requested, remaining)
          const cost = amount * FUEL_PRICE_PER_UNIT
          return (
            <Button
              key={index === 2 ? "fill" : requested}
              variant="outline"
              size="sm"
              className="h-auto min-h-11 flex-col gap-0 rounded-sm px-2 py-1.5"
              disabled={amount < 1 || cost > credits}
              onClick={() => buyFuel(amount)}
            >
              <span>{index === 2 ? "Fill" : `+${amount}`}</span>
              <span className="text-[10px] font-normal opacity-60">{number.format(cost)} cr</span>
            </Button>
          )
        })}
      </div>
    </section>
  )
}
