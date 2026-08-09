"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getHorariosBySeccionAction, deleteHorarioAction, upsertHorarioAction } from "@/actions/schedules";
import { BLOQUES_HORARIO } from "@/lib/constants";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconClock, IconPlus, IconTrash, IconExternalLink, IconLoader2 } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DIAS_SEMANA = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
];

interface SectionScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seccion: any;
  grado: any;
  nivel: any;
}

export function SectionScheduleDialog({
  open,
  onOpenChange,
  seccion,
  grado,
  nivel,
}: SectionScheduleDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [horarios, setHorarios] = useState<any[]>([]);

  // Add block state
  const [selectedDia, setSelectedDia] = useState<string>("1");
  const [selectedBloque, setSelectedBloque] = useState<string>("08:00 - 08:45");
  const [selectedCursoId, setSelectedCursoId] = useState<string>("");
  const [savingBlock, setSavingBlock] = useState(false);

  const cursos = seccion?.cursos || [];

  const loadHorarios = async () => {
    if (!seccion?.id) return;
    setLoading(true);
    try {
      const res = await getHorariosBySeccionAction(seccion.id);
      if (res.data) {
        setHorarios(res.data);
      }
    } catch {
      toast.error("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (open && seccion?.id) {
      setLoading(true);
      getHorariosBySeccionAction(seccion.id)
        .then((res) => {
          if (ignore) return;
          if (res.data) setHorarios(res.data);
        })
        .catch(() => {
          if (!ignore) toast.error("Error al cargar horarios");
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [open, seccion?.id]);

  const handleAddHorario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCursoId || !selectedDia || !selectedBloque) {
      toast.error("Selecciona curso, día y bloque de horario");
      return;
    }

    const [horaInicio, horaFin] = selectedBloque.split(" - ");
    setSavingBlock(true);
    try {
      const res = await upsertHorarioAction({
        cursoId: selectedCursoId,
        diaSemana: parseInt(selectedDia),
        horaInicio,
        horaFin,
      });

      if (res.success) {
        toast.success("Bloque de horario asignado");
        setSelectedCursoId("");
        loadHorarios();
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al asignar horario");
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteHorario = async (horarioId: string) => {
    try {
      const res = await deleteHorarioAction(horarioId);
      if (res.success) {
        toast.success("Bloque eliminado");
        loadHorarios();
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al eliminar horario");
    }
  };

  const getHorarioForSlot = (diaNum: number, horaInicioStr: string) => {
    return horarios.find(
      (h) => h.diaSemana === diaNum && h.horaInicio === horaInicioStr,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 border-none shadow-lg bg-card overflow-hidden z-[60]">
        <DialogHeader className="p-6 pb-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <IconClock className="size-5 text-indigo-600" />
              Horario Semanal — {grado?.nombre} Sección &quot;{seccion?.seccion}&quot;
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {nivel?.nombre} • Año Lectivo {seccion?.anioAcademico} • {horarios.length} bloques asignados
            </DialogDescription>
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-semibold gap-1.5 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 shrink-0"
          >
            <a href={`/gestion/academico/horarios?seccion=${seccion?.id}`} target="_blank" rel="noreferrer">
              Matriz Drag & Drop Completa
              <IconExternalLink size={13} />
            </a>
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Formulario rápido para añadir bloque */}
          <form onSubmit={handleAddHorario} className="p-4 rounded-2xl border border-border/40 bg-muted/20 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Asignación Rápida de Bloque Horario
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Día Semanal</Label>
                <Select value={selectedDia} onValueChange={setSelectedDia}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl z-[70]">
                    {DIAS_SEMANA.slice(0, 5).map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()} className="text-xs">
                        {d.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Bloque Horario</Label>
                <Select value={selectedBloque} onValueChange={setSelectedBloque}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Horario" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-48 z-[70]">
                    {BLOQUES_HORARIO.map((b) => (
                      <SelectItem key={`${b.inicio}-${b.fin}`} value={`${b.inicio} - ${b.fin}`} className="text-xs">
                        {b.inicio} - {b.fin} {b.tipo === "recreo" ? "(Recreo)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">Curso a Asignar</Label>
                <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
                  <SelectTrigger className="h-8 text-xs rounded-lg">
                    <SelectValue placeholder="Curso..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-48 z-[70]">
                    {cursos.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs font-semibold">
                        {c.nombre} ({c.profesor ? `${c.profesor.name} ${c.profesor.apellidoPaterno || ""}` : "Sin Docente"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={savingBlock || cursos.length === 0}
                className="h-8 rounded-lg text-xs font-bold gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {savingBlock ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconPlus size={14} />}
                Asignar Hora
              </Button>
            </div>
          </form>

          {/* Grilla Semanal */}
          {loading ? (
            <div className="py-12 text-center">
              <IconLoader2 className="size-8 mx-auto animate-spin text-primary/60 mb-2" />
              <p className="text-xs text-muted-foreground font-medium">Cargando horario del salón...</p>
            </div>
          ) : (
            <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-6 bg-muted/40 text-center font-bold text-xs border-b border-border/40 py-2.5">
                <div className="text-muted-foreground/60 uppercase text-[10px]">Hora</div>
                <div>Lunes</div>
                <div>Martes</div>
                <div>Miércoles</div>
                <div>Jueves</div>
                <div>Viernes</div>
              </div>

              <div className="divide-y divide-border/40 text-xs">
                {BLOQUES_HORARIO.map((bloque) => (
                  <div key={`${bloque.inicio}-${bloque.fin}`} className="grid grid-cols-6 items-stretch min-h-[50px]">
                    <div className="p-2 bg-muted/10 border-r border-border/30 flex flex-col justify-center items-center font-mono text-[10px] text-muted-foreground font-semibold">
                      <span>{bloque.inicio}</span>
                      <span>{bloque.fin}</span>
                    </div>

                    {bloque.tipo === "recreo" ? (
                      <div className="col-span-5 bg-amber-500/5 text-amber-600 font-bold text-center flex items-center justify-center text-xs tracking-wider uppercase">
                        ☕ Recreo / Descanso
                      </div>
                    ) : (
                      [1, 2, 3, 4, 5].map((diaNum) => {
                        const h = getHorarioForSlot(diaNum, bloque.inicio);
                        return (
                          <div
                            key={diaNum}
                            className="p-1.5 border-r border-border/30 flex flex-col justify-between group transition-colors hover:bg-muted/30"
                          >
                            {h ? (
                              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-0.5 relative flex flex-col justify-between h-full">
                                <div>
                                  <p className="font-bold text-[11px] text-indigo-900 dark:text-indigo-200 leading-tight uppercase truncate">
                                    {h.curso?.nombre}
                                  </p>
                                  <p className="text-[9px] text-indigo-700/70 dark:text-indigo-300/70 truncate">
                                    {h.curso?.profesor
                                      ? `${h.curso.profesor.name} ${h.curso.profesor.apellidoPaterno || ""}`
                                      : "Sin Docente"}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteHorario(h.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 text-rose-500 hover:text-rose-700"
                                  title="Quitar hora"
                                >
                                  <IconTrash size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="h-full rounded-lg border border-dashed border-border/30 flex items-center justify-center text-[10px] text-muted-foreground/30 italic">
                                Libre
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
