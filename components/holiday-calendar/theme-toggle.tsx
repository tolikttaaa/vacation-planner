"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/lib/theme-context"

interface ThemeToggleProps {
  orientation?: "horizontal" | "vertical"
}

export function ThemeToggle({ orientation = "horizontal" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  // Simple three-state theme selector (light/dark/system).
  return (
    <div
      className={`flex ${
        orientation === "vertical" ? "flex-col" : "flex-row"
      } items-center gap-1 p-1 bg-secondary rounded-lg`}
    >
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
        title="Light mode"
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
        title="Dark mode"
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
        }`}
        title="System preference"
        aria-label="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}
