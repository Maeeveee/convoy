import type { CharacterId, EventId } from "./types"

export type FamilyDialogue = {
  id: string
  title: string
  participants: CharacterId[]
  pose: "stand" | "sit"
  lines: { speaker: CharacterId; text: string }[]
}

export const ROAD_DIALOGUES: FamilyDialogue[] = [
  {
    id: "mother-child-home",
    title: "A memory of home",
    participants: ["mother", "child"],
    pose: "stand",
    lines: [
      { speaker: "child", text: "Do you remember the blue curtains?" },
      { speaker: "mother", text: "I remember you hiding behind them." },
      { speaker: "child", text: "We can have blue curtains again someday." },
    ],
  },
  {
    id: "father-child-road",
    title: "Learning the road",
    participants: ["father", "child"],
    pose: "stand",
    lines: [
      { speaker: "child", text: "How do you know which road is safe?" },
      { speaker: "father", text: "I do not. I look, listen, then choose." },
      { speaker: "child", text: "Then I will listen with you." },
    ],
  },
  {
    id: "father-mother-promise",
    title: "The promise",
    participants: ["father", "mother"],
    pose: "stand",
    lines: [
      { speaker: "mother", text: "You have been quiet all morning." },
      { speaker: "father", text: "I am counting everything we still have." },
      { speaker: "mother", text: "Count us first. We are still here." },
    ],
  },
  {
    id: "family-story",
    title: "A story beside the road",
    participants: ["father", "mother", "child"],
    pose: "sit",
    lines: [
      { speaker: "father", text: "My father once got lost on this same highway." },
      { speaker: "mother", text: "You always change the ending." },
      { speaker: "child", text: "Tell the version where he found the orchard." },
      { speaker: "father", text: "All right. The orchard version." },
    ],
  },
]

const EVENT_DIALOGUES: Partial<Record<EventId, FamilyDialogue>> = {
  emptyTank: groupDialogue("empty-tank-talk", "A plan by the roadside", "We stop blaming the road and make a plan.", "I will check what we can spare.", "I can watch for lights."),
  looseBelt: groupDialogue("repair-talk", "Under the open hood", "The belt will hold if I fix it now.", "Then tell us what you need.", "I will keep the tools in order."),
  radioDistress: groupDialogue("radio-talk", "The voice in the static", "Someone is asking for help.", "Helping them may expose us.", "But they sound scared."),
  strangerChild: groupDialogue("stranger-talk", "The child at the fence", "We cannot save everyone.", "We can still choose who we are.", "They are waiting for us."),
  nightWatch: groupDialogue("night-watch-talk", "Lights beyond the road", "We could stop here together.", "Just for one quiet hour.", "Tell a story if we do."),
}

export const NIGHT_DIALOGUE: FamilyDialogue = {
  id: "night-story",
  title: "Stories before sleep",
  participants: ["father", "mother", "child"],
  pose: "sit",
  lines: [
    { speaker: "child", text: "Tell me something from before the roads emptied." },
    { speaker: "mother", text: "Your father used to burn every breakfast." },
    { speaker: "father", text: "Only the first few." },
    { speaker: "child", text: "That is the story I wanted." },
  ],
}

export function dialogueForEvent(event: EventId | null) {
  return event ? EVENT_DIALOGUES[event] ?? null : null
}

function groupDialogue(id: string, title: string, father: string, mother: string, child: string): FamilyDialogue {
  return {
    id,
    title,
    participants: ["father", "mother", "child"],
    pose: "sit",
    lines: [
      { speaker: "father", text: father },
      { speaker: "mother", text: mother },
      { speaker: "child", text: child },
    ],
  }
}
