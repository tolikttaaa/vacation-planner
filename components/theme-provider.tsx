'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Thin wrapper around next-themes provider for app-level usage.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
