"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { EstudianteType, NotaData } from "../notas-form-types";

export function useNotasAiFeedback({
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
      toast.success("✓ Conclusión descriptiva generada");
    },
  } as any);

  const isStreaming = status === "streaming" || status === "submitted";

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
      toast.error(
        "Ingresa una calificación antes de generar la conclusión descriptiva",
      );
      return;
    }

    setActiveStudentId(est.id);
    setMessages([]);

    (sendMessage as any)({
      text: `Genera una conclusión descriptiva curricular concisa (máximo 25 palabras) en formato CNEB/SIAGIE para el alumno ${est.name} ${est.apellidoPaterno} que obtuvo ${
        notaData.valorLiteral
          ? `Nivel de logro "${notaData.valorLiteral}"`
          : `calificación ${notaData.valor}/20`
      } en ${evaluacionNombre} (${cursoNombre}). Incluye fortalezas y recomendaciones pedagógicas. Directo al grano sin encabezados.`,
    });
  };

  return { isStreaming, activeStudentId, streamingContent, handleGenerateAI };
}
