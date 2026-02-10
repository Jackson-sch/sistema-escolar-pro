"use client"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { NuqsProvider } from "@/components/providers/nuqs-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
