export function SceneCharacter({ name, position, activity, pose = "stand", dialogueText }: { name: string; position: "father" | "mother" | "child"; activity: { mode: "work" | "walk" | "meet"; bubble: string }; pose?: "stand" | "sit"; dialogueText?: string }) {
  const bubbleText = dialogueText ?? (activity.mode === "meet" ? activity.bubble : null)
  return <div className={`character-marker character-${position} character-mode-${activity.mode} character-pose-${pose}`}><div className="character-head" /><div className="character-hair" /><div className="character-body" /><div className="character-bag" />{bubbleText && <div key={bubbleText} className="speech-bubble">{bubbleText}</div>}<div className="character-label"><span>{name}</span></div></div>
}
