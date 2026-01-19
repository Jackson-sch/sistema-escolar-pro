"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconCalendar,
  IconSchool,
  IconSearch,
  IconLoader2,
  IconDeviceFloppy,
  IconUsers,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsIsoDate,
} from "nuqs";
import {
  getAsistenciaAction,
  upsertAsistenciaAction,
} from "@/actions/attendance";
import { getSeccionesAction } from "@/actions/academic-structure";
import { AsistenciaTable } from "./asistencia-table";
import { AsistenciaResumen } from "./asistencia-resumen";

interface AsistenciaClientProps {
  initialSecciones: any[];
  aniosAcademicos: number[];
  defaultYear: number;
}

export function AsistenciaClient({
  initialSecciones,
  aniosAcademicos,
  defaultYear,
}: AsistenciaClientProps) {
  const [fecha, setFecha] = useQueryState(
    "fecha",
    parseAsIsoDate.withDefault(new Date()),
  );
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear),
  );
  const [secciones, setSecciones] = useState<any[]>(initialSecciones);
  const [seccionId, setSeccionId] = useQueryState(
    "seccion",
    parseAsString.withDefault(""),
  );
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [cursoId, setCursoId] = useState<string>("");

  const isFirstRender = useRef(true);

  // Recargar secciones cuando cambie el año
  useEffect(() => {
    const loadSecciones = async () => {
      setIsLoadingSecciones(true);
      const res = await getSeccionesAction({ anioAcademico: anio });
      if (res.data) {
        setSecciones(res.data);
        // Solo limpiar la sección si NO es el primer render (ej. el usuario cambió el año)
        if (!isFirstRender.current) {
          setSeccionId("");
          setAlumnos([]);
        }
      }
      setIsLoadingSecciones(false);
      isFirstRender.current = false;
    };
    loadSecciones();
  }, [anio]);

  const loadAsistencia = () => {
    if (!seccionId) return;
    startTransition(async () => {
      const res = await getAsistenciaAction(seccionId, fecha);
      if (res.data) {
        setCursoId(res.cursoId || "");
        // Transformar datos para la tabla
        const transformed = res.data.map((alumno: any) => {
          const a = alumno.asistencias[0];
          let estado = "presente";
          if (a) {
            if (a.tardanza) estado = "tarde";
            else if (a.justificada) estado = "justificado";
            else if (!a.presente) estado = "ausente";
          }

          return {
            id: alumno.id,
            name: alumno.name,
            apellidoPaterno: alumno.apellidoPaterno,
            apellidoMaterno: alumno.apellidoMaterno,
            image: alumno.image,
            estado,
            justificacion: a?.justificacion || "",
          };
        });
        setAlumnos(transformed);
      }
      if (res.error) toast.error(res.error);
    });
  };

  useEffect(() => {
    loadAsistencia();
  }, [seccionId, fecha]);

  const handleEstadoChange = (id: string, estado: string) => {
    setAlumnos((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a)));
  };

  const handleObservacionChange = (id: string, justificacion: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, justificacion } : a)),
    );
  };

  const onSave = async () => {
    if (!cursoId) {
      toast.error(
        "No hay cursos asignados a esta sección para registrar asistencia.",
      );
      return;
    }
    setIsSaving(true);
    const data = alumnos.map((a) => ({
      estudianteId: a.id,
      cursoId,
      fecha,
      presente: a.estado !== "ausente",
      tardanza: a.estado === "tarde",
      justificada: a.estado === "justificado",
      justificacion: a.justificacion,
    }));

    const res = await upsertAsistenciaAction(data);
    if (res.success) {
      toast.success(res.success);
    }
    if (res.error) toast.error(res.error);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
      <div className="bg-card/20 border border-border/40 rounded-2xl p-4 backdrop-blur-sm shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="space-y-2.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-muted-foreground ml-1">
              Periodo
            </label>
            <Select
              onValueChange={(v) => setAnio(Number(v))}
              value={anio.toString()}
              disabled={isLoadingSecciones}
            >
              <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aniosAcademicos.map((a) => (
                  <SelectItem key={a} value={a.toString()}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2.5 md:col-span-3">
            <label className="text-[11px] font-semibold text-muted-foreground ml-1">
              Fecha de Registro
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-medium bg-background/20 border-border/40 transition-all hover:bg-background/40",
                    !fecha && "text-muted-foreground",
                  )}
                >
                  <IconCalendar className="mr-2 h-4 w-4 text-primary" />
                  {fecha ? (
                    format(fecha, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(d) => d && setFecha(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2.5 md:col-span-5">
            <label className="text-[11px] font-semibold text-muted-foreground ml-1">
              Sección / Grado
            </label>
            <Select
              onValueChange={setSeccionId}
              value={seccionId}
              disabled={isLoadingSecciones}
            >
              <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full md:w-auto">
                <SelectValue
                  placeholder={
                    isLoadingSecciones ? "Cargando..." : "Seleccione sección"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {secciones.length > 0 ? (
                  secciones.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-[11px] font-medium text-muted-foreground">
                    Sin secciones para {anio}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={loadAsistencia}
            disabled={!seccionId || isPending}
            className="md:col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isPending ? (
              <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <IconSearch className="mr-2 h-4 w-4" />
            )}
            Consultar
          </Button>
        </div>
      </div>

      <Separator className="bg-border/40" />

      {seccionId ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 px-6 py-4 rounded-2xl border border-border/40">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <IconUsers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">
                  Registro de Asistencia
                </h2>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {secciones.find((s) => s.id === seccionId)?.nivel.nombre} -{" "}
                  {secciones.find((s) => s.id === seccionId)?.grado.nombre} "
                  {secciones.find((s) => s.id === seccionId)?.seccion}"
                </p>
              </div>
            </div>

            <Button
              onClick={onSave}
              disabled={isSaving || alumnos.length === 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSaving ? (
                <IconLoader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Guardando..." : "Guardar Registro"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-card/30 border border-border/40 rounded-2xl overflow-hidden shadow-sm">
              {isPending ? (
                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                  <IconLoader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                    Sincronizando...
                  </span>
                </div>
              ) : alumnos.length > 0 ? (
                <AsistenciaTable
                  data={alumnos}
                  onEstadoChange={handleEstadoChange}
                  onJustificacionChange={handleObservacionChange}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 opacity-50">
                  <IconSchool className="h-12 w-12 mb-4 text-muted-foreground/20" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">
                    Sin estudiantes
                  </h3>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    No hay alumnos matriculados en esta sección.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 h-full">
              <AsistenciaResumen alumnos={alumnos} />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <IconSearch className="relative w-12 h-12 text-primary/40" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">
            Listo para el Registro
          </h3>
          <p className="max-w-[320px] text-center text-sm text-muted-foreground font-medium">
            Selecciona una sección y fecha para comenzar el control de
            asistencia.
          </p>
        </div>
      )}
    </div>
  );
}
