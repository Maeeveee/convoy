import Image from "next/image"
import { DoorClosed, DoorOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EXTERIOR_UPGRADES } from "@/lib/game/constants"
import carFirstClose from "@/public/image/cars/car-first-close.webp"
import carFirstOpen from "@/public/image/cars/car-first-open.webp"
import carSecondClose from "@/public/image/cars/car-second-close.webp"
import carSecondOpen from "@/public/image/cars/car-second-open.webp"
import carThirdClose from "@/public/image/cars/car-third-close.webp"
import carThirdOpen from "@/public/image/cars/car-third-open.webp"
import { FamilyDialogueView } from "./family-dialogue"
import { SceneCharacter } from "./scene-character"
import type { FamilyDialogue } from "@/lib/game/dialogues"

const names = { father: "Constantine", mother: "Veronic", child: "Paul" } as const
const carImages = {
  1: { open: carFirstOpen, close: carFirstClose },
  2: { open: carSecondOpen, close: carSecondClose },
  3: { open: carThirdOpen, close: carThirdClose },
} as const

export function SceneVehicle({ exterior, fuel, carOpen, onToggle, actorPositions, dialogue, dialogueLine, onAdvanceDialogue, interaction }: { exterior: { level: number; id: keyof typeof EXTERIOR_UPGRADES }; fuel: number; carOpen: boolean; onToggle: () => void; actorPositions: { mother: number; child: number }; dialogue: FamilyDialogue | null; dialogueLine: number; onAdvanceDialogue: () => void; interaction: Record<keyof typeof names, { mode: "work" | "walk" | "meet"; bubble: string }> }) {
  const tier = exterior.level === 1 ? 1 : exterior.level === 2 ? 2 : 3
  const carImage = carImages[tier][carOpen ? "open" : "close"]
  const line = dialogue?.lines[dialogueLine]
  const dialogueText = line?.text
  const participating = (id: keyof typeof names) => dialogue?.participants.includes(id) ?? false
  const isStoryScene = dialogue?.pose === "sit"
  const motherOffset = isStoryScene ? 0 : dialogue && participating("mother") ? (participating("father") ? 40 : 20) : actorPositions.mother
  const childOffset = isStoryScene ? 0 : dialogue && participating("child") ? (participating("father") ? -12 : -20) : actorPositions.child
  const fatherOffset = isStoryScene ? -88 : dialogue && participating("father") ? -88 : 0
  const characterPose = isStoryScene ? "stand" as const : dialogue?.pose ?? "stand"
  return <><div className={`truck truck-tier-${exterior.level} ${carOpen ? "truck-open" : "truck-closed"} ${dialogue?.pose === "sit" ? "truck-story-time" : ""} ${fuel <= 0 ? "truck-stopped" : ""}`}><Image src={carImage} alt={`${EXTERIOR_UPGRADES[exterior.id].label}, ${carOpen ? "open" : "closed"}`} fill priority className="truck-image" sizes="(max-width: 640px) 92vw, 480px" /><div className="truck-characters"><div className="actor-motion-mother" style={{ transform: `translateX(${motherOffset}px)` }}><SceneCharacter name={names.mother} position="mother" activity={interaction.mother} pose={participating("mother") ? characterPose : "stand"} dialogueText={line?.speaker === "mother" ? dialogueText : undefined} /></div><div className="actor-motion-child" style={{ transform: `translateX(${childOffset}px)` }}><SceneCharacter name={names.child} position="child" activity={interaction.child} pose={participating("child") ? characterPose : "stand"} dialogueText={line?.speaker === "child" ? dialogueText : undefined} /></div><div className="actor-motion-father" style={{ transform: `translateX(${fatherOffset}px)` }}><SceneCharacter name={names.father} position="father" activity={interaction.father} pose={participating("father") ? characterPose : "stand"} dialogueText={line?.speaker === "father" ? dialogueText : undefined} /></div></div></div>{dialogue && <FamilyDialogueView dialogue={dialogue} lineIndex={dialogueLine} onAdvance={onAdvanceDialogue} />}<Button type="button" variant="outline" size="sm" className="absolute top-4 right-4 z-10 rounded-sm border-white/30 bg-[#202821]/80 text-[#ebe5d7] shadow-lg backdrop-blur-sm hover:bg-[#202821] lg:top-[16px] lg:right-[16px]" onClick={onToggle} aria-pressed={carOpen} title={carOpen ? "Close vehicle" : "Open vehicle"}>{carOpen ? <DoorClosed /> : <DoorOpen />}<span className="hidden sm:inline">{carOpen ? "Close" : "Open"}</span></Button><div className="vehicle-shell-meta absolute right-4 bottom-4 text-right text-[#eee7d8] drop-shadow-md lg:right-[16px] lg:bottom-[16px]"><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70 lg:text-[9px]">Vehicle shell</p><p className="text-sm font-semibold lg:text-[14px]">{EXTERIOR_UPGRADES[exterior.id].label}</p><p className="mt-1 text-xs uppercase tracking-[0.12em] opacity-60 lg:mt-[4px] lg:text-[10px]">{carOpen ? "Open for work." : "Closed for travel."}</p></div></>
}
