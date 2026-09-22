"use client";

import {
  useState,
  useTransition,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useReducer,
} from "react";
import { toast } from "sonner";
import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs";
import {
  getSeccionesAction,
  getStudentsInSeccionAction,
} from "@/actions/academic-structure";
import {
  reportResultsInitialState,
  reportResultsReducer,
  fetchReportData,
} from "./reporte-types";

interface UseAsistenciaReportesStateProps {
  initialSecciones: any[];
  defaultYear: number;
  profesorId?: string;
}

export function useAsistenciaReportesState({
  initialSecciones,
  defaultYear,
  profesorId,
}: UseAsistenciaReportesStateProps) {
  const [isPending, startTransition] = useTransition();

  // URL state
  const [reportType, setReportType] = useQueryState(
    "tipo",
    parseAsStringLiteral([
      "mensual",
      "institucional",
      "alertas",
      "individual",
      "justificaciones",
    ] as const).withDefault("mensual"),
  );
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear),
  );
  const [mes, setMes] = useQueryState(
    "mes",
    parseAsInteger.withDefault(new Date().getMonth() + 1),
  );
  const [nivelId, setNivelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault(""),
  );
  const [gradoId, setGradoId] = useQueryState(
    "gradoId",
    parseAsString.withDefault(""),
  );
  const [seccionId, setSeccionId] = useQueryState(
    "seccionId",
    parseAsString.withDefault(""),
  );
  const [rPeriod, setRPeriod] = useQueryState(
    "period",
    parseAsStringLiteral(["today", "month", "year"] as const).withDefault(
      "today",
    ),
  );
  const [studentId, setStudentId] = useQueryState(
    "studentId",
    parseAsString.withDefault(""),
  );

  // Reducer para datos de reportes
  const [results, dispatch] = useReducer(
    reportResultsReducer,
    reportResultsInitialState,
  );
  const {
    reportData,
    daysInMonth,
    alertsData,
    instData,
    studentData,
    justificationsData,
  } = results;

  // Estado de secciones y alumnos
  const [secciones, setSecciones] = useState<any[]>(initialSecciones);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false);
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false);

  // Niveles únicos
  const niveles = useMemo(() => {
    const map = new Map();
    secciones.forEach((s: any) => {
      if (s.nivel && !map.has(s.nivel.id)) {
        map.set(s.nivel.id, s.nivel);
      }
    });
    return Array.from(map.values());
  }, [secciones]);

  // Cargar secciones al cambiar año
  useEffect(() => {
    if (!anio) return;
    const controller = new AbortController();
    setIsLoadingSecciones(true);
    getSeccionesAction({
      anioAcademico: anio,
      profesorId: profesorId || undefined,
    })
      .then((res) => {
        if (!controller.signal.aborted && res.data) {
          setSecciones(res.data);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Error al cargar secciones del año");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingSecciones(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [anio, profesorId]);

  // Nivel inicial por defecto
  useEffect(() => {
    if (niveles.length > 0 && !nivelId) {
      setNivelId(niveles[0].id);
    }
  }, [niveles, nivelId, setNivelId]);

  // Grados según nivel
  const grados = useMemo(() => {
    if (!nivelId) return [];
    const map = new Map();
    for (const s of (secciones as any[])) {
      if (s.nivel?.id === nivelId && s.grado && !map.has(s.grado.id)) {
        map.set(s.grado.id, s.grado);
      }
    }
    return Array.from(map.values());
  }, [secciones, nivelId]);

  // Secciones filtradas por grado y nivel
  const seccionesFiltradas = useMemo(() => {
    if (!gradoId) return [];
    const map = new Map();
    for (const s of (secciones as any[])) {
      const matchGrado = s.gradoId === gradoId || s.grado?.id === gradoId;
      const matchNivel = !nivelId || s.nivelId === nivelId || s.nivel?.id === nivelId;
      if (matchGrado && matchNivel && !map.has(s.id)) {
        map.set(s.id, s);
      }
    }
    return Array.from(map.values());
  }, [secciones, gradoId, nivelId]);

  // Cargar alumnos de la sección
  useEffect(() => {
    if (
      !seccionId ||
      seccionId === "all" ||
      (reportType !== "individual" && reportType !== "mensual")
    ) {
      setAlumnos([]);
      return;
    }
    const controller = new AbortController();
    setIsLoadingAlumnos(true);
    getStudentsInSeccionAction(seccionId)
      .then((res) => {
        if (!controller.signal.aborted && res.data) {
          setAlumnos(res.data);
          if (res.data.length > 0 && reportType === "individual" && !studentId) {
            setStudentId(res.data[0].id);
          }
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Error al cargar lista de alumnos");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingAlumnos(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [seccionId, reportType, studentId, setStudentId]);

  // Consulta de reportes
  const handleConsultar = useCallback(() => {
    dispatch({ type: "RESET" });
    startTransition(async () => {
      const res = await fetchReportData(reportType, {
        seccionId,
        mes,
        anio,
        nivelId,
        gradoId,
        rPeriod,
        studentId,
      });
      if (res.ok) {
        dispatch(res.action);
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  }, [reportType, seccionId, mes, anio, nivelId, gradoId, rPeriod, studentId]);

  // Auto-consulta inicial al cargar
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (
        (reportType === "mensual" && seccionId) ||
        (reportType === "individual" && studentId) ||
        reportType === "institucional" ||
        reportType === "alertas" ||
        reportType === "justificaciones"
      ) {
        handleConsultar();
      }
    }
  }, [reportType, seccionId, studentId, handleConsultar]);

  const nivelActual = niveles.find((n: any) => n.id === nivelId);
  const seccionActual = secciones.find((s: any) => s.id === seccionId);
  const estudianteActual = alumnos.find((a: any) => a.id === studentId);
  const estudianteNombre = estudianteActual
    ? `${estudianteActual.apellidoPaterno} ${estudianteActual.apellidoMaterno || ""}, ${estudianteActual.name}`
    : "";

  return {
    isPending,
    reportType,
    setReportType,
    anio,
    setAnio,
    mes,
    setMes,
    nivelId,
    setNivelId,
    gradoId,
    setGradoId,
    seccionId,
    setSeccionId,
    rPeriod,
    setRPeriod,
    studentId,
    setStudentId,
    reportData,
    daysInMonth,
    alertsData,
    instData,
    studentData,
    justificationsData,
    secciones: seccionesFiltradas,
    todasSecciones: secciones,
    alumnos,
    isLoadingSecciones,
    isLoadingAlumnos,
    niveles,
    grados,
    handleConsultar,
    nivelActual,
    seccionActual,
    estudianteNombre,
  };
}
