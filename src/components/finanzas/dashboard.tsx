"use client"

import { IconCash, IconClock, IconAlertTriangle } from "@tabler/icons-react"
import StatCard from "@/components/common/stat-card"
import { formatCurrency } from "@/lib/formats"

interface FinanzasDashboardProps {
  estadisticas?: {
    pendiente: number
    cobrado: number
    deudasVencidas: number
  }
}

export function FinanzasDashboard({ estadisticas }: FinanzasDashboardProps) {
  const stats = [{
    title: "Total Cobrado",
    value: formatCurrency(estadisticas?.cobrado || 0),
    icon: IconCash,
    iconColor: "text-green-600",
    description: "Total de dinero cobrado en el año actual"
  }, {
    title: "Por Cobrar",
    value: formatCurrency(estadisticas?.pendiente || 0),
    icon: IconClock,
    iconColor: "text-amber-600",
    description: "Total de dinero pendiente por cobrar por conceptos"
  }, {
    title: "Deudas Vencidas",
    value: formatCurrency(estadisticas?.deudasVencidas || 0),
    icon: IconAlertTriangle,
    iconColor: "text-red-600",
    description: "Total de dinero pendiente por cobrar por deudas vencidas"
  }]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  )
}
