import { Fuel } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fuelPricePerUnit } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function FuelPanel() {
  const fuel = useGameStore((state) => state.resources.fuel)
  const credits = useGameStore((state) => state.resources.credits)
  const capacity = useGameStore((state) => state.capacities.fuel)
  const buyFuel = useGameStore((state) => state.buyFuel)
  const fuelPurchases = useGameStore((state) => state.fuelPurchases)
  const price = fuelPricePerUnit(fuelPurchases)
  const remaining = Math.max(Math.floor(capacity - fuel), 0)
  const options = [10, 25, remaining]
  const runwayMinutes = fuel / 0.03 / 60

  return (
    <section className="p-4 sm:p-5 lg:p-[20px]">
      <div className="mb-4 flex items-center gap-2 lg:mb-[16px] lg:gap-[8px]">
        <Fuel className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Fuel stop</h2>
          <p className="text-xs text-black/55 dark:text-white/50 lg:text-[12px]">
            {number.format(price)} credits per fuel · {number.format(runwayMinutes)} min runway
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:gap-[8px]">
        {options.map((requested, index) => {
          const amount = Math.min(requested, remaining)
          const cost = amount * price
          return (
            <Button
              key={index === 2 ? "fill" : requested}
              variant="outline"
              size="sm"
              className="h-auto min-h-11 flex-col gap-0 rounded-sm px-2 py-1.5 lg:min-h-[44px] lg:px-[8px] lg:py-[6px] lg:text-[14px]"
              disabled={amount < 1 || cost > credits}
              onClick={() => buyFuel(amount)}
            >
              <span>{index === 2 ? "Fill" : `+${amount}`}</span>
              <span className="text-xs font-normal opacity-60 lg:text-[10px]">{number.format(cost)} cr</span>
            </Button>
          )
        })}
      </div>
      {remaining > 0 && credits < price * Math.min(10, remaining) && (
        <p className="mt-2 text-xs text-[#8a432e] dark:text-[#e99c7d] lg:mt-[8px] lg:text-[12px] lg:leading-[16px]" role="status">
          Need {number.format(price * Math.min(10, remaining) - credits)} more credits for the smallest refill.
        </p>
      )}
    </section>
  )
}
