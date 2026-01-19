import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Evaluaciones | EduPeru Pro",
  description: "Gestión de evaluaciones y calificaciones",
}

export default function EvaluacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
