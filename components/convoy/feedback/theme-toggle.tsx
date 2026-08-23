"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const isDark = mounted && resolvedTheme === "dark"
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-sm text-[#aeb8ad] hover:bg-white/10 hover:text-white lg:size-[32px]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="size-4 lg:size-[16px]" /> : <Moon className="size-4 lg:size-[16px]" />}
    </Button>
  )
}
