"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { ThemeSwitcher } from "@/components/kibo-ui/theme-switcher"

type ThemeValue = "light" | "dark" | "system"

export function ThemeControl({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div aria-hidden className="h-8 w-[5.5rem] rounded-full bg-muted/60 ring-1 ring-border" />
  }

  const value: ThemeValue =
    theme === "light" || theme === "dark" || theme === "system" ? theme : "system"

  return (
    <ThemeSwitcher
      value={value}
      defaultValue="system"
      onChange={(next) => setTheme(next)}
      className={className}
    />
  )
}
