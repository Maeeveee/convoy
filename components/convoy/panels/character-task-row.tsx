import { TASKS } from "@/lib/game/constants"
import type { CharacterId, CharacterState, TaskId } from "@/lib/game/types"

export function CharacterTaskRow({ id, character, name, tasks, onAssign }: { id: CharacterId; character: CharacterState; name: string; tasks: TaskId[]; onAssign: (id: CharacterId, task: TaskId) => void }) {
  return <label className="grid grid-cols-[5rem_1fr] items-center gap-3 text-sm lg:grid-cols-[75px_1fr] lg:gap-[12px]"><span className="font-semibold">{name}<small className={`mt-0.5 block text-xs font-normal lg:text-[10px] ${character.energy < 25 ? "text-[#9e4f37]" : "text-black/50 dark:text-white/45"}`}>{Math.round(character.energy)} energy</small></span><select value={character.task} onChange={(event) => onAssign(id, event.target.value as TaskId)} className="h-9 min-w-0 border border-black/20 bg-[#eee9de] px-2 text-sm outline-none focus:border-[#9a6f2d] dark:border-white/15 dark:bg-[#252b26] lg:h-[36px] lg:px-[8px]">{tasks.map((task) => <option key={task} value={task}>{TASKS[task].label}</option>)}</select></label>
}
