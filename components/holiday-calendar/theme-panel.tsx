"use client"

import { ThemeToggle } from "./theme-toggle"

// Floating theme picker pinned to the bottom-left corner.
export function ThemePanel() {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-center gap-2 rounded-xl border border-border bg-card/90 p-2 shadow-lg backdrop-blur panel-neon">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Theme</span>
      <ThemeToggle orientation="vertical" />
    </div>
  )
}
