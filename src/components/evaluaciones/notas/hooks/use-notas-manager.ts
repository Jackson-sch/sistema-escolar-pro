"use client";

import {
  useState,
  useTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registrarNotasMasivasAction } from "@/actions/evaluations";
import { exportEvaluacionToExcel } from "@/lib/excel-helper";
import { StatusFilterType } from "../notas-form-stats";
import {
  NotaData,
  EstudianteType,
  EscalaType,
} from "../notas-form-types";
import { useNotasDraft } from "./use-notas-draft";
import { useNotasStats } from "./use-notas-stats";

interface UseNotasManagerProps {
  evaluacionId: string;
  cursoId: string;
  estudiantes: EstudianteType[];
  initialNotas: Record<string, NotaData>;
  escala?: EscalaType;
  cursoNombre?: string;
  evaluacionNombre?: string;
}

export function useNotasManager({
  evaluacionId,
  cursoId,
  estudiantes,
  initialNotas,
  escala = "VIGESIMAL",
  cursoNombre = "Curso",
  evaluacionNombre = "Evaluación",
}: UseNotasManagerProps) {
  const router = useRouter();
  const [notas, setNotas] = useState<Record<string, NotaData>>(initialNotas);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [isPending, startTransition] = useTransition();
  const isSavingRef = useRef(false);

  const notasExistentes = initialNotas;

  const isDirty = useMemo(() => {
    const keys1 = Object.keys(notas);
    const keys2 = Object.keys(notasExistentes);
    if (keys1.length !== keys2.length) return true;
    for (const key of keys1) {
      const n1 = notas[key];
      const n2 = notasExistentes[key];
      if (!n2) return true;
      if (n1.valor !== n2.valor) return true;
      if (n1.valorLiteral !== n2.valorLiteral) return true;
      if (n1.comentario !== n2.comentario) return true;
    }
    return false;
  }, [notas, notasExistentes]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSavingRef.current) {
        e.preventDefault();
        e.returnValue =
          "Tienes calificaciones modificadas sin guardar. ¿Deseas salir?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const { draftToRestore, restoreDraft, discardDraft } = useNotasDraft({
    evaluacionId,
    notasExistentes,
    notas,
    isDirty,
    onRestore: (draft) => setNotas(draft),
  });

  const isRowModified = (studentId: string) => {
    const current = notas[studentId];
    const original = notasExistentes[studentId];
    if (!current && !original) return false;
    if (current && !original) return true;
    if (!current && original) return true;
    return (
      current?.valor !== original?.valor ||
      current?.valorLiteral !== original?.valorLiteral ||
      current?.comentario !== original?.comentario
    );
  };

  const handleBulkFillDefault = () => {
    setNotas((prev) => {
      const next = { ...prev };
      estudiantes.forEach((est) => {
        if (
          !next[est.id] ||
          (!next[est.id].valorLiteral && next[est.id].valor === 0)
        ) {
          if (escala === "LITERAL") {
            next[est.id] = {
              valor: 0,
              valorLiteral: "A",
              comentario: next[est.id]?.comentario,
            };
          } else {
            next[est.id] = { valor: 14, comentario: next[est.id]?.comentario };
          }
        }
      });
      return next;
    });
    toast.success(
      escala === "LITERAL"
        ? "✓ Se asignó Logro Esperado (A) a todos los alumnos sin calificar"
        : "✓ Se asignó nota 14 a todos los alumnos sin calificar",
    );
  };

  const handleClearAll = () => {
    setNotas(notasExistentes);
    toast.info("Calificaciones restauradas al estado guardado");
  };

  const estudiantesFiltrados = estudiantes.filter((est) => {
    const fullName =
      `${est.name} ${est.apellidoPaterno} ${est.apellidoMaterno}`.toLowerCase();
    const code = (est.codigoEstudiante || "").toLowerCase();
    const matchesSearch =
      fullName.includes(search.toLowerCase()) ||
      code.includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const nota = notas[est.id];

    if (statusFilter === "calificados")
      return !!nota && (!!nota.valorLiteral || nota.valor > 0);
    if (statusFilter === "pendientes")
      return !nota || (!nota.valorLiteral && nota.valor === 0);
    if (statusFilter === "aprobados") {
      if (!nota) return false;
      if (escala === "LITERAL")
        return nota.valorLiteral === "AD" || nota.valorLiteral === "A";
      return nota.valor >= 11;
    }
    if (statusFilter === "desaprobados") {
      if (!nota) return false;
      if (escala === "LITERAL")
        return nota.valorLiteral === "B" || nota.valorLiteral === "C";
      return nota.valor > 0 && nota.valor < 11;
    }

    return true;
  });

  const handleNotaChange = useCallback(
    (
      estudianteId: string,
      valor: string,
      type: "valor" | "valorLiteral" | "comentario",
    ) => {
      setNotas((prev) => {
        const base = prev[estudianteId]
          ? { ...prev[estudianteId] }
          : { valor: 0 };

        let nextNota: NotaData;
        if (type === "valor") {
          const numValue = parseFloat(valor);
          nextNota = {
            ...base,
            valor:
              valor === "" || isNaN(numValue)
                ? 0
                : Math.min(20, Math.max(0, numValue)),
          };
        } else if (type === "valorLiteral") {
          nextNota = {
            ...base,
            valorLiteral: valor === "none" || valor === "" ? undefined : valor,
            ...(valor !== "none" && valor !== "" ? { valor: 0 } : {}),
          };
        } else {
          nextNota = {
            ...base,
            comentario: valor === "" ? undefined : valor,
          };
        }

        const newNotas = { ...prev };
        if (
          nextNota.valor === 0 &&
          !nextNota.valorLiteral &&
          !nextNota.comentario
        ) {
          delete newNotas[estudianteId];
        } else {
          newNotas[estudianteId] = nextNota;
        }

        return newNotas;
      });
    },
    [],
  );

  const handleGuardar = useCallback(() => {
    const notasArray = (Object.entries(notas) as [string, NotaData][]).map(
      ([estudianteId, data]) => ({
        estudianteId,
        valor: data.valor,
        valorLiteral: data.valorLiteral,
        comentario: data.comentario,
      }),
    );

    if (notasArray.length === 0) {
      toast.info("No se han registrado calificaciones para guardar");
      return;
    }

    isSavingRef.current = true;
    startTransition(async () => {
      try {
        const res = await registrarNotasMasivasAction({
          evaluacionId,
          cursoId,
          notas: notasArray as any,
        });

        if (res.success) {
          toast.success("✓ Calificaciones guardadas en el registro curricular");
          localStorage.removeItem(`notas_draft_${evaluacionId}`);
          router.refresh();
        } else {
          isSavingRef.current = false;
          toast.error(res.error || "Error al registrar calificaciones");
        }
      } catch {
        isSavingRef.current = false;
        toast.error("Ocurrió un error inesperado al guardar las calificaciones");
      }
    });
  }, [notas, evaluacionId, cursoId, router]);

  const handleSaveShortcut = useEffectEvent(() => {
    handleGuardar();
  });

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !isPending) {
          handleSaveShortcut();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isDirty, isPending]);

  const handleExportExcel = useCallback(() => {
    const dataForExport = estudiantes.map((e) => {
      const notaObj = notas[e.id];
      return {
        codigoEstudiante: e.codigoEstudiante,
        apellidoPaterno: e.apellidoPaterno,
        apellidoMaterno: e.apellidoMaterno,
        nombre: e.name,
        nota:
          escala === "LITERAL"
            ? notaObj?.valorLiteral || "-"
            : (notaObj?.valor ?? "-"),
        comentario: notaObj?.comentario || "",
      };
    });

    exportEvaluacionToExcel({
      evaluacionNombre,
      cursoNombre,
      estudiantes: dataForExport,
    });
    toast.success("Planilla de calificaciones descargada en Excel");
  }, [estudiantes, notas, escala, evaluacionNombre, cursoNombre]);

  const stats = useNotasStats(estudiantes, notas, escala);

  return {
    notas,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    isPending,
    isDirty,
    draftToRestore,
    restoreDraft,
    discardDraft,
    isRowModified,
    handleBulkFillDefault,
    handleClearAll,
    estudiantesFiltrados,
    handleNotaChange,
    handleGuardar,
    handleExportExcel,
    stats,
  };
}
