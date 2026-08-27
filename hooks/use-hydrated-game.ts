"use client"

import { useEffect, useState } from "react"

import {
  applyOfflineProgress,
  clearSavedState,
  loadState,
  saveState,
  STORAGE_KEY,
} from "@/lib/game/persistence"
import { useGameStore } from "@/lib/game/store"

const SAVE_INTERVAL_MS = 5_000
const ONBOARDING_KEY = "convoy-onboarding-complete"

export function useHydratedGame() {
  const isHydrated = useGameStore((state) => state.isHydrated)
  const hydrate = useGameStore((state) => state.hydrate)
  const reset = useGameStore((state) => state.reset)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSavedJourney = Boolean(window.localStorage.getItem(STORAGE_KEY))
    const loaded = loadState(window.localStorage)
    const result = applyOfflineProgress(loaded, Date.now())
    hydrate(result.state, result.summary)
    saveState(window.localStorage, result.state)
    if (!hasSavedJourney && window.localStorage.getItem(ONBOARDING_KEY) !== "true") {
      const onboardingTimer = window.setTimeout(() => setShowOnboarding(true), 0)
      return () => window.clearTimeout(onboardingTimer)
    }
  }, [hydrate])

  useEffect(() => {
    if (!isHydrated) return

    const save = () => saveState(window.localStorage, useGameStore.getState())
    const interval = window.setInterval(save, SAVE_INTERVAL_MS)
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") save()
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", handleVisibility)
      save()
    }
  }, [isHydrated])

  const resetGame = () => {
    clearSavedState(window.localStorage)
    reset()
    saveState(window.localStorage, useGameStore.getState())
  }

  const completeOnboarding = () => {
    window.localStorage.setItem(ONBOARDING_KEY, "true")
    setShowOnboarding(false)
  }

  return { isHydrated, resetGame, showOnboarding, completeOnboarding }
}
