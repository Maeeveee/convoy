import { Users } from "lucide-react"

import { TASKS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import type { CharacterId, TaskId } from "@/lib/game/types"

const characterNames: Record<CharacterId, string> = {
  father: "Father",
  mother: "Mother",
  child: "Child",
}

const availableTasks: Record<CharacterId, TaskId[]> = {
  father: ["drive", "repair", "connect", "rest"],
  mother: ["trade", "connect", "repair", "rest"],
  child: ["connect", "trade", "rest"],
}

export function TaskPanel() {
  const characters = useGameStore((state) => state.characters)
  const assignTask = useGameStore((state) => state.assignTask)

  return (
    <section className="p-4 sm:p-5 lg:p-[20px]">
      <div className="mb-4 flex items-center gap-2 lg:mb-[16px] lg:gap-[8px]">
        <Users className="size-4 text-[#8c6125] dark:text-[#d3a849] lg:size-[16px]" />
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] lg:text-[14px]">Family assignments</h2>
          <p className="text-xs text-black/55 dark:text-white/50 lg:text-[12px]">Change work at any time</p>
        </div>
      </div>
      <div className="space-y-3 lg:space-y-[12px]">
        {(Object.keys(characterNames) as CharacterId[]).map((id) => (
          <label key={id} className="grid grid-cols-[5rem_1fr] items-center gap-3 text-sm lg:grid-cols-[75px_1fr] lg:gap-[12px] lg:text-[14px]">
            <span className="font-semibold">{characterNames[id]}<small className={`mt-0.5 block text-xs font-normal lg:mt-[2px] lg:text-[10px] ${characters[id].energy < 25 ? "text-[#9e4f37]" : "text-black/50 dark:text-white/45"}`}>{Math.round(characters[id].energy)} energy</small></span>
            <select
              value={characters[id].task}
              onChange={(event) => assignTask(id, event.target.value as TaskId)}
              className="h-9 min-w-0 border border-black/20 bg-[#eee9de] px-2 text-sm outline-none focus:border-[#9a6f2d] dark:border-white/15 dark:bg-[#252b26] lg:h-[36px] lg:px-[8px] lg:text-[14px]"
            >
              {availableTasks[id].map((task) => (
                <option key={task} value={task}>{TASKS[task].label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  )
}
