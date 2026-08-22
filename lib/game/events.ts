import type { EventId, EventTrigger, GameState } from "./types"

export type EventChoice = {
  id: string
  label: string
  consequence: string
  credits?: number
  fuel?: number
  bond?: number
}

export type GameEvent = {
  id: EventId
  title: string
  description: string
  choices: EventChoice[]
  minExteriorLevel?: number
  trigger: EventTrigger
}

export const EVENTS: GameEvent[] = [
  {
    id: "roadsideMarket",
    trigger: "scheduled",
    title: "A market under canvas",
    description: "A family has set up beside the road. Their prices are fair, but the convoy cannot stay long.",
    choices: [
      { id: "trade", label: "Trade information", consequence: "+180 Trade Credits", credits: 180, bond: 1 },
      { id: "fuel", label: "Buy their fuel", consequence: "-120 Trade Credits, +35 Fuel", credits: -120, fuel: 35 },
    ],
  },
  {
    id: "looseBelt",
    trigger: "lowFuel",
    title: "Something is rattling",
    description: "A belt is coming loose beneath the hood. Father can fix it, but the parts will cost you.",
    choices: [
      { id: "repair", label: "Repair it now", consequence: "-90 Trade Credits, the convoy stays reliable", credits: -90, bond: 1 },
      { id: "ignore", label: "Keep moving", consequence: "-12 Fuel, the family feels the strain", fuel: -12, bond: -3 },
    ],
  },
  {
    id: "radioDistress",
    trigger: "scheduled",
    title: "A voice in the static",
    description: "A survivor convoy is trapped nearby and offers a route map for anyone willing to answer.",
    choices: [
      { id: "answer", label: "Answer the call", consequence: "+260 Trade Credits, +2 Bond", credits: 260, bond: 2 },
      { id: "quiet", label: "Keep the radio quiet", consequence: "The family stays hidden", bond: 1 },
    ],
  },
  {
    id: "waterTower",
    trigger: "openPickup",
    title: "The old water tower",
    description: "The tower still has pressure. It could top up the tanks, but climbing costs time and energy.",
    choices: [
      { id: "climb", label: "Make the climb", consequence: "+25 Fuel, -1 Bond", fuel: 25, bond: -1 },
      { id: "pass", label: "Pass it by", consequence: "+40 Trade Credits from a quick salvage", credits: 40 },
    ],
  },
  {
    id: "strangerChild",
    trigger: "lowBond",
    title: "A child at the fence",
    description: "A lone child waves from a settlement perimeter. The family has only a moment to decide how to respond.",
    choices: [
      { id: "share", label: "Share the radio", consequence: "+4 Bond, -50 Trade Credits", bond: 4, credits: -50 },
      { id: "leave", label: "Keep driving", consequence: "+1 Fuel, -2 Bond", fuel: 1, bond: -2 },
    ],
  },
  {
    id: "nightWatch",
    trigger: "scheduled",
    title: "Lights beyond the road",
    description: "The family spots a safe place to stop for the night. Resting together costs time, but the quiet matters.",
    minExteriorLevel: 2,
    choices: [
      { id: "rest", label: "Stop and rest", consequence: "+5 Bond, -8 Fuel", bond: 5, fuel: -8 },
      { id: "push", label: "Push through the dark", consequence: "+120 Trade Credits, -3 Bond", credits: 120, bond: -3 },
    ],
  },
]

export const NIGHT_CHOICES: EventChoice[] = [
  { id: "story", label: "Tell a story", consequence: "+6 Bond", bond: 6 },
  { id: "repair", label: "Plan tomorrow's work", consequence: "+2 Bond, +40 Trade Credits", bond: 2, credits: 40 },
  { id: "sleep", label: "Sleep early", consequence: "+1 Fuel, no bond change", fuel: 1 },
]

export const EVENT_INTERVAL_SECONDS = 180
export const EVENT_COOLDOWN_SECONDS = 45

export function chooseEvent(state: GameState, trigger: EventTrigger = "scheduled"): GameEvent {
  const eligible = EVENTS.filter((event) =>
    (event.trigger === trigger || (trigger === "scheduled" && event.trigger === "scheduled")) &&
    (!event.minExteriorLevel || state.exterior.level >= event.minExteriorLevel),
  )
  const pool = eligible.length > 0 ? eligible : EVENTS.filter((event) => event.trigger === "scheduled")
  const index = Math.floor(state.distance + state.elapsedSeconds / EVENT_INTERVAL_SECONDS) % pool.length
  return pool[index]
}

export function eventById(id: EventId) {
  return EVENTS.find((event) => event.id === id) ?? null
}
