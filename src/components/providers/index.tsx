"use client"

import { ThemeProvider } from "../theme-provider"
import { AuthProvider } from "./auth-provider"
import { NuqsProvider } from "./nuqs-provider"
import { QueryProvider } from "./query-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <QueryProvider>
          <NuqsProvider>
            {children}
            <Toaster position="top-center" richColors />
          </NuqsProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
