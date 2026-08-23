import { AlertTriangle } from "lucide-react"

export type GameWarning = { label: string; detail: string }

export function GameWarningBar({ warnings }: { warnings: GameWarning[] }) {
  if (warnings.length === 0) return null
  return (
    <section aria-live="polite" className="border-b border-[#9e4f37]/35 bg-[#c96a46]/12 text-[#6e2d1c] dark:bg-[#9e4f37]/15 dark:text-[#f0a287]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
        {warnings.map((warning) => <div key={warning.label} className="flex min-w-0 items-center gap-2 text-xs"><AlertTriangle className="size-4 shrink-0" /><strong>{warning.label}</strong><span className="text-current/70">{warning.detail}</span></div>)}
      </div>
    </section>
  )
}
