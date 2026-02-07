"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  IconCalendar,
  IconSchool,
  IconSearch,
  IconLoader2,
  IconDeviceFloppy,
  IconUsers,
  IconCheck,
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
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";

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
    parseAsIsoDate.withDefault(startOfDay(new Date())),
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");

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

  const handleMarkAllPresent = () => {
    setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "presente" })));
    toast.success("Todos los estudiantes marcados como presentes");
  };

  const handleObservacionChange = (id: string, justificacion: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, justificacion } : a)),
    );
  };

  const filteredAlumnos = alumnos.filter((a) => {
    const matchesSearch = `${a.name} ${a.apellidoPaterno} ${a.apellidoMaterno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (filterStatus === "todos") return matchesSearch;
    if (filterStatus === "ausentes")
      return matchesSearch && a.estado === "ausente";
    if (filterStatus === "tardanzas")
      return matchesSearch && a.estado === "tarde";
    return matchesSearch;
  });

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
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-500">
      <div className="bg-card border border-border/40 rounded-2xl p-3 backdrop-blur-sm shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5 w-full sm:w-28">
            <label className="text-xs font-bold text-muted-foreground ml-1">
              Periodo
            </label>
            <Select
              onValueChange={(v) => setAnio(Number(v))}
              value={anio.toString()}
              disabled={isLoadingSecciones}
            >
              <SelectTrigger className="transition-all hover:bg-background/40 w-full rounded-full">
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

          <div className="space-y-1.5 w-full sm:w-56">
            <label className="text-xs font-bold text-muted-foreground ml-1">
              Fecha de Registro
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-medium transition-all hover:bg-background/40 rounded-full",
                    !fecha && "text-muted-foreground",
                  )}
                >
                  <IconCalendar className="mr-2 h-4 w-4 text-primary" />
                  <span className="truncate">
                    {fecha
                      ? format(fecha, "PPP", { locale: es })
                      : "Seleccionar"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={(d) => d && setFecha(startOfDay(d))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <label className="text-xs font-bold text-muted-foreground ml-1">
              Sección / Grado
            </label>
            <Select
              onValueChange={setSeccionId}
              value={seccionId}
              disabled={isLoadingSecciones}
            >
              <SelectTrigger className="transition-all hover:bg-background/40  rounded-full">
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
                  <div className="p-2 text-center text-xs font-medium text-muted-foreground">
                    Sin secciones para {anio}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={loadAsistencia}
            disabled={!seccionId || isPending}
            className="text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-full w-full sm:w-auto ml-auto"
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

      {seccionId ? (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card backdrop-blur-xl px-5 py-4 md:px-6 md:py-4 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 shadow-inner shrink-0">
                <IconUsers className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold tracking-tight text-muted-foreground truncate leading-tight">
                  Registro de Asistencia
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    {secciones.find((s) => s.id === seccionId)?.nivel.nombre}
                  </Badge>
                  <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                    - {secciones.find((s) => s.id === seccionId)?.grado.nombre}{" "}
                    "{secciones.find((s) => s.id === seccionId)?.seccion}"
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleMarkAllPresent}
                disabled={alumnos.length === 0}
                className="text-xs px-4 rounded-full transition-all"
              >
                <IconCheck className="mr-2 h-3.5 w-3.5" />
                Marcar todos
              </Button>
              <Button
                onClick={onSave}
                disabled={isSaving || alumnos.length === 0}
                className="text-xs shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-full"
              >
                {isSaving ? (
                  <IconLoader2 className="animate-spin mr-2 h-3.5 w-3.5" />
                ) : (
                  <IconDeviceFloppy className="mr-2 h-3.5 w-3.5" />
                )}
                {isSaving ? "Guardando..." : "Guardar Registro"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-3">
              {/* Barra de Búsqueda y Filtros Rápidos */}
              <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-card border shadow-sm shadow-black/20 border-muted p-2 rounded-2xl">
                <div className="relative w-full md:w-80 group">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-full pl-12 pr-4 text-sm transition-all"
                  />
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-muted rounded-full border overflow-x-auto no-scrollbar shrink-0">
                  {[
                    { id: "todos", label: `TODOS (${alumnos.length})` },
                    {
                      id: "ausentes",
                      label: `AUSENTES (${alumnos.filter((a) => a.estado === "ausente").length})`,
                    },
                    {
                      id: "tardanzas",
                      label: `TARDANZAS (${alumnos.filter((a) => a.estado === "tarde").length})`,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilterStatus(f.id)}
                      className={cn(
                        "px-3 md:px-4 py-2 rounded-full text-[9px] font-bold transition-all whitespace-nowrap",
                        filterStatus === f.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-primary/40 hover:bg-primary/10 hover:blur-in",
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Tarjetas */}
              <div className="bg-card/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                {isPending ? (
                  <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <IconLoader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
                    <span className="text-xs font-bold text-white/10">
                      Sincronizando...
                    </span>
                  </div>
                ) : filteredAlumnos.length > 0 ? (
                  <AsistenciaTable
                    data={filteredAlumnos}
                    onEstadoChange={handleEstadoChange}
                    onJustificacionChange={handleObservacionChange}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                    <div className="bg-white/2 p-6 rounded-full border border-white/5 mb-6">
                      <IconSchool className="h-12 w-12 text-white/10" />
                    </div>
                    <h3 className="text-sm font-bold tracking-[0.2em] text-white/40">
                      Sin resultados
                    </h3>
                    <p className="text-[11px] text-white/50 font-bold mt-2">
                      No se encontraron estudiantes con los criterios
                      seleccionados.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 sticky top-8">
              <AsistenciaResumen alumnos={alumnos} />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 rounded-[3rem] border border-dashed border-white/10 bg-[#0f0f0f]/20">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full animate-pulse" />
            <div className="relative bg-white/2 p-8 rounded-[2rem] border border-white/5">
              <IconSearch className="w-14 h-14 text-primary opacity-40" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-3 text-white/80">
            Control de Asistencia
          </h3>
          <p className="max-w-[340px] text-center text-xs text-white/30 font-bold leading-loose">
            Selecciona una sección y fecha para comenzar el registro diario.
          </p>
        </div>
      )}
    </div>
  );
}
