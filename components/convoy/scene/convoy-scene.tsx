import { useState } from "react"

import { TASKS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import { SceneScenery } from "./scene-scenery"
import { SceneVehicle } from "./scene-vehicle"

export function ConvoyScene({ dayProgress }: { dayProgress: number }) {
  const [carOpen, setCarOpen] = useState(true)
  const characters = useGameStore((state) => state.characters)
  const exterior = useGameStore((state) => state.exterior)
  const pairBonds = useGameStore((state) => state.pairBonds)
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const fuel = useGameStore((state) => state.resources.fuel)
  const interaction = getInteractionState(characters, pendingEvent, pendingNightDay)

  return (
    <section className="convoy-scene relative isolate h-72 overflow-hidden border-b border-black/20 sm:h-80 lg:h-[390px] dark:border-white/10">
      <SceneScenery />
      <div className="absolute top-4 left-4 border border-black/20 bg-[#e8dfcd]/85 px-3 py-2 text-[#252720] backdrop-blur-sm dark:border-white/15 dark:bg-[#1d221e]/85 dark:text-[#e8e3d6] lg:top-[16px] lg:left-[16px] lg:px-[12px] lg:py-[8px]"><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-60 lg:text-[9px]">Road status</p><p className="mt-0.5 text-xs font-semibold lg:mt-[4px] lg:text-[12px]">{dayProgress < 0.35 ? "Morning haze" : dayProgress < 0.75 ? "Hard daylight" : "Dusk approaching"}</p></div>
      <SceneVehicle exterior={exterior} fuel={fuel} carOpen={carOpen} onToggle={() => setCarOpen((open) => !open)} characters={characters} pairBonds={pairBonds} interaction={interaction} />
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
