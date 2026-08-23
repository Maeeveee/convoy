"use client"

import {
  Gauge,
} from "lucide-react"

import { useGameLoop } from "@/hooks/use-game-loop"
import { useHydratedGame } from "@/hooks/use-hydrated-game"
import { DAY_DURATION_SECONDS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import { ConvoyScene } from "../scene"
import { GeneratorPanel } from "../panels"
import { LegacyPanel, ReportCard } from "../progression"
import { DecisionDialogs, OnboardingDialog } from "../dialogs"
import { OfflineSummaryDialog } from "../feedback"
import { GameHeader, GameWarningBar, ResourceBar } from "."

export function GameShell() {
  const { isHydrated, showOnboarding, completeOnboarding } = useHydratedGame()
  const resources = useGameStore((state) => state.resources)
  const capacities = useGameStore((state) => state.capacities)
  const bond = useGameStore((state) => state.bond)
  const distance = useGameStore((state) => state.distance)
  const day = useGameStore((state) => state.day)
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds)

  useGameLoop(isHydrated && !showOnboarding)

  if (!isHydrated) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#171a18] text-[#ebe5d7]">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.16em]">
          <Gauge className="size-5 animate-pulse text-[#d3a849]" />
          Restoring the convoy
        </div>
      </main>
    )
  }

  const dayProgress = (elapsedSeconds % DAY_DURATION_SECONDS) / DAY_DURATION_SECONDS
  const daySecondsRemaining = DAY_DURATION_SECONDS - (elapsedSeconds % DAY_DURATION_SECONDS)
  const warnings = [
    resources.fuel <= 20
      ? {
          label: resources.fuel <= 0 ? "Fuel depleted" : "Fuel reserve low",
          detail:
            resources.fuel <= 0
              ? "Travel is reduced to emergency speed."
              : `${Math.floor(resources.fuel / 0.03 / 60)} minutes remain at current consumption.`,
        }
      : null,
    bond <= 35
      ? {
          label: "Family bond strained",
          detail: "Choose family-focused events or change assignments before the next night ritual.",
        }
      : null,
  ].filter((warning): warning is { label: string; detail: string } => warning !== null)

  return (
    <main className="min-h-svh bg-[#d8d2c4] text-[#20231f] dark:bg-[#171a18] dark:text-[#ebe5d7]">
      <GameHeader day={day} secondsToNight={daySecondsRemaining} />
      <ResourceBar resources={resources} capacities={capacities} bond={bond} distance={distance} />
      <GameWarningBar warnings={warnings} />

      <div className="mx-auto max-w-[1600px]">
        <ConvoyScene dayProgress={dayProgress} />

        <div className="grid border-t border-black/15 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.38fr)] dark:border-white/10">
          <section className="min-w-0 border-b border-black/15 bg-[#e5dfd2] p-4 sm:p-6 lg:border-r lg:border-b-0 dark:border-white/10 dark:bg-[#1b201c]">
            <GeneratorPanel />
          </section>
          <aside className="divide-y divide-black/15 bg-[#d2ccbe] dark:divide-white/10 dark:bg-[#161a17]">
            <LegacyPanel />
            <ReportCard />
          </aside>
        </div>
      </div>

      <OfflineSummaryDialog />
      <DecisionDialogs />
      {showOnboarding && <OnboardingDialog onComplete={completeOnboarding} />}

    </main>
  )
}
