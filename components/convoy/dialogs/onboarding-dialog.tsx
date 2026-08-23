"use client"

import { ArrowLeft, ArrowRight, CarFront, Flag, Gauge, Users } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

const steps = [
  {
    icon: CarFront,
    eyebrow: "The journey begins",
    title: "Keep the family moving",
    description: "The truck travels on its own. Your decisions determine how far the family goes and what the journey costs them.",
    details: ["Fuel keeps the convoy moving", "Distance unlocks settlements", "The road continues while decisions wait"],
  },
  {
    icon: Gauge,
    eyebrow: "Survival economy",
    title: "Balance fuel and Trade Credits",
    description: "Generators earn Trade Credits in timed cycles. Spend them on more production, fuel, or vehicle upgrades.",
    details: ["Generator progress is automatic", "Milestones shorten production cycles", "Empty fuel stops distance progress"],
  },
  {
    icon: Users,
    eyebrow: "Family assignments",
    title: "Work has a human cost",
    description: "Open Systems in the navbar to assign work. Productive tasks drain energy, while rest restores it and protects family bond.",
    details: ["Low energy weakens task bonuses", "Child connection supports bond", "Assignments can change at any time"],
  },
  {
    icon: Flag,
    eyebrow: "Choices on the road",
    title: "No route wins at everything",
    description: "Events, objectives, routes, and night rituals trade survival efficiency against family warmth. Choose what this journey values.",
    details: ["Objective rewards support short sessions", "Road choices remain pending if deferred", "Your decisions become family memories"],
  },
] as const

export function OnboardingDialog({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && step < steps.length - 1) setStep((value) => value + 1)
      if (event.key === "ArrowLeft" && step > 0) setStep((value) => value - 1)
      if (event.key === "Escape") onComplete()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onComplete, step])

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-[#0e120f]/90 p-4 backdrop-blur-sm" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" className="w-full max-w-2xl border border-white/15 bg-[#202521] text-[#ebe5d7] shadow-2xl">
        <div className="grid min-h-[30rem] sm:grid-cols-[0.38fr_0.62fr]">
          <div className="flex min-h-40 flex-col justify-between border-b border-white/10 bg-[#171d18] p-6 sm:border-r sm:border-b-0">
            <div className="grid size-12 place-items-center border border-[#d3a849]/50 bg-[#d3a849]/10"><Image src="/image/logo.png" alt="Convoy logo" width={32} height={32} className="object-contain" /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d3a849]">Convoy field guide</p><div className="mt-3 flex gap-1.5">{steps.map((item, index) => <span key={item.title} className={`h-1 flex-1 ${index <= step ? "bg-[#d3a849]" : "bg-white/15"}`} />)}</div><p className="mt-2 font-mono text-xs text-[#89958b]">{step + 1} / {steps.length}</p></div>
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d3a849]">{current.eyebrow}</p>
            <h2 id="onboarding-title" className="mt-2 text-2xl font-semibold">{current.title}</h2>
            <p id="onboarding-description" className="mt-3 text-sm leading-6 text-[#adb6ac]">{current.description}</p>
            <div className="mt-6 grid gap-2">{current.details.map((detail) => <div key={detail} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs"><span className="size-1.5 shrink-0 bg-[#d3a849]" />{detail}</div>)}</div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-8">
              <Button variant="ghost" size="sm" className="rounded-sm text-[#c8d0c8] hover:bg-white/10 hover:text-white" onClick={onComplete}>Skip guide</Button>
              <div className="flex gap-2">{step > 0 && <Button variant="outline" size="sm" className="rounded-sm border-white/25 bg-transparent text-[#ebe5d7] hover:border-[#d3a849]/70 hover:bg-[#d3a849]/15 hover:text-white" onClick={() => setStep((value) => value - 1)}><ArrowLeft /> Back</Button>}{step < steps.length - 1 ? <Button size="sm" className="rounded-sm" onClick={() => setStep((value) => value + 1)}>Next <ArrowRight /></Button> : <Button size="sm" className="rounded-sm" onClick={onComplete}>Start journey <ArrowRight /></Button>}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
