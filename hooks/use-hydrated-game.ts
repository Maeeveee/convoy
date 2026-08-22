"use client"

import { useEffect } from "react"

import {
  applyOfflineProgress,
  clearSavedState,
  loadState,
  saveState,
} from "@/lib/game/persistence"
import { useGameStore } from "@/lib/game/store"

const SAVE_INTERVAL_MS = 5_000

export function useHydratedGame() {
  const isHydrated = useGameStore((state) => state.isHydrated)
  const hydrate = useGameStore((state) => state.hydrate)
  const reset = useGameStore((state) => state.reset)

  useEffect(() => {
    const loaded = loadState(window.localStorage)
    const result = applyOfflineProgress(loaded, Date.now())
    hydrate(result.state, result.summary)
    saveState(window.localStorage, result.state)
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

  return { isHydrated, resetGame }
}
