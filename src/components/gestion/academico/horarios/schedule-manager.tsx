"use client"

import { useState, useEffect } from "react"
import {
  getHorariosBySeccionAction,
  deleteHorarioAction
} from "@/actions/schedules"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconPlus, IconLoader2, IconCalendarStats, IconClock } from "@tabler/icons-react"
import { toast } from "sonner"
import { ScheduleGrid } from "./schedule-grid"
import { AddScheduleDialog } from "./add-schedule-dialog"

interface ScheduleManagerProps {
  secciones: any[]
  allCourses: any[]
}

export function ScheduleManager({ secciones, allCourses }: ScheduleManagerProps) {
  const [selectedSeccion, setSelectedSeccion] = useState<string>("")
  const [horarios, setHorarios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Cargar horarios cuando cambia la sección
  useEffect(() => {
    if (selectedSeccion) {
      fetchHorarios()
    } else {
      setHorarios([])
    }
  }, [selectedSeccion])

  const fetchHorarios = async () => {
    setLoading(true)
    try {
      const res = await getHorariosBySeccionAction(selectedSeccion)
      if (res.data) setHorarios(res.data)
      else toast.error(res.error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar cursos de la sección seleccionada
  const sectionCourses = allCourses.filter(c => c.nivelAcademicoId === selectedSeccion)

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-background/95 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <IconCalendarStats className="size-5 text-violet-500" /> Selección de Sección
            </CardTitle>
          </div>
          {selectedSeccion && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all active:scale-95"
            >
              <IconPlus className="size-4 mr-2" /> Asignar Hora
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <div className="max-w-md">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 block">
              Seleccionar Grado y Sección
            </label>
            <div className="flex gap-4">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedSeccion}
                onChange={(e) => setSelectedSeccion(e.target.value)}
              >
                <option value="">Seleccione una sección...</option>
                {secciones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grado.nombre} - {s.seccion} ({s.nivel.nombre})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSeccion ? (
        loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-muted-foreground">
            <IconLoader2 className="size-8 animate-spin text-violet-500" />
            <p className="font-semibold text-sm">Cargando horario escolar...</p>
          </div>
        ) : (
          <ScheduleGrid
            horarios={horarios}
            onDelete={async (id: string) => {
              const res = await deleteHorarioAction(id)
              if (res.success) {
                toast.success(res.success)
                fetchHorarios()
              }
            }}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/40 rounded-xl bg-muted/5 text-muted-foreground/60 p-8 text-center">
          <IconClock className="size-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold mb-1 text-foreground/40">Horario no disponible</h3>
          <p className="text-sm max-w-xs">Seleccione una sección arriba para empezar a gestionar las horas de clase.</p>
        </div>
      )}

      <AddScheduleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={sectionCourses}
        onSuccess={fetchHorarios}
      />
    </div>
  )
}
