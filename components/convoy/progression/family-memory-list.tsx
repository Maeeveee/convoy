import type { FamilyMemory } from "@/lib/game/types"

export function FamilyMemoryList({ memories }: { memories: FamilyMemory[] }) {
  return <div className="mt-4 border-t border-black/10 pt-3 dark:border-white/10"><p className="text-xs font-semibold">Family memories</p>{memories.length === 0 ? <p className="mt-2 text-xs text-black/50 dark:text-white/45">The journey has just begun.</p> : <div className="mt-2 space-y-2">{memories.slice(-3).reverse().map((memory) => <p key={memory.id} className="text-xs leading-5 text-black/60 dark:text-white/55">{memory.text}</p>)}</div>}</div>
}
