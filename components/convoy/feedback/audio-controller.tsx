"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { useGameStore } from "@/lib/game/store"

const ROAD_SOUND = "/sound/road-sound.mp3"
const MUSIC_TRACKS = ["/sound/music-1.mp3", "/sound/music-2.mp3"]

export function AudioController() {
  const day = useGameStore((state) => state.day)
  const pendingEvent = useGameStore((state) => state.pendingEvent)
  const pendingNightDay = useGameStore((state) => state.pendingNightDay)
  const fuel = useGameStore((state) => state.resources.fuel)
  const [enabled, setEnabled] = useState(false)
  const roadRef = useRef<HTMLAudioElement | null>(null)
  const musicRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const road = roadRef.current
    const music = musicRef.current
    if (!road || !music) return

    if (!enabled) {
      road.pause()
      music.pause()
      road.currentTime = 0
      music.currentTime = 0
      return
    }

    road.volume = 0.22
    music.volume = 0.16
    void road.play().catch(() => setEnabled(false))
    void music.play().catch(() => setEnabled(false))
  }, [enabled])

  useEffect(() => {
    if (!enabled || !musicRef.current) return
    const music = musicRef.current
    music.src = MUSIC_TRACKS[(day - 1) % MUSIC_TRACKS.length]
    music.load()
    void music.play().catch(() => undefined)
  }, [day, enabled])

  useEffect(() => {
    if (!enabled) return
    const music = musicRef.current
    if (!music) return
    music.volume = pendingEvent || pendingNightDay ? 0.08 : 0.16
  }, [enabled, pendingEvent, pendingNightDay])

  useEffect(() => {
    if (!enabled || !roadRef.current) return
    roadRef.current.volume = fuel <= 0 ? 0.06 : fuel <= 20 ? 0.14 : 0.22
  }, [enabled, fuel])

  return (
    <>
      <audio ref={roadRef} src={ROAD_SOUND} loop preload="metadata" />
      <audio ref={musicRef} src={MUSIC_TRACKS[0]} loop preload="metadata" />
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white"
        onClick={() => setEnabled((current) => !current)}
        aria-label={enabled ? "Mute sound" : "Enable sound"}
        title={enabled ? "Mute sound" : "Enable sound"}
      >
        {enabled ? <Volume2 /> : <VolumeX />}
      </Button>
    </>
  )
}
