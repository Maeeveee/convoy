import { MessageCircle, Users } from "lucide-react"

import type { CharacterId } from "@/lib/game/types"
import type { FamilyDialogue } from "@/lib/game/dialogues"

const names: Record<CharacterId, string> = { father: "Constantine", mother: "Veronic", child: "Paul" }

export function FamilyDialogueView({ dialogue, lineIndex, onAdvance }: { dialogue: FamilyDialogue; lineIndex: number; onAdvance: () => void }) {
  const line = dialogue.lines[lineIndex]
  return <div className="family-dialogue absolute top-4 right-4 left-4 z-20 mx-auto max-w-xl border border-[#d3a849]/60 bg-[#202821]/95 p-4 text-[#ebe5d7] shadow-2xl backdrop-blur-sm lg:top-[16px] lg:right-[16px] lg:left-auto lg:w-[440px] lg:p-[16px]" role="dialog" aria-live="polite" aria-label={`${dialogue.title}, ${names[line.speaker]} speaking`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><MessageCircle className="size-4 text-[#d3a849]" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#d3a849]">{dialogue.title}</p></div><span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-[#aeb8ad]"><Users className="size-3" /> {dialogue.participants.length} together</span></div><p className="mt-3 text-xs font-bold uppercase tracking-[0.1em] text-[#aeb8ad]">{names[line.speaker]}</p><p className="mt-1 text-sm leading-6">{line.text}</p><button type="button" onClick={onAdvance} className="mt-3 text-xs font-semibold text-[#d3a849] underline-offset-4 hover:underline">{lineIndex === dialogue.lines.length - 1 ? "Close story" : "Next line"}</button></div>
}
