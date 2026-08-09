"use client";

import * as React from "react";
import { useState, useTransition, useEffect, useEffectEvent, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { registrarNotasMasivasAction } from "@/actions/evaluations";
import { IconSparkles, IconKeyboard } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

// Componentes del Formulario
import { NotasFormHeader } from "./notas-form-header";
import { NotasFormStats, StatusFilterType } from "./notas-form-stats";
import { NotasTable } from "./notas-table";
import { NotasTableRow } from "./notas-table-row";

interface EstudianteType {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codigoEstudiante: string | null;
}

interface NotaData {
  valor: number;
  valorLiteral?: string;
  comentario?: string;
}

type EscalaType = "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";

interface NotasFormProps {
  evaluacionId: string;
  cursoId: string;
  estudiantes: EstudianteType[];
  notasExistentes: Record<string, NotaData>;
  escala?: EscalaType;
  cursoNombre?: string;
  evaluacionNombre?: string;
}

// ─── Hooks auxiliares ────────────────────────────────────────────────────────

function useNotasDraft({
  evaluacionId,
  notasExistentes,
  notas,
  isDirty,
  onRestore,
}: {
  evaluacionId: string;
  notasExistentes: Record<string, NotaData>;
  notas: Record<string, NotaData>;
  isDirty: boolean;
  onRestore: (notas: Record<string, NotaData>) => void;
}) {
  const [draftToRestore, setDraftToRestore] = useState<Record<string, NotaData> | null>(null);

  // Cargar borrador local si existe y difiere de la base de datos.
  // El setState se difiere con un timer para evitar un setState síncrono
  // dentro del efecto (regla react-hooks/set-state-in-effect).
  useEffect(() => {
    const savedDraft = localStorage.getItem(`notas_draft_${evaluacionId}`);
    if (!savedDraft) return;
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(savedDraft);
        const isDraftDifferent = JSON.stringify(parsed) !== JSON.stringify(notasExistentes);
        if (isDraftDifferent) {
          setDraftToRestore(parsed);
        }
      } catch (err) {
        console.error("Error al cargar el borrador local:", err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [evaluacionId, notasExistentes]);

  // Guardar borrador local automáticamente ante cada cambio
  useEffect(() => {
    if (isDirty && Object.keys(notas).length > 0) {
      localStorage.setItem(`notas_draft_${evaluacionId}`, JSON.stringify(notas));
    } else if (!isDirty) {
      localStorage.removeItem(`notas_draft_${evaluacionId}`);
    }
  }, [notas, isDirty, evaluacionId]);

  const restoreDraft = () => {
    if (draftToRestore) {
      onRestore(draftToRestore);
      setDraftToRestore(null);
      toast.success("Borrador local restaurado correctamente");
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(`notas_draft_${evaluacionId}`);
    setDraftToRestore(null);
    toast.info("Borrador local descartado");
  };

  return { draftToRestore, restoreDraft, discardDraft };
}

function useNotasStats(
  estudiantes: EstudianteType[],
  notas: Record<string, NotaData>,
  escala: EscalaType,
) {
  return useMemo(() => {
    const total = estudiantes.length;
    const calificados = estudiantes.filter((est) => notas[est.id]).length;
    const pendientes = total - calificados;

    let promedio: number | null = null;
    let aprobados = 0;
    let desaprobados = 0;

    if (escala === "VIGESIMAL") {
      const notasValidas = Object.values(notas).flatMap((n) =>
        n.valor !== undefined && n.valor !== 0 ? [n.valor] : [],
      );
      if (notasValidas.length > 0) {
        promedio = parseFloat(
          (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1),
        );
      }
      Object.values(notas).forEach((n) => {
        if (n.valor >= 11) aprobados++;
        else if (n.valor > 0) desaprobados++;
      });
      desaprobados += pendientes;
    } else {
      Object.values(notas).forEach((n) => {
        if (n.valorLiteral === "AD" || n.valorLiteral === "A") aprobados++;
        else if (n.valorLiteral === "B" || n.valorLiteral === "C") desaprobados++;
      });
      desaprobados += pendientes;
    }

    return {
      total,
      calificados,
      pendientes,
      promedio,
      distribucion: {
        aprobados,
        desaprobados,
      },
    };
  }, [notas, estudiantes, escala]);
}

function useNotasAiFeedback({
  cursoNombre,
  evaluacionNombre,
  notas,
  onCommit,
}: {
  cursoNombre: string;
  evaluacionNombre: string;
  notas: Record<string, NotaData>;
  onCommit: (studentId: string, text: string) => void;
}) {
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Refs con los valores más recientes para el commit al terminar el streaming
  // (el callback onFinish de useChat se captura una sola vez al crear el Chat).
  const activeStudentIdRef = useRef<string | null>(null);
  const streamingTextRef = useRef<string>("");

  useEffect(() => {
    activeStudentIdRef.current = activeStudentId;
  }, [activeStudentId]);

  const { messages, sendMessage, status, setMessages } = useChat({
    api: "/api/chat",
    body: {
      context: {
        type: "FEEDBACK",
        curso: cursoNombre,
        evaluacion: evaluacionNombre,
      },
    },
    onFinish: () => {
      const studentId = activeStudentIdRef.current;
      const text = streamingTextRef.current;
      if (studentId && text) {
        onCommit(studentId, text);
      }
      streamingTextRef.current = "";
      setActiveStudentId(null);
      toast.success("Feedback completado");
    },
  } as any);

  const isStreaming = status === "streaming" || status === "submitted";

  // Durante el streaming solo se captura el texto en un ref (sin ajustar el
  // estado de notas dentro de un efecto); el commit real ocurre en onFinish.
  useEffect(() => {
    if (!activeStudentId || !isStreaming) return;
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAssistantMessage) return;
    const text =
      (lastAssistantMessage as any).content ||
      lastAssistantMessage.parts
        ?.flatMap((p: any) => (p.type === "text" ? [p.text] : []))
        ?.join("") ||
      "";
    if (text) {
      streamingTextRef.current = text;
    }
  }, [messages, isStreaming, activeStudentId]);

  const streamingContent = (studentId: string) => {
    if (activeStudentId === studentId) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");

      if (lastAssistantMessage) {
        const text =
          (lastAssistantMessage as any).content ||
          lastAssistantMessage.parts
            ?.flatMap((p: any) => (p.type === "text" ? [p.text] : []))
            ?.join("") ||
          "";

        return text || null;
      }
    }
    return null;
  };

  const handleGenerateAI = async (est: EstudianteType) => {
    const notaData = notas[est.id];
    if (!notaData || (notaData.valor === 0 && !notaData.valorLiteral)) {
      toast.error("Ingresa una nota antes de generar feedback");
      return;
    }

    setActiveStudentId(est.id);
    setMessages([]);

    (sendMessage as any)({
      text: `Genera un reporte de retroalimentación formal para el padre de familia sobre el desempeño de:
        Alumno: ${est.name} ${est.apellidoPaterno}
        Calificación obtenida en ${evaluacionNombre}: ${
          notaData.valorLiteral ? notaData.valorLiteral : notaData.valor + "/20"
        }
        Materia: ${cursoNombre}.
        
        Recuerda mencionar la competencia evaluada [${evaluacionNombre}] y dar recomendaciones constructivas. Solo en español.`,
    });
  };

  return { isStreaming, activeStudentId, streamingContent, handleGenerateAI };
}

// ─── Subcomponentes presentacionales ─────────────────────────────────────────

function NotasDraftBanner({
  onRestore,
  onDiscard,
}: {
  onRestore: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 animation-duration- shadow-[0_4px_20px_rgba(245,158,11,0.05)]">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
          <IconSparkles className="size-4 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Borrador local no guardado detectado
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium">
            Tienes calificaciones locales pendientes de guardar en el servidor. ¿Deseas restaurarlas?
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:bg-muted"
        >
          Ignorar
        </Button>
        <Button
          size="sm"
          onClick={onRestore}
          className="text-[10px] font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white rounded-full px-4 h-8 gap-1.5 shadow-md shadow-amber-500/10"
        >
          <IconSparkles className="size-3" />
          Restaurar Borrador
        </Button>
      </div>
    </div>
  );
}

function NotasKeyboardBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/40 border border-border/30 text-xs font-medium text-muted-foreground shadow-xs">
      <div className="flex items-center gap-2">
        <IconKeyboard className="size-4 text-indigo-500" />
        <span className="font-semibold text-foreground">Atajos de Teclado:</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 text-[11px]">
          <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 font-mono text-[10px] font-bold text-foreground">↵ Enter</kbd> o <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 font-mono text-[10px] font-bold text-foreground">↓</kbd> Siguiente alumno
        </span>
        <span className="flex items-center gap-1 text-[11px]">
          <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 font-mono text-[10px] font-bold text-foreground">↑</kbd> Alumno anterior
        </span>
        <span className="flex items-center gap-1 text-[11px]">
          <kbd className="px-1.5 py-0.5 rounded-md bg-muted border border-border/40 font-mono text-[10px] font-bold text-foreground">Ctrl + S</kbd> Guardar calificaciones
        </span>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function NotasForm({
  evaluacionId,
  cursoId,
  estudiantes,
  notasExistentes: initialNotas,
  escala = "VIGESIMAL",
  cursoNombre = "Curso",
  evaluacionNombre = "Evaluación",
}: NotasFormProps) {
  const router = useRouter();
  const [notas, setNotas] = useState<Record<string, NotaData>>(initialNotas);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [isPending, startTransition] = useTransition();
  const isSavingRef = useRef(false);

  // Guardar referencia de notasExistentes para comparaciones de cambios
  const notasExistentes = initialNotas;

  // Verificar si hay cambios respecto a la base de datos
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

  // Prevenir salidas accidentales únicamente si hay cambios sin guardar y NO se está guardando
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSavingRef.current) {
        e.preventDefault();
        e.returnValue = "Tienes calificaciones modificadas sin guardar. ¿Deseas salir?";
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

  // Comprobar si una fila específica fue modificada
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

  // Navegación fluida por teclado
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
    index: number,
  ) => {
    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
      const nextInput = document.querySelector(
        `[data-index="${index + 1}"]`,
      ) as HTMLInputElement | HTMLButtonElement | null;
      if (nextInput) {
        nextInput.focus();
        if ("select" in nextInput) nextInput.select();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevInput = document.querySelector(
        `[data-index="${index - 1}"]`,
      ) as HTMLInputElement | HTMLButtonElement | null;
      if (prevInput) {
        prevInput.focus();
        if ("select" in prevInput) prevInput.select();
      }
    }
  };

  // Filtrado multiconcepto de estudiantes (búsqueda + pestañas de estado)
  const estudiantesFiltrados = estudiantes.filter((est) => {
    const fullName = `${est.name} ${est.apellidoPaterno} ${est.apellidoMaterno}`.toLowerCase();
    const code = (est.codigoEstudiante || "").toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || code.includes(search.toLowerCase());
    if (!matchesSearch) return false;

    const nota = notas[est.id];

    if (statusFilter === "calificados") return !!nota;
    if (statusFilter === "pendientes") return !nota;
    if (statusFilter === "aprobados") {
      if (!nota) return false;
      if (escala === "LITERAL") return nota.valorLiteral === "AD" || nota.valorLiteral === "A";
      return nota.valor >= 11;
    }
    if (statusFilter === "desaprobados") {
      if (!nota) return false;
      if (escala === "LITERAL") return nota.valorLiteral === "B" || nota.valorLiteral === "C";
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
        // Actualización pura: nunca mutar objetos del estado anterior.
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
            valorLiteral: valor === "none" ? undefined : valor,
            ...(valor !== "none" ? { valor: 0 } : {}),
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

  const { isStreaming, activeStudentId, streamingContent, handleGenerateAI } =
    useNotasAiFeedback({
      cursoNombre,
      evaluacionNombre,
      notas,
      onCommit: (studentId, text) => handleNotaChange(studentId, text, "comentario"),
    });

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
      toast.info("No se han registrado cambios para guardar");
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
          toast.success(res.success);
          localStorage.removeItem(`notas_draft_${evaluacionId}`);
          router.refresh();
        } else {
          isSavingRef.current = false;
          toast.error(res.error || "Error al registrar calificaciones");
        }
      } catch (error) {
        isSavingRef.current = false;
        toast.error("Ocurrió un error inesperado al guardar las calificaciones");
      }
    });
  }, [notas, evaluacionId, cursoId, router]);

  // Effect Event: siempre ve el handleGuardar más reciente sin resuscribir el
  // listener global de teclado en cada cambio de notas.
  const handleSaveShortcut = useEffectEvent(() => {
    handleGuardar();
  });

  // Atajo de teclado global para guardar (Ctrl + S)
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

  // Calcular estadísticas dinámicas en tiempo real
  const stats = useNotasStats(estudiantes, notas, escala);

  return (
    <div className="space-y-6 w-full mx-auto pb-10">
      {/* Banner de Borrador No Guardado */}
      {draftToRestore && (
        <NotasDraftBanner onRestore={restoreDraft} onDiscard={discardDraft} />
      )}

      <NotasFormHeader
        escala={escala}
        isPending={isPending}
        isDirty={isDirty}
        onGuardar={handleGuardar}
      />

      <NotasFormStats
        total={stats.total}
        calificados={stats.calificados}
        pendientes={stats.pendientes}
        promedio={stats.promedio}
        distribucion={stats.distribucion}
        escala={escala}
        searchValue={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <NotasTable isEmpty={estudiantesFiltrados.length === 0}>
        {estudiantesFiltrados.map((est, index) => (
          <NotasTableRow
            key={est.id}
            estudiante={est}
            index={index}
            escala={escala}
            notaData={notas[est.id]}
            onNotaChange={handleNotaChange}
            onGenerateAI={handleGenerateAI}
            isStreaming={isStreaming}
            streamingContent={streamingContent(est.id)}
            isActiveForAI={activeStudentId === est.id}
            onKeyDown={handleInputKeyDown}
            isModified={isRowModified(est.id)}
          />
        ))}
      </NotasTable>

      {/* Barra Didáctica de Atajos de Teclado */}
      <NotasKeyboardBar />
    </div>
  );
}
