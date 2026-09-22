"use client";

import { useState } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { BLOQUES_HORARIO } from "@/lib/constants";
import { upsertHorarioAction } from "@/actions/schedules";
import { Horario } from "./schedule-types";

interface UseScheduleDndProps {
  horarios: Horario[];
  setHorarios: React.Dispatch<React.SetStateAction<Horario[]>>;
  onRefetch: () => void;
}

export function useScheduleDnd({
  horarios,
  setHorarios,
  onRefetch,
}: UseScheduleDndProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const draggedHorario = horarios.find((h) => h.id === active.id);
    if (!draggedHorario) return;

    const overIdStr = String(over.id);
    const [diaStr, horaInicio] = overIdStr.split("-");
    const diaSemana = parseInt(diaStr);

    if (
      draggedHorario.diaSemana === diaSemana &&
      draggedHorario.horaInicio === horaInicio
    ) {
      return; // No change
    }

    const bloqueInfo = BLOQUES_HORARIO.find((b) => b.inicio === horaInicio);
    if (!bloqueInfo || bloqueInfo.tipo === "receso") {
      toast.error("No se puede mover a este bloque");
      return;
    }
    const horaFin = bloqueInfo.fin;

    // Verificar si ya hay un bloque en la celda destino
    const targetOccupant = horarios.find(
      (h) =>
        h.diaSemana === diaSemana &&
        h.horaInicio === horaInicio &&
        h.id !== active.id,
    );

    const oldDia = draggedHorario.diaSemana;
    const oldHoraInicio = draggedHorario.horaInicio;
    const oldHoraFin = draggedHorario.horaFin;

    if (targetOccupant && targetOccupant.cursoId === draggedHorario.cursoId) {
      toast.error("El mismo curso ya está asignado en este bloque.");
      return;
    }

    // Optimistic Update: Swap si hay ocupante, o simplemente mover
    const previousHorarios = [...horarios];
    setHorarios((prev) =>
      prev.map((h) => {
        if (h.id === active.id) {
          return { ...h, diaSemana, horaInicio, horaFin };
        }
        if (targetOccupant && h.id === targetOccupant.id) {
          return {
            ...h,
            diaSemana: oldDia,
            horaInicio: oldHoraInicio,
            horaFin: oldHoraFin,
          };
        }
        return h;
      }),
    );

    try {
      const resA = await upsertHorarioAction(
        {
          diaSemana,
          horaInicio,
          horaFin,
          cursoId: draggedHorario.cursoId,
          aula: draggedHorario.aula,
        },
        draggedHorario.id,
      );

      let resB: { error?: string | null } = { error: null };
      if (targetOccupant) {
        resB = await upsertHorarioAction(
          {
            diaSemana: oldDia,
            horaInicio: oldHoraInicio,
            horaFin: oldHoraFin,
            cursoId: targetOccupant.cursoId,
            aula: targetOccupant.aula,
          },
          targetOccupant.id,
        );
      }

      if (resA.error || resB.error) {
        toast.error(resA.error || resB.error);
        setHorarios(previousHorarios); // Revert
      } else {
        toast.success(
          targetOccupant ? "Horarios intercambiados" : "Horario reasignado",
        );
      }
    } catch {
      toast.error("Error de conexión");
      setHorarios(previousHorarios); // Revert
    }
  };

  const handleDuplicate = async (slotToDuplicate: Horario) => {
    // Validar límite de horas
    const cursoId = slotToDuplicate.cursoId;
    const horasSemanales = slotToDuplicate.curso?.horasSemanales || 0;

    if (horasSemanales > 0) {
      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };
      const horasRegistradas = horarios
        .filter((h) => h.cursoId === cursoId)
        .reduce((acc, curr) => {
          const duracionMin = toMin(curr.horaFin) - toMin(curr.horaInicio);
          return acc + Math.round(duracionMin / 45);
        }, 0);

      const duracionMinDuplicate =
        toMin(slotToDuplicate.horaFin) - toMin(slotToDuplicate.horaInicio);
      const horasNuevas = Math.round(duracionMinDuplicate / 45);

      if (horasRegistradas + horasNuevas > horasSemanales) {
        toast.error(
          `No se puede duplicar. El curso ya alcanzó sus ${horasSemanales} horas semanales.`,
        );
        return;
      }
    }

    // Buscar el primer bloque libre
    let newDia = -1;
    let newHoraInicio = "";
    let newHoraFin = "";

    for (let dia = 1; dia <= 5; dia++) {
      for (const bloque of BLOQUES_HORARIO) {
        if (bloque.tipo === "receso") continue;

        // Verificar si está ocupado
        const isOccupied = horarios.some(
          (h) => h.diaSemana === dia && h.horaInicio === bloque.inicio,
        );
        if (!isOccupied) {
          newDia = dia;
          newHoraInicio = bloque.inicio;
          newHoraFin = bloque.fin;
          break;
        }
      }
      if (newDia !== -1) break;
    }

    if (newDia === -1) {
      toast.error(
        "No hay bloques libres en la semana para duplicar este curso.",
      );
      return;
    }

    const newHorarioId = `temp-${Date.now()}`;
    const newHorario = {
      ...slotToDuplicate,
      id: newHorarioId,
      diaSemana: newDia,
      horaInicio: newHoraInicio,
      horaFin: newHoraFin,
    };

    // Optimistic Update
    setHorarios((prev) => [...prev, newHorario]);

    try {
      const res = await upsertHorarioAction({
        diaSemana: newDia,
        horaInicio: newHoraInicio,
        horaFin: newHoraFin,
        cursoId: slotToDuplicate.cursoId,
        aula: slotToDuplicate.aula,
      });

      if (res.error) {
        toast.error(res.error);
        setHorarios((prev) => prev.filter((h) => h.id !== newHorarioId)); // Revert
      } else {
        toast.success("Bloque duplicado exitosamente");
        onRefetch(); // Refetch to get the real ID from DB
      }
    } catch {
      toast.error("Error al duplicar el horario");
      setHorarios((prev) => prev.filter((h) => h.id !== newHorarioId)); // Revert
    }
  };

  return { activeId, sensors, handleDragStart, handleDragEnd, handleDuplicate };
}
