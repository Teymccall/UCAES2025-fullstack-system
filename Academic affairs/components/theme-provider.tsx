'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  
  // useEffect only runs on the client, so we can safely show the UI
  // only after we detect that we're on the client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // This check avoids rendering anything that depends on the theme during SSR,
  // thus preventing a hydration mismatch
  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shifts
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
