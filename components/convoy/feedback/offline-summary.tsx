import { useGameStore } from "@/lib/game/store"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function OfflineSummaryDialog() {
  const summary = useGameStore((state) => state.offlineSummary)
  const dismiss = useGameStore((state) => state.dismissOfflineSummary)
  if (!summary) return null

  const hours = Math.floor(summary.offlineSeconds / 3_600)
  const minutes = Math.floor((summary.offlineSeconds % 3_600) / 60)
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="return-title" className="w-full max-w-md border border-white/15 bg-[#202521] p-5 text-[#ebe5d7] shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3a849] lg:text-[10px]">Journey resumed</p>
        <h2 id="return-title" className="mt-1 text-xl font-semibold">While you were away</h2>
        <p className="mt-2 text-sm text-[#adb6ac]">The family was away for {hours}h {minutes}m. Generator cycles ran at 60% efficiency.</p>
        <div className="mt-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10 sm:grid-cols-4">
          <SummaryValue label="Fuel change" value={summary.fuelChange} />
          <SummaryValue label="Credits" value={summary.creditsGained} />
          <SummaryValue label="Distance" value={summary.distanceGained} />
        </div>
        <button type="button" onClick={dismiss} className="mt-5 h-10 w-full bg-[#d3a849] px-4 text-sm font-bold text-[#20251f] hover:bg-[#e1bd68]">Continue journey</button>
      </div>
    </div>
  )
}

function SummaryValue({ label, value }: { label: string; value: number }) {
  return <div className="bg-[#202521] p-3"><p className="text-xs uppercase tracking-[0.1em] text-[#8f9b8f] lg:text-[10px]">{label}</p><p className="mt-1 font-mono text-sm tabular-nums">{value > 0 ? "+" : ""}{number.format(value)}</p></div>
}
