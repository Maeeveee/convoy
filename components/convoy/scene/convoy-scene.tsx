import { useEffect, useState } from "react"

import { TASKS } from "@/lib/game/constants"
import { dialogueForEvent, NIGHT_DIALOGUE, ROAD_DIALOGUES, type FamilyDialogue } from "@/lib/game/dialogues"
import { useGameStore } from "@/lib/game/store"
import { SceneScenery } from "./scene-scenery"
import { SceneVehicle } from "./scene-vehicle"

export function ConvoyScene({ dayProgress }: { dayProgress: number }) {
  const [carOpen, setCarOpen] = useState(true)
  const [actorPositions, setActorPositions] = useState({ mother: 0, child: 0 })
  const [dialogueState, setDialogueState] = useState<{ dialogue: FamilyDialogue; line: number } | null>(null)
  const [shownTrigger, setShownTrigger] = useState<string | null>(null)

  useEffect(() => {
    if (!carOpen || dialogueState) {
      return
    }

    let cancelled = false
    const timers: number[] = []
    const mobile = window.innerWidth <= 640
    const actors = [
      { id: "mother" as const, range: mobile ? 16 : 36, direction: mobile ? -1 : 1, initialDelay: 300 + Math.random() * 1_200 },
      { id: "child" as const, range: mobile ? 28 : 56, direction: -1, initialDelay: 700 + Math.random() * 1_800 },
    ]

    const schedule = (actor: (typeof actors)[number], position: number) => {
      if (cancelled) return
      const waitTimer = window.setTimeout(() => {
        if (cancelled) return
        const destination = position === 0 ? actor.range * actor.direction : 0
        const duration = 1_200 + Math.random() * 3_800
        const started = performance.now()
        const move = (now: number) => {
          if (cancelled) return
          const progress = Math.min((now - started) / duration, 1)
          const eased = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2
          setActorPositions((current) => ({ ...current, [actor.id]: position + (destination - position) * eased }))
          if (progress < 1) window.requestAnimationFrame(move)
          else schedule(actor, destination)
        }
        window.requestAnimationFrame(move)
      }, 2_500 + Math.random() * 8_000)
      timers.push(waitTimer)
    }

    actors.forEach((actor) => {
      timers.push(window.setTimeout(() => schedule(actor, 0), actor.initialDelay))
    })

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [carOpen, dialogueState])
  const characters = useGameStore((state) => state.characters)
  const exterior = useGameStore((state) => state.exterior)
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const fuel = useGameStore((state) => state.resources.fuel)
  const interaction = getInteractionState(characters, pendingEvent, pendingNightDay)
  const eventDialogue = dialogueForEvent(pendingEvent)

  useEffect(() => {
    const dialogue = eventDialogue ?? (pendingNightDay ? NIGHT_DIALOGUE : null)
    const trigger = pendingEvent ? `event:${pendingEvent}` : pendingNightDay ? `night:${pendingNightDay}` : null
    if (!dialogue || !trigger || trigger === shownTrigger || !carOpen) return
    const timeout = window.setTimeout(() => {
      setShownTrigger(trigger)
      setDialogueState({ dialogue, line: 0 })
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [carOpen, eventDialogue, pendingEvent, pendingNightDay, shownTrigger])

  useEffect(() => {
    if (!carOpen || pendingEvent || pendingNightDay || dialogueState) return
    const wait = 35_000 + Math.random() * 45_000
    const timeout = window.setTimeout(() => {
      const index = Math.floor(Math.random() * ROAD_DIALOGUES.length)
      setDialogueState({ dialogue: ROAD_DIALOGUES[index], line: 0 })
    }, wait)
    return () => window.clearTimeout(timeout)
  }, [carOpen, dialogueState, pendingEvent, pendingNightDay])

  useEffect(() => {
    if (!dialogueState) return
    const timeout = window.setTimeout(() => {
      setDialogueState((current) => !current ? null : current.line < current.dialogue.lines.length - 1 ? { ...current, line: current.line + 1 } : null)
    }, 5_500)
    return () => window.clearTimeout(timeout)
  }, [dialogueState])

  function advanceDialogue() {
    setDialogueState((current) => !current ? null : current.line < current.dialogue.lines.length - 1 ? { ...current, line: current.line + 1 } : null)
  }

  function toggleCar() {
    setDialogueState(null)
    setCarOpen((open) => !open)
  }

  return (
    <section className="convoy-scene relative isolate h-72 overflow-hidden border-b border-black/20 sm:h-80 lg:h-[390px] dark:border-white/10">
      <SceneScenery />
      <div className="absolute top-4 left-4 border border-black/20 bg-[#e8dfcd]/85 px-3 py-2 text-[#252720] backdrop-blur-sm dark:border-white/15 dark:bg-[#1d221e]/85 dark:text-[#e8e3d6] lg:top-[16px] lg:left-[16px] lg:px-[12px] lg:py-[8px]"><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 lg:text-[9px]">Road status</p><p className="mt-0.5 text-xs font-semibold lg:mt-[4px] lg:text-[12px]">{dayProgress < 0.35 ? "Morning haze" : dayProgress < 0.75 ? "Hard daylight" : "Dusk approaching"}</p></div>
      <SceneVehicle exterior={exterior} fuel={fuel} carOpen={carOpen} onToggle={toggleCar} actorPositions={carOpen ? actorPositions : { mother: 0, child: 0 }} dialogue={dialogueState?.dialogue ?? null} dialogueLine={dialogueState?.line ?? 0} onAdvanceDialogue={advanceDialogue} interaction={interaction} />
    </section>
  )
}

function getInteractionState(characters: typeof useGameStore extends never ? never : ReturnType<typeof useGameStore.getState>["characters"], pendingEvent: string | null, pendingNightDay: number | null) {
  if (pendingEvent) return { father: { mode: "meet" as const, bubble: "We need a plan." }, mother: { mode: "meet" as const, bubble: "Stay together." }, child: { mode: "meet" as const, bubble: "I heard them." } }
  if (pendingNightDay) return { father: { mode: "meet" as const, bubble: "Night is close." }, mother: { mode: "meet" as const, bubble: "One choice together." }, child: { mode: "meet" as const, bubble: "Can we talk?" } }
  const walk = (task: string) => task === "connect" || task === "rest"
  return {
    father: { mode: walk(characters.father.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.father.task].label },
    mother: { mode: walk(characters.mother.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.mother.task].label },
    child: { mode: walk(characters.child.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.child.task].label },
  }
}
