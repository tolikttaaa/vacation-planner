"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
})

const THEME_STORAGE_KEY = "holiday-planner-theme"

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setThemeState(stored)
    }
    setMounted(true)
  }, [])

  // Resolve system theme and apply class
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateResolvedTheme = () => {
      let resolved: "light" | "dark"
      if (theme === "system") {
        resolved = mediaQuery.matches ? "dark" : "light"
      } else {
        resolved = theme
      }
      setResolvedTheme(resolved)

      // Apply dark class to html element
      if (resolved === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    updateResolvedTheme()
    mediaQuery.addEventListener("change", updateResolvedTheme)

    return () => mediaQuery.removeEventListener("change", updateResolvedTheme)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme: mounted ? theme : "system", resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
