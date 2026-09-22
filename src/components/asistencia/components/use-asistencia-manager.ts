"use client";

import {
  useState,
  useTransition,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { startOfDay } from "date-fns";
import { toast } from "sonner";
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
import {
  SeccionAsistencia,
  AlumnoAsistencia,
} from "./asistencia-types";

export const isAusente = (estado: string) =>
  estado === "ausente" || estado === "falta";
export const isJustificado = (estado: string) =>
  estado === "justificado" || estado === "justificada";
export const isTarde = (estado: string) =>
  estado === "tarde" || estado === "tardanza";

interface UseAsistenciaManagerProps {
  initialSecciones: SeccionAsistencia[];
  defaultYear: number;
  profesorId?: string;
}

export function useAsistenciaManager({
  initialSecciones,
  defaultYear,
  profesorId,
}: UseAsistenciaManagerProps) {
  const [fecha, setFecha] = useQueryState(
    "fecha",
    parseAsIsoDate.withDefault(startOfDay(new Date())),
  );
  const [anio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear),
  );
  const [secciones, setSecciones] =
    useState<SeccionAsistencia[]>(initialSecciones);
  const [seccionId, setSeccionId] = useQueryState(
    "seccion",
    parseAsString.withDefault(""),
  );
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const cursoIdRef = useRef<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"pad" | "table">("pad");
  const [selectedNivelFilter, setSelectedNivelFilter] =
    useState<string>("all");

  const prevAnioRef = useRef(anio);

  // Niveles Únicos para Filtro
  const niveles = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string }>();
    secciones.forEach((s) => {
      if (s.nivel && !map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [secciones]);

  // Secciones filtradas por nivel
  const visibleSecciones = useMemo(() => {
    if (selectedNivelFilter === "all") return secciones;
    return secciones.filter((s) => s.nivel?.id === selectedNivelFilter);
  }, [secciones, selectedNivelFilter]);

  // Auto-Selección Inicial Inteligente
  useEffect(() => {
    if (secciones.length > 0 && !seccionId) {
      const targetSeccion =
        (profesorId
          ? secciones.find((s) => s.tutor?.id === profesorId) ||
            secciones.find((s) =>
              s.cursos?.some(
                (c: any) =>
                  c.profesorId === profesorId || c.profesor?.id === profesorId,
              ),
            )
          : null) || secciones[0];

      if (targetSeccion?.id) {
        setSeccionId(targetSeccion.id);
        if (targetSeccion.nivel?.id) {
          setSelectedNivelFilter(targetSeccion.nivel.id);
        }
      }
    }
  }, [secciones, seccionId, profesorId, setSeccionId]);

  // Carga de secciones cuando cambia el año
  useEffect(() => {
    let ignore = false;
    const loadSecciones = async () => {
      if (ignore) return;
      const res = await getSeccionesAction({
        anioAcademico: anio,
        profesorId,
      });
      if (ignore) return;
      if (res.data) {
        setSecciones(res.data);
        if (prevAnioRef.current !== anio) {
          setSeccionId("");
          setAlumnos([]);
          prevAnioRef.current = anio;
        }
      }
    };
    loadSecciones();
    return () => {
      ignore = true;
    };
  }, [anio, profesorId, setSeccionId]);

  // Carga de Asistencia de la Sección y Fecha
  const loadAsistencia = useCallback(() => {
    if (!seccionId) return;
    startTransition(async () => {
      const res = await getAsistenciaAction({
        nivelAcademicoId: seccionId,
        fecha,
      });
      if (res.success) {
        cursoIdRef.current = res.success.cursoId || "";
        const transformed = res.success.data.map((alumno) => {
          const a = alumno.asistencias[0];
          let estado = "presente";
          if (a) {
            if (a.tardanza) estado = "tarde";
            else if (a.justificada) estado = "justificado";
            else if (!a.presente) estado = "ausente";
          }
          return {
            id: alumno.id,
            name: alumno.name || "",
            apellidoPaterno: alumno.apellidoPaterno || "",
            apellidoMaterno: alumno.apellidoMaterno || "",
            image: alumno.image || undefined,
            estado,
            justificacion: a?.justificacion || "",
          };
        });
        setAlumnos(transformed);
        setHasUnsavedChanges(false);
      }
      if (res.error) toast.error(res.error);
    });
  }, [seccionId, fecha]);

  useEffect(() => {
    loadAsistencia();
  }, [loadAsistencia]);

  // Handlers Rápidos
  const handleEstadoChange = (id: string, estado: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, estado } : a)),
    );
    setHasUnsavedChanges(true);
  };

  const handleObservacionChange = (id: string, justificacion: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, justificacion } : a)),
    );
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    setAlumnos((prev) => prev.map((a) => ({ ...a, estado: "presente" })));
    setHasUnsavedChanges(true);
    toast.success("✓ Todos los estudiantes marcados como PRESENTES");
  };

  const onSave = async () => {
    if (!cursoIdRef.current) {
      toast.error(
        "No hay cursos activos asignados a esta sección para registrar asistencia.",
      );
      return;
    }
    setIsSaving(true);
    try {
      const data = alumnos.map((a) => ({
        estudianteId: a.id,
        cursoId: cursoIdRef.current,
        fecha,
        presente: !isAusente(a.estado),
        tardanza: isTarde(a.estado),
        justificada: isJustificado(a.estado),
        justificacion: a.justificacion,
      }));
      const res = await upsertAsistenciaAction(data);
      if (res.success) {
        toast.success("✓ Asistencia guardada correctamente");
        setHasUnsavedChanges(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsSaving(false);
    }
  };

  // Atajos Globales de Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === "s") ||
        (e.altKey && (e.key === "g" || e.key === "G"))
      ) {
        e.preventDefault();
        onSave();
      }
      if (e.altKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        handleMarkAllPresent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Métricas en Tiempo Real
  const totalAlumnos = alumnos.length;
  const presentesCount = alumnos.filter((a) => a.estado === "presente").length;
  const ausentesCount = alumnos.filter((a) => isAusente(a.estado)).length;
  const tardanzasCount = alumnos.filter((a) => isTarde(a.estado)).length;
  const attendanceRate =
    totalAlumnos > 0
      ? Math.round(((presentesCount + tardanzasCount) / totalAlumnos) * 100)
      : 0;

  // Filtrado para la vista
  const filteredAlumnos = useMemo(() => {
    return alumnos.filter((a) => {
      const matchesSearch =
        `${a.name} ${a.apellidoPaterno} ${a.apellidoMaterno}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      if (filterStatus === "ausentes")
        return matchesSearch && isAusente(a.estado);
      if (filterStatus === "tardanzas")
        return matchesSearch && isTarde(a.estado);
      if (filterStatus === "justificados")
        return matchesSearch && isJustificado(a.estado);
      return matchesSearch;
    });
  }, [alumnos, searchTerm, filterStatus]);

  return {
    fecha,
    setFecha,
    seccionId,
    setSeccionId,
    visibleSecciones,
    niveles,
    selectedNivelFilter,
    setSelectedNivelFilter,
    totalAlumnos,
    attendanceRate,
    presentesCount,
    tardanzasCount,
    ausentesCount,
    handleMarkAllPresent,
    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    isPending,
    filteredAlumnos,
    handleEstadoChange,
    handleObservacionChange,
    hasUnsavedChanges,
    isSaving,
    onSave,
  };
}
