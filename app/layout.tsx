import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/lib/theme-context"
import { APP_NAME, APP_TAGLINE, LEGACY_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/constants"
import "./globals.css"

// Instantiate fonts to ensure they are loaded by Next.js.
const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: `${APP_NAME} - Multi-Location Calendar`,
  description: APP_TAGLINE,
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/img/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/img/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/img/VacationPlanner_SquareLogo.svg",
        type: "image/svg+xml",
      },
    ]
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Apply the theme class early to avoid flash during hydration.
                  var theme = localStorage.getItem('${STORAGE_KEYS.theme}') || localStorage.getItem('${LEGACY_STORAGE_KEYS.theme}');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
