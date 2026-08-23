import { useEffect, useState } from "react"
import { Cog } from "lucide-react"

import { GENERATORS } from "@/lib/game/constants"
import {
  allGeneratorsMilestonesReached,
  generatorMilestonesReached,
} from "@/lib/game/generators"
import { useGameStore } from "@/lib/game/store"
import type { GeneratorId, PurchaseQuantity } from "@/lib/game/types"
import { PurchaseQuantityControl } from "./purchase-quantity-control"
import { GeneratorCard } from "./generator-card"
import { BuffToast } from "../feedback"

const generatorIds = Object.keys(GENERATORS) as GeneratorId[]
const quantities: { value: PurchaseQuantity; label: string }[] = [
  { value: 1, label: "x1" },
  { value: 10, label: "x10" },
  { value: 25, label: "x25" },
  { value: "next", label: "Next" },
  { value: "max", label: "Max" },
]

export function GeneratorPanel() {
  const state = useGameStore()
  const [quantity, setQuantity] = useState<PurchaseQuantity>(1)
  const [message, setMessage] = useState<string | null>(null)
  const [buffToast, setBuffToast] = useState<string | null>(null)
  const [visualNow, setVisualNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setVisualNow(Date.now()), 100)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!buffToast) return
    const timeout = window.setTimeout(() => setBuffToast(null), 4_500)
    return () => window.clearTimeout(timeout)
  }, [buffToast])

  function handleGeneratorPurchase(generator: GeneratorId, requested: PurchaseQuantity) {
    const before = useGameStore.getState()
    const result = before.buyGenerator(generator, requested)
    if (!result.ok) {
      setMessage(result.reason)
      return
    }

    setMessage(null)
    const after = useGameStore.getState()
    const individualMilestones = generatorMilestonesReached(
      before.generators[generator].owned,
      after.generators[generator].owned,
    )
    const groupMilestones = allGeneratorsMilestonesReached(before, after)
    const unlocked = [
      ...individualMilestones.map(
        (milestone) => `${GENERATORS[generator].label} reached ${milestone}: cycle speed doubled.`,
      ),
      ...groupMilestones.map(
        (milestone) => milestone.bonusType === "output"
          ? `All generators reached ${milestone.threshold}: output increased by 50%.`
          : `All generators reached ${milestone.threshold}: production time halved.`,
      ),
    ]
    if (unlocked.length > 0) setBuffToast(unlocked.join(" "))
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 lg:mb-[16px] lg:gap-[12px]">
        <div className="flex items-center gap-2 lg:gap-[8px]">
          <Cog className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" />
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Field systems</h2>
            <p className="text-xs text-black/55 dark:text-white/50 lg:text-[12px]">Automatic production cycles</p>
          </div>
        </div>
        <PurchaseQuantityControl quantity={quantity} options={quantities} onChange={setQuantity} />
      </div>

      {message && <p className="mb-3 border-l-2 border-[#b2683c] pl-2 text-xs text-[#7a3a24] dark:text-[#e8a47f] lg:mb-[12px] lg:pl-[8px]">{message}</p>}

      <div className="grid gap-2 xl:grid-cols-2 lg:gap-[8px]">
        {generatorIds.map((id) => <GeneratorCard key={id} id={id} state={state} quantity={quantity} visualNow={visualNow} onBuy={handleGeneratorPurchase} />)}
      </div>
      {buffToast && <BuffToast message={buffToast} />}
    </div>
  )
}
