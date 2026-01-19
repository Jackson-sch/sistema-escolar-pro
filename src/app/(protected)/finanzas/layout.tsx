import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Finanzas | EduPeru Pro",
  description: "Gestión financiera y control de pagos",
}

export default function FinanzasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
