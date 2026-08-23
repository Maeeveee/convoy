export function SceneCharacter({ name, task, position, bond, activity }: { name: string; task: string; position: "father" | "mother" | "child"; bond: number; activity: { mode: "work" | "walk" | "meet"; bubble: string } }) {
  const mood = bond > 70 ? "steady" : bond > 35 ? "strained" : "distant"
  return <div className={`character-marker character-${position} character-mode-${activity.mode}`}><div className="character-head" /><div className="character-hair" /><div className="character-body" /><div className="character-bag" /><div className="speech-bubble">{activity.bubble}</div><div className="character-label"><span>{name}</span><small>{task} · {mood}</small></div></div>
}
