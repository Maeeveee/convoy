import { Sparkles } from "lucide-react"

export function BuffToast({ message }: { message: string }) {
  return (
    <div
      className="fixed top-[5.75rem] right-4 z-[80] flex max-w-[calc(100vw-2rem)] items-start gap-3 border border-[#d3a849]/60 bg-[#202821] px-4 py-3 text-[#ebe5d7] shadow-2xl sm:top-20 sm:right-6 lg:top-[72px] lg:right-[24px]"
      role="status"
      aria-live="polite"
    >
      <Sparkles className="mt-0.5 size-4 shrink-0 text-[#d3a849]" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#d3a849]">Buff unlocked</p>
        <p className="mt-1 text-sm leading-5">{message}</p>
      </div>
    </div>
  )
}
