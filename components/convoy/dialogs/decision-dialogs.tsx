"use client"

import { X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { useGameStore } from "@/lib/game/store"
import { eventById, NIGHT_CHOICES } from "@/lib/game/events"

export function DecisionDialogs() {
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const resolveEvent = useGameStore((state) => state.resolveEvent)
  const resolveNight = useGameStore((state) => state.resolveNight)
  const event = pendingEvent ? eventById(pendingEvent) : null
  const decisionKey = event ? `event:${pendingEvent}` : pendingNightDay ? `night:${pendingNightDay}` : null
  const [dismissedDecisionKey, setDismissedDecisionKey] = useState<string | null>(null)
  const isOpen = decisionKey !== dismissedDecisionKey

  if (!decisionKey) return null

  if (event) {
    return (
      <DecisionDialog
        eyebrow="Road event"
        title={event.title}
        description={event.description}
        isOpen={isOpen}
        onDefer={() => setDismissedDecisionKey(decisionKey)}
        onReopen={() => setDismissedDecisionKey(null)}
      >
        {event.choices.map((choice) => (
          <ChoiceButton key={choice.id} label={choice.label} consequence={choice.consequence} onClick={() => resolveEvent(choice.id)} />
        ))}
      </DecisionDialog>
    )
  }

  if (pendingNightDay) {
    return (
      <DecisionDialog
        eyebrow={`Night ritual · Day ${pendingNightDay}`}
        title="Stay close for a while"
        description="The road is quiet enough for one family choice before tomorrow begins."
        isOpen={isOpen}
        onDefer={() => setDismissedDecisionKey(decisionKey)}
        onReopen={() => setDismissedDecisionKey(null)}
      >
        {NIGHT_CHOICES.map((choice) => (
          <ChoiceButton key={choice.id} label={choice.label} consequence={choice.consequence} onClick={() => resolveNight(choice.id)} />
        ))}
      </DecisionDialog>
    )
  }

  return null
}

function DecisionDialog({
  eyebrow,
  title,
  description,
  isOpen,
  onDefer,
  onReopen,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  isOpen: boolean
  onDefer: () => void
  onReopen: () => void
  children: React.ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDefer()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onDefer])

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onReopen}
        className="fixed right-4 bottom-4 z-30 flex min-h-10 items-center gap-2 border border-[#d3a849]/60 bg-[#202521] px-3 py-2 text-xs font-semibold text-[#ebe5d7] shadow-lg hover:bg-[#30382f] lg:right-[16px] lg:bottom-[16px] lg:min-h-[40px] lg:gap-[8px] lg:px-[12px] lg:py-[8px] lg:text-[14px]"
        aria-label={`Review ${eyebrow.toLowerCase()}`}
      >
        <span className="size-2 rounded-full bg-[#d3a849] lg:size-[8px]" aria-hidden="true" />
        Review decision
      </button>
    )
  }

  return (
    <div ref={panelRef} className="fixed right-4 bottom-4 z-40 w-[min(32rem,calc(100vw-2rem))] border border-white/15 bg-[#202521] p-5 text-[#ebe5d7] shadow-2xl lg:right-[16px] lg:bottom-[16px] lg:w-[512px] lg:p-[20px]" role="dialog" aria-modal="false" aria-labelledby="decision-title" aria-describedby="decision-description">
      <div className="flex items-start justify-between gap-4 lg:gap-[16px]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3a849] lg:text-[10px]">{eyebrow}</p>
          <h2 id="decision-title" className="mt-1 text-xl font-semibold lg:mt-[4px] lg:text-[20px]">{title}</h2>
        </div>
        <button type="button" onClick={onDefer} className="grid size-8 shrink-0 place-items-center text-[#adb6ac] hover:bg-white/10 hover:text-white lg:size-[32px]" aria-label="Review this decision later" title="Review later">
          <X className="size-4 lg:size-[16px]" />
        </button>
      </div>
      <p id="decision-description" className="mt-2 text-sm leading-6 text-[#adb6ac] lg:mt-[8px] lg:text-[14px] lg:leading-[24px]">{description}</p>
      <div className="mt-5 grid gap-2 lg:mt-[20px] lg:gap-[8px]">{children}</div>
      <p className="mt-3 text-xs text-[#8f9b8f] lg:mt-[12px] lg:text-[12px]">The convoy keeps moving while this decision waits.</p>
      <button type="button" onClick={onDefer} className="mt-3 text-xs font-semibold text-[#d3a849] underline-offset-4 hover:underline lg:mt-[12px] lg:text-[12px]">Review later</button>
    </div>
  )
}

function ChoiceButton({ label, consequence, onClick }: { label: string; consequence: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-12 items-center justify-between gap-4 border border-white/15 bg-white/[0.04] px-4 py-3 text-left hover:border-[#d3a849]/70 hover:bg-[#d3a849]/10 lg:min-h-[48px] lg:gap-[16px] lg:px-[16px] lg:py-[12px]"><span className="text-sm font-semibold lg:text-[14px] lg:leading-[20px]">{label}</span><span className="text-right text-xs text-[#adb6ac] lg:text-[12px] lg:leading-[16px]">{consequence}</span></button>
}
