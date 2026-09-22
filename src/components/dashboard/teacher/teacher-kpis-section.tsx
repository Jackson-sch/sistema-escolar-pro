"use client";

import {
  IconUsers,
  IconBook,
  IconClock,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { TeacherKPIItem } from "./teacher-kpi-item";

interface TeacherKPIsSectionProps {
  totalStudents: number;
  cursosCount: number;
  levelsLabel: string;
  todayScheduleLength: number;
  completedClassesCount: number;
  evaluationsToGradeCount: number;
}

export function TeacherKPIsSection({
  totalStudents,
  cursosCount,
  levelsLabel,
  todayScheduleLength,
  completedClassesCount,
  evaluationsToGradeCount,
}: TeacherKPIsSectionProps) {
  const scheduleSubtitle =
    todayScheduleLength > 0
      ? `${completedClassesCount} de ${todayScheduleLength} completadas`
      : "Sin clases programadas";

  const scheduleProgress =
    todayScheduleLength > 0
      ? (completedClassesCount / todayScheduleLength) * 100
      : 0;

  const gradingSubtitle =
    evaluationsToGradeCount > 0
      ? "Evaluaciones con notas pendientes"
      : "¡Todo al día y calificado!";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <TeacherKPIItem
        title="Mis Estudiantes"
        value={totalStudents.toString()}
        subtitle={`${cursosCount} ${cursosCount === 1 ? "sección" : "secciones"} activas`}
        icon={IconUsers}
        color="indigo"
        badgeText="Total Activos"
      />
      <TeacherKPIItem
        title="Cursos a Cargo"
        value={cursosCount.toString()}
        subtitle={levelsLabel || "Asignaturas"}
        icon={IconBook}
        color="blue"
      />
      <TeacherKPIItem
        title="Sesiones de Hoy"
        value={todayScheduleLength.toString()}
        subtitle={scheduleSubtitle}
        icon={IconClock}
        color="purple"
        progress={scheduleProgress}
      />
      <TeacherKPIItem
        title="Por Calificar"
        value={evaluationsToGradeCount.toString()}
        subtitle={gradingSubtitle}
        icon={IconClipboardCheck}
        badgeText={evaluationsToGradeCount > 0 ? "Pendiente" : "Al día"}
        color={evaluationsToGradeCount > 0 ? "amber" : "emerald"}
      />
    </div>
  );
}
