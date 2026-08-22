import { useGameStore } from "@/lib/game/store"
import { eventById, NIGHT_CHOICES } from "@/lib/game/events"

export function DecisionDialogs() {
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const resolveEvent = useGameStore((state) => state.resolveEvent)
  const resolveNight = useGameStore((state) => state.resolveNight)
  const event = pendingEvent ? eventById(pendingEvent) : null

  if (event) {
    return (
      <DecisionDialog eyebrow="Road event" title={event.title} description={event.description}>
        {event.choices.map((choice) => (
          <ChoiceButton key={choice.id} label={choice.label} consequence={choice.consequence} onClick={() => resolveEvent(choice.id)} />
        ))}
      </DecisionDialog>
    )
  }

  if (pendingNightDay) {
    return (
      <DecisionDialog eyebrow={`Night ritual · Day ${pendingNightDay}`} title="Stay close for a while" description="The road is quiet enough for one family choice before tomorrow begins.">
        {NIGHT_CHOICES.map((choice) => (
          <ChoiceButton key={choice.id} label={choice.label} consequence={choice.consequence} onClick={() => resolveNight(choice.id)} />
        ))}
      </DecisionDialog>
    )
  }

  return null
}

function DecisionDialog({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4" role="presentation">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg border border-white/15 bg-[#202521] p-5 text-[#ebe5d7] shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d3a849]">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[#adb6ac]">{description}</p>
        <div className="mt-5 grid gap-2">{children}</div>
      </div>
    </div>
  )
}

function ChoiceButton({ label, consequence, onClick }: { label: string; consequence: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex items-center justify-between gap-4 border border-white/15 bg-white/[0.04] px-4 py-3 text-left hover:border-[#d3a849]/70 hover:bg-[#d3a849]/10"><span className="text-sm font-semibold">{label}</span><span className="text-right text-xs text-[#adb6ac]">{consequence}</span></button>
}
