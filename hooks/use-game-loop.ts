"use client"

import { useEffect } from "react"

import { useGameStore } from "@/lib/game/store"

export function useGameLoop(enabled: boolean) {
  const tick = useGameStore((state) => state.tick)

  useEffect(() => {
    if (!enabled) return

    let previous = performance.now()
    const interval = window.setInterval(() => {
      const current = performance.now()
      const elapsedSeconds = Math.min((current - previous) / 1_000, 10)
      previous = current
      tick(elapsedSeconds)
    }, 1_000)

    return () => window.clearInterval(interval)
  }, [enabled, tick])
}
