import type { PurchaseQuantity } from "@/lib/game/types"

export function PurchaseQuantityControl({ quantity, options, onChange }: { quantity: PurchaseQuantity; options: { value: PurchaseQuantity; label: string }[]; onChange: (quantity: PurchaseQuantity) => void }) {
  return <div className="flex border border-black/20 dark:border-white/15" aria-label="Purchase quantity">{options.map((item) => <button key={item.label} type="button" onClick={() => onChange(item.value)} className={`h-8 border-r border-black/15 px-2.5 text-xs font-semibold last:border-r-0 dark:border-white/10 lg:h-[32px] lg:px-[10px] lg:text-[12px] ${quantity === item.value ? "bg-[#2e382f] text-white dark:bg-[#d3a849] dark:text-[#1d211d]" : "bg-white/35 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"}`}>{item.label}</button>)}</div>
}
