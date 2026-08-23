import type { ReactNode } from "react"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function ResourceStat({
  icon,
  label,
  value,
  max,
  suffix = "",
  tone,
  className = "",
}: {
  icon: ReactNode
  label: string
  value: number
  max?: number
  suffix?: string
  tone: "amber" | "green" | "steel" | "red" | "blue"
  className?: string
}) {
  const width = max ? Math.min((value / max) * 100, 100) : 100
  return (
    <div className={`relative min-w-0 px-4 py-3 lg:px-[16px] lg:py-[12px] ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/55 dark:text-white/55 lg:gap-[8px] lg:text-[10px]">
        <span className={`resource-tone-${tone} [&_svg]:size-3.5 lg:[&_svg]:size-[14px]`}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums lg:text-[18px]">{number.format(value)}{suffix}</div>
      {max && <div className="absolute inset-x-4 bottom-0 h-0.5 bg-black/10 dark:bg-white/10 lg:inset-x-[16px] lg:h-[2px]"><div className={`h-full resource-bg-${tone}`} style={{ width: `${width}%` }} /></div>}
    </div>
  )
}
