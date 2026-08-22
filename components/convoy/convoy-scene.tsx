import { EXTERIOR_UPGRADES, TASKS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"

const names = { father: "Father", mother: "Mother", child: "Child" } as const

export function ConvoyScene({ dayProgress }: { dayProgress: number }) {
  const characters = useGameStore((state) => state.characters)
  const exterior = useGameStore((state) => state.exterior)
  const pairBonds = useGameStore((state) => state.pairBonds)
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const fuel = useGameStore((state) => state.resources.fuel)
  const interaction = getInteractionState(characters, pendingEvent, pendingNightDay)

  return (
    <section className="convoy-scene relative isolate h-[300px] overflow-hidden border-b border-black/20 sm:h-[390px] dark:border-white/10">
      <div className="ruin-layer ruin-layer-far" />
      <div className="ruin-layer ruin-layer-near" />
      <div className="city-lights" aria-hidden="true" />
      <div className="skyline-dust" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-[27%] bg-[#393a34]">
        <div className="road-stripe" />
      </div>

      <div className="absolute top-4 left-4 border border-black/20 bg-[#e8dfcd]/85 px-3 py-2 text-[#252720] backdrop-blur-sm dark:border-white/15 dark:bg-[#1d221e]/85 dark:text-[#e8e3d6]">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-60">Road status</p>
        <p className="mt-0.5 text-xs font-semibold">
          {dayProgress < 0.35 ? "Morning haze" : dayProgress < 0.75 ? "Hard daylight" : "Dusk approaching"}
        </p>
      </div>

      <div className={`truck truck-tier-${exterior.level} ${fuel <= 0 ? "truck-stopped" : ""}`}>
        <div className="truck-bed">
          {exterior.level >= 2 && <div className="truck-cover" />}
          <div className="truck-bed-rail" />
          <div className="cargo-crate cargo-crate-one" />
          <div className="cargo-crate cargo-crate-two" />
          <CharacterMarker name={names.mother} task={TASKS[characters.mother.task].label} position="mother" bond={pairBonds.motherChild} activity={interaction.mother} />
          <CharacterMarker name={names.child} task={TASKS[characters.child.task].label} position="child" bond={pairBonds.fatherChild} activity={interaction.child} />
        </div>
        <div className="truck-cabin">
          <div className="truck-window" />
          <div className="truck-window-glare" />
          <div className="truck-door-line" />
          <div className="truck-handle" />
          <CharacterMarker name={names.father} task={TASKS[characters.father.task].label} position="father" bond={pairBonds.fatherMother} activity={interaction.father} />
        </div>
        <div className="truck-hood" />
        <div className="truck-headlamp" />
        <div className="truck-grille" />
        <div className="truck-side-stripe" />
        <div className="truck-bumper" />
        <div className="truck-wheel truck-wheel-left" />
        <div className="truck-wheel truck-wheel-right" />
      </div>

      <div className="absolute right-4 bottom-4 text-right text-[#eee7d8] drop-shadow-md">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-70">Vehicle shell</p>
        <p className="text-sm font-semibold">{EXTERIOR_UPGRADES[exterior.id].label}</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] opacity-60">No map. Keep moving.</p>
      </div>
    </section>
  )
}

function CharacterMarker({
  name,
  task,
  position,
  bond,
  activity,
}: {
  name: string
  task: string
  position: "father" | "mother" | "child"
  bond: number
  activity: { mode: "work" | "walk" | "meet"; bubble: string }
}) {
  const mood = bond > 70 ? "steady" : bond > 35 ? "strained" : "distant"
  return (
    <div className={`character-marker character-${position} character-mode-${activity.mode}`}>
      <div className="character-head" />
      <div className="character-hair" />
      <div className="character-body" />
      <div className="character-bag" />
      <div className="speech-bubble">{activity.bubble}</div>
      <div className="character-label">
        <span>{name}</span>
        <small>{task} · {mood}</small>
      </div>
    </div>
  )
}

function getInteractionState(
  characters: Record<"father" | "mother" | "child", { task: string }>,
  pendingEvent: string | null,
  pendingNightDay: number | null,
) {
  if (pendingEvent) {
    return {
      father: { mode: "meet" as const, bubble: "We need a plan." },
      mother: { mode: "meet" as const, bubble: "Stay together." },
      child: { mode: "meet" as const, bubble: "I heard them." },
    }
  }
  if (pendingNightDay) {
    return {
      father: { mode: "meet" as const, bubble: "Night is close." },
      mother: { mode: "meet" as const, bubble: "One choice together." },
      child: { mode: "meet" as const, bubble: "Can we talk?" },
    }
  }
  const walk = (task: string) => task === "connect" || task === "rest"
  return {
    father: { mode: walk(characters.father.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.father.task as keyof typeof TASKS]?.label ?? "Working" },
    mother: { mode: walk(characters.mother.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.mother.task as keyof typeof TASKS]?.label ?? "Working" },
    child: { mode: walk(characters.child.task) ? "walk" as const : "work" as const, bubble: TASKS[characters.child.task as keyof typeof TASKS]?.label ?? "Working" },
  }
}
