import type { FamilyMemory } from "@/lib/game/types"

export function FamilyMemoryList({ memories }: { memories: FamilyMemory[] }) {
  const uniqueMemories = memories.filter((memory, index) => memories.findIndex((item) => item.id === memory.id) === index)
  return <div className="mt-4 border-t border-black/10 pt-3 dark:border-white/10 lg:mt-[16px] lg:pt-[12px]"><p className="text-xs font-semibold lg:text-[12px]">Family memories</p>{uniqueMemories.length === 0 ? <p className="mt-2 text-xs text-black/50 dark:text-white/45 lg:mt-[8px] lg:text-[12px] lg:leading-[20px]">The journey has just begun.</p> : <div className="mt-2 space-y-2 lg:mt-[8px] lg:space-y-[8px]">{uniqueMemories.slice(-3).reverse().map((memory) => <p key={memory.id} className="text-xs leading-5 text-black/60 dark:text-white/55 lg:text-[12px] lg:leading-[20px]">{memory.text}</p>)}</div>}</div>
}
