"use client";

import { useState, useEffect } from "react";
import {
  getHorariosBySeccionAction,
  deleteHorarioAction,
} from "@/actions/schedules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconLoader2,
  IconCalendarStats,
  IconClock,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { ScheduleGrid } from "./schedule-grid";
import { AddScheduleDialog } from "./add-schedule-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleManagerProps {
  secciones: any[];
  allCourses: any[];
}

export function ScheduleManager({
  secciones,
  allCourses,
}: ScheduleManagerProps) {
  const [selectedSeccion, setSelectedSeccion] = useState<string>("");
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Cargar horarios cuando cambia la sección
  useEffect(() => {
    if (selectedSeccion) {
      fetchHorarios();
    } else {
      setHorarios([]);
    }
  }, [selectedSeccion]);

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const res = await getHorariosBySeccionAction(selectedSeccion);
      if (res.data) setHorarios(res.data);
      else toast.error(res.error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar cursos de la sección seleccionada
  const sectionCourses = allCourses.filter(
    (c) => c.nivelAcademicoId === selectedSeccion,
  );

  return (
    <div className="space-y-6">
      <Card className="px-4 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row md:items-end justify-between">
        <div className="max-w-xs space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground/50 uppercase ml-1">
            Seleccionar Grado y Sección
          </label>
          <Select value={selectedSeccion} onValueChange={setSelectedSeccion}>
            <SelectTrigger className="rounded-full text-sm ring-offset-background transition-all hover:bg-white/10">
              <SelectValue placeholder="Seleccione una sección..." />
            </SelectTrigger>
            <SelectContent>
              {secciones.map((s) => (
                <SelectItem
                  key={s.id}
                  value={s.id}
                  className="focus:bg-white/5 focus:text-blue-400"
                >
                  {s.grado.nombre} - {s.seccion} ({s.nivel.nombre})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          {selectedSeccion && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-full"
            >
              <IconPlus className="size-4 mr-2" />
              Asignar Hora
            </Button>
          )}
        </div>
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
              const res = await deleteHorarioAction(id);
              if (res.success) {
                toast.success(res.success);
                fetchHorarios();
              }
            }}
          />
        )
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/40 rounded-xl bg-muted/5 text-muted-foreground/60 p-8 text-center">
          <IconClock className="size-12 mb-4 opacity-20" />
          <h3 className="text-lg font-bold mb-1 text-foreground/40">
            Horario no disponible
          </h3>
          <p className="text-sm max-w-xs">
            Seleccione una sección arriba para empezar a gestionar las horas de
            clase.
          </p>
        </div>
      )}

      <AddScheduleDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        courses={sectionCourses}
        existingSchedules={horarios}
        onSuccess={fetchHorarios}
      />
    </div>
  );
}
