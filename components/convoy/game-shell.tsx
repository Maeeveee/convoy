"use client"

import { useState } from "react"
import {
  AlertTriangle,
  CarFront,
  Gauge,
  Heart,
  MapPin,
  PackageOpen,
  RotateCcw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useGameLoop } from "@/hooks/use-game-loop"
import { useHydratedGame } from "@/hooks/use-hydrated-game"
import { DAY_DURATION_SECONDS } from "@/lib/game/constants"
import { useGameStore } from "@/lib/game/store"
import { ConvoyScene } from "./convoy-scene"
import { GeneratorPanel } from "./generator-panel"
import { OfflineSummaryDialog } from "./offline-summary"
import { TaskPanel } from "./task-panel"
import { UpgradePanel } from "./upgrade-panel"
import { FuelPanel } from "./fuel-panel"
import { DecisionDialogs } from "./decision-dialogs"
import { ReportCard } from "./report-card"
import { AudioController } from "./audio-controller"
import { InteriorPanel } from "./interior-panel"
import { LegacyPanel } from "./legacy-panel"
import { JourneyObjective } from "./journey-objective"

const number = new Intl.NumberFormat("en", { maximumFractionDigits: 1 })

export function GameShell() {
  const { isHydrated, resetGame } = useHydratedGame()
  const [confirmReset, setConfirmReset] = useState(false)
  const resources = useGameStore((state) => state.resources)
  const capacities = useGameStore((state) => state.capacities)
  const bond = useGameStore((state) => state.bond)
  const distance = useGameStore((state) => state.distance)
  const day = useGameStore((state) => state.day)
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds)
  const exterior = useGameStore((state) => state.exterior)

  useGameLoop(isHydrated)

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
      <header className="border-b border-black/15 bg-[#202821] text-[#f0ebde] dark:border-white/10 dark:bg-[#111512]">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center border border-[#d3a849]/50 bg-[#d3a849]/10">
              <CarFront className="size-5 text-[#e2bd66]" />
            </div>
            <div>
              <h1 className="text-base font-semibold uppercase tracking-[0.18em]">Convoy</h1>
              <p className="text-[11px] text-[#aeb8ad]">Journey log · Day {day} · {formatClock(daySecondsRemaining)} to night</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AudioController />
            <span className="hidden text-xs text-[#aeb8ad] sm:inline">
              {exterior.id === "openPickup"
                ? "Open pickup"
                : exterior.id === "emergencyTarp"
                  ? "Emergency tarp"
                  : "Enclosed van"}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white"
              onClick={() => setConfirmReset(true)}
              aria-label="Reset journey"
              title="Reset journey"
            >
              <RotateCcw />
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-black/15 bg-[#eee9de] dark:border-white/10 dark:bg-[#202521]">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5 dark:divide-white/10">
          <ResourceStat
            icon={<Gauge />}
            label="Fuel"
            value={resources.fuel}
            max={capacities.fuel}
            tone="amber"
          />
          <ResourceStat
            icon={<PackageOpen />}
            label="Trade credits"
            value={resources.credits}
            tone="steel"
          />
          <ResourceStat icon={<Heart />} label="Family bond" value={bond} max={100} tone="red" />
          <ResourceStat
            icon={<MapPin />}
            label="Distance"
            value={distance}
            suffix=" km"
            tone="blue"
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </section>

      {warnings.length > 0 && (
        <section
          aria-live="polite"
          className="border-b border-[#9e4f37]/35 bg-[#c96a46]/12 text-[#6e2d1c] dark:bg-[#9e4f37]/15 dark:text-[#f0a287]"
        >
          <div className="mx-auto flex max-w-[1600px] flex-wrap gap-x-6 gap-y-2 px-4 py-2.5 sm:px-6">
            {warnings.map((warning) => (
              <div key={warning.label} className="flex min-w-0 items-center gap-2 text-xs">
                <AlertTriangle className="size-4 shrink-0" />
                <strong>{warning.label}</strong>
                <span className="text-current/70">{warning.detail}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-[1600px]">
        <ConvoyScene dayProgress={dayProgress} />

        <div className="grid border-t border-black/15 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.38fr)] dark:border-white/10">
          <section className="min-w-0 border-b border-black/15 bg-[#e5dfd2] p-4 sm:p-6 lg:border-r lg:border-b-0 dark:border-white/10 dark:bg-[#1b201c]">
            <GeneratorPanel />
          </section>
          <aside className="divide-y divide-black/15 bg-[#d2ccbe] dark:divide-white/10 dark:bg-[#161a17]">
            <FuelPanel />
            <TaskPanel />
            <UpgradePanel />
            <InteriorPanel />
            <LegacyPanel />
            <JourneyObjective />
            <ReportCard />
          </aside>
        </div>
      </div>

      <OfflineSummaryDialog />
      <DecisionDialogs />

      {confirmReset && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="w-full max-w-sm border border-white/15 bg-[#202521] p-5 text-[#ebe5d7] shadow-2xl"
          >
            <h2 id="reset-title" className="text-lg font-semibold">Reset this journey?</h2>
            <p className="mt-2 text-sm leading-6 text-[#adb6ac]">
              All current resources, generators, distance, and vehicle upgrades will be erased.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" className="rounded-sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="rounded-sm"
                onClick={() => {
                  resetGame()
                  setConfirmReset(false)
                }}
              >
                Reset journey
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.floor(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}

function ResourceStat({
  icon,
  label,
  value,
  max,
  suffix = "",
  tone,
  className = "",
}: {
  icon: React.ReactNode
  label: string
  value: number
  max?: number
  suffix?: string
  tone: "amber" | "green" | "steel" | "red" | "blue"
  className?: string
}) {
  const width = max ? Math.min((value / max) * 100, 100) : 100
  return (
    <div className={`relative min-w-0 px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55 dark:text-white/55">
        <span className={`resource-tone-${tone} [&_svg]:size-3.5`}>{icon}</span>
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums">
        {number.format(value)}{suffix}
      </div>
      {max && (
        <div className="absolute inset-x-4 bottom-0 h-0.5 bg-black/10 dark:bg-white/10">
          <div className={`h-full resource-bg-${tone}`} style={{ width: `${width}%` }} />
        </div>
      )}
    </div>
  )
}
