"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { registrarNotasMasivasAction } from "@/actions/evaluations";
import { cn } from "@/lib/utils";

// Nuevos Componentes
import { NotasFormHeader } from "./notas-form-header";
import { NotasFormStats } from "./notas-form-stats";
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

interface NotasFormProps {
  evaluacionId: string;
  cursoId: string;
  estudiantes: EstudianteType[];
  notasExistentes: Record<string, NotaData>;
  escala?: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
}

export function NotasForm({
  evaluacionId,
  cursoId,
  estudiantes,
  notasExistentes,
  escala = "VIGESIMAL",
}: NotasFormProps) {
  const [notas, setNotas] = useState<Record<string, NotaData>>(notasExistentes);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const isLiteral = escala === "LITERAL";

  // Filtrado de estudiantes
  const estudiantesFiltrados = estudiantes.filter(
    (est) =>
      `${est.name} ${est.apellidoPaterno} ${est.apellidoMaterno}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (est.codigoEstudiante &&
        est.codigoEstudiante.toLowerCase().includes(search.toLowerCase())),
  );

  const handleNotaChange = (
    estudianteId: string,
    valor: string,
    type: "valor" | "valorLiteral" | "comentario",
  ) => {
    const currentNota = notas[estudianteId] || { valor: 0 };
    const newNotas = { ...notas };

    if (type === "valor") {
      const numValue = parseFloat(valor);
      currentNota.valor = isNaN(numValue) ? 0 : numValue;
    } else if (type === "valorLiteral") {
      currentNota.valorLiteral = valor === "none" ? undefined : valor;
      if (valor !== "none") currentNota.valor = 0;
    } else if (type === "comentario") {
      currentNota.comentario = valor === "" ? undefined : valor;
    }

    // Solo eliminar si ya no hay ningún dato
    if (
      currentNota.valor === 0 &&
      !currentNota.valorLiteral &&
      !currentNota.comentario
    ) {
      delete newNotas[estudianteId];
    } else {
      newNotas[estudianteId] = { ...currentNota };
    }

    setNotas(newNotas);
  };

  const { messages, sendMessage, status, setMessages } = useChat({
    onFinish: () => {
      setActiveStudentId(null);
      toast.success("Feedback completado");
    },
  });

  const isStreaming = status === "streaming" || status === "submitted";
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  // Sincronizar el streaming con el estado global de notas en tiempo real
  useEffect(() => {
    if (activeStudentId && isStreaming) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");

      if (lastAssistantMessage) {
        const text =
          (lastAssistantMessage as any).content ||
          lastAssistantMessage.parts
            ?.filter((p: any) => p.type === "text")
            ?.map((p: any) => p.text)
            ?.join("") ||
          "";

        if (text) {
          handleNotaChange(activeStudentId, text, "comentario");
        }
      }
    }
  }, [messages, isStreaming, activeStudentId]);

  const getStreamingContent = (studentId: string) => {
    if (activeStudentId === studentId) {
      const lastAssistantMessage = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");

      if (lastAssistantMessage) {
        const text =
          (lastAssistantMessage as any).content ||
          lastAssistantMessage.parts
            ?.filter((p: any) => p.type === "text")
            ?.map((p: any) => p.text)
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

    sendMessage({
      text: `Genera un breve comentario (máximo 3 líneas) para el reporte académico de:
        Nombre: ${est.name} ${est.apellidoPaterno}
        Calificación: ${
          notaData.valorLiteral ? notaData.valorLiteral : notaData.valor + "/20"
        }
        El tono debe ser profesional y alentador.`,
    });
  };

  const handleGuardar = () => {
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

    startTransition(async () => {
      const res = await registrarNotasMasivasAction(
        evaluacionId,
        cursoId,
        notasArray as any,
      );
      if (res.success) toast.success(res.success);
      if (res.error) toast.error(res.error);
    });
  };

  // Estadísticas
  const calificados = Object.keys(notas).length;
  const pendientes = estudiantes.length - calificados;

  return (
    <div className="space-y-8 w-full mx-auto pb-10">
      <NotasFormHeader
        escala={escala}
        isPending={isPending}
        onGuardar={handleGuardar}
      />

      <NotasFormStats
        total={estudiantes.length}
        aprobados={calificados}
        desaprobados={pendientes}
        searchValue={search}
        onSearchChange={setSearch}
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
            streamingContent={getStreamingContent(est.id)}
            isActiveForAI={activeStudentId === est.id}
          />
        ))}
      </NotasTable>
    </div>
  );
}
