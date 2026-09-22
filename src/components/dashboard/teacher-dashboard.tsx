"use client";

import { useMemo } from "react";
import {
  TeacherDashboardData,
  HorarioDocente,
  parseTimeToMinutes,
} from "./teacher/teacher-types";
import { TeacherHeroBanner } from "./teacher/teacher-hero-banner";
import { TeacherSpotlightSession } from "./teacher/teacher-spotlight-session";
import { TeacherKPIsSection } from "./teacher/teacher-kpis-section";
import { TeacherCoursesSection } from "./teacher/teacher-courses-section";
import { TeacherScheduleSection } from "./teacher/teacher-schedule-section";
import { TeacherEvaluationsTray } from "./teacher/teacher-evaluations-tray";
import { TeacherAttendanceRadar } from "./teacher/teacher-attendance-radar";
import { TeacherShortcuts } from "./teacher/teacher-shortcuts";

export interface TeacherDashboardProps {
  data: TeacherDashboardData;
}

function calculateTotalStudents(cursos: any[], totalUniqueStudents?: number): number {
  if (totalUniqueStudents != null) return totalUniqueStudents;
  return cursos.reduce(
    (acc, curso) => Math.max(acc, curso._count?.estudiantes || 0),
    0
  );
}

function useClassSchedule(todaySchedule: HorarioDocente[]) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return useMemo(() => {
    let active: HorarioDocente | null = null;
    let next: HorarioDocente | null = null;
    let completed = 0;

    const sorted = [...todaySchedule].sort(
      (a, b) =>
        parseTimeToMinutes(a.horaInicio) - parseTimeToMinutes(b.horaInicio)
    );

    for (const item of sorted) {
      const start = parseTimeToMinutes(item.horaInicio);
      const end = parseTimeToMinutes(item.horaFin);

      if (currentMinutes >= start && currentMinutes <= end) {
        active = item;
      } else if (currentMinutes < start && !next) {
        next = item;
      } else if (currentMinutes > end) {
        completed += 1;
      }
    }

    return {
      activeClass: active,
      nextClass: next,
      completedClassesCount: completed,
      currentMinutes,
    };
  }, [todaySchedule, currentMinutes]);
}

export function TeacherDashboard({ data }: TeacherDashboardProps) {
  const {
    cursos,
    totalUniqueStudents,
    upcomingEvaluations,
    criticalAttendance,
    evaluationsToGrade,
    todaySchedule,
  } = data;

  const totalStudents = calculateTotalStudents(cursos, totalUniqueStudents);

  const fechaHoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });

  const availableLevels = useMemo(() => {
    const levelsMap = new Map<string, string>();
    cursos.forEach((c) => {
      const lvl = c.nivelAcademico?.nivel;
      if (lvl?.id && lvl?.nombre) {
        levelsMap.set(lvl.id, lvl.nombre);
      }
    });
    return Array.from(levelsMap.entries()).map(([id, nombre]) => ({
      id,
      nombre,
    }));
  }, [cursos]);

  const { activeClass, nextClass, completedClassesCount, currentMinutes } =
    useClassSchedule(todaySchedule);

  const spotlightSession = activeClass || nextClass;
  const isCurrentlyActive = Boolean(activeClass);
  const levelsLabel = availableLevels.map((l) => l.nombre).join(" / ");

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Banner Principal con Saludo y Accesos */}
      <TeacherHeroBanner fechaHoy={fechaHoy} />

      {/* Sesión en Curso o Próxima de Hoy */}
      {todaySchedule.length > 0 && spotlightSession && (
        <TeacherSpotlightSession
          spotlightSession={spotlightSession}
          isCurrentlyActive={isCurrentlyActive}
        />
      )}

      {/* Indicadores Clave (KPIs) */}
      <TeacherKPIsSection
        totalStudents={totalStudents}
        cursosCount={cursos.length}
        levelsLabel={levelsLabel}
        todayScheduleLength={todaySchedule.length}
        completedClassesCount={completedClassesCount}
        evaluationsToGradeCount={evaluationsToGrade.length}
      />

      {/* Contenido Principal: Cursos (Izquierda) + Bandeja/Alertas (Derecha) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <TeacherCoursesSection
            cursos={cursos}
            availableLevels={availableLevels}
          />
          <TeacherScheduleSection
            todaySchedule={todaySchedule}
            weeklySchedule={data.weeklySchedule}
            currentMinutes={currentMinutes}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <TeacherEvaluationsTray
            evaluationsToGrade={evaluationsToGrade}
            upcomingEvaluations={upcomingEvaluations}
          />
          <TeacherAttendanceRadar criticalAttendance={criticalAttendance} />
          <TeacherShortcuts />
        </div>
      </div>
    </div>
  );
}
