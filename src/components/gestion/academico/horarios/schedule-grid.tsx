"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconTrash, IconClock } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const DIAS = [
  { id: 1, label: "LUNES" },
  { id: 2, label: "MARTES" },
  { id: 3, label: "MIÉRCOLES" },
  { id: 4, label: "JUEVES" },
  { id: 5, label: "VIERNES" }
]

// Horas base para el grid (ejemplo: 8:00 a 16:00)
const HORAS = Array.from({ length: 9 }, (_, i) => `${i + 8}:00`)

interface ScheduleGridProps {
  horarios: any[]
  onDelete: (id: string) => void
}

export function ScheduleGrid({ horarios, onDelete }: ScheduleGridProps) {
  // Función para obtener cursos en un slot específico
  const getCourseInSlot = (dia: number, hora: string) => {
    return horarios.filter(h => h.diaSemana === dia && h.horaInicio === hora)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border/40 shadow-xl bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border/40">
            <th className="p-4 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 border-r border-border/40 w-24">
              HORA
            </th>
            {DIAS.map(dia => (
              <th key={dia.id} className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-primary border-r border-border/40 min-w-40">
                {dia.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {HORAS.map((hora, timeIdx) => (
            <tr key={hora} className={cn("border-b border-border/10", timeIdx % 2 === 0 ? "bg-transparent" : "bg-muted/5")}>
              <td className="p-4 text-center font-bold text-sm text-foreground/70 border-r border-border/40 whitespace-nowrap">
                <div className="flex flex-col items-center">
                  <span className="text-violet-500">{hora}</span>
                  <span className="text-[10px] opacity-40">{(parseInt(hora) + 1)}:00</span>
                </div>
              </td>
              {DIAS.map(dia => {
                const slots = getCourseInSlot(dia.id, hora)
                return (
                  <td key={dia.id} className="p-2 border-r border-border/40 align-top h-32 relative group">
                    <div className="flex flex-col gap-2 h-full">
                      {slots.map(slot => (
                        <Card
                          key={slot.id}
                          className="p-3 border-none shadow-lg bg-linear-to-br from-violet-600/10 to-blue-600/10 relative overflow-hidden group/card"
                          style={{
                            borderLeft: `4px solid ${slot.curso.areaCurricular.color || '#8b5cf6'}`
                          }}
                        >
                          <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 text-red-500 hover:bg-red-500/10"
                              onClick={() => onDelete(slot.id)}
                            >
                              <IconTrash className="size-3.5" />
                            </Button>
                          </div>
                          <p className="text-[11px] font-extrabold leading-tight text-foreground/90 uppercase mb-1">
                            {slot.curso.nombre}
                          </p>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                              {slot.curso.profesor.name} {slot.curso.profesor.apellidoPaterno}
                            </span>
                            {slot.aula && (
                              <Badge variant="outline" className="w-fit text-[9px] h-4 px-1 border-border/40 bg-background/50">
                                AULA: {slot.aula}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
