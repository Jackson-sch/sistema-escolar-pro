export interface AreaCurricular {
  id: string;
  nombre: string;
}

export interface Grado {
  id: string;
  nombre: string;
}

export interface NivelAcademico {
  id: string;
  grado: Grado;
  nivel: { id: string; nombre: string };
  seccion: string;
  aulaAsignada?: string | null;
}

export interface HorarioResumen {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  aula?: string | null;
}

export interface CursoDocente {
  id: string;
  nombre: string;
  codigo?: string;
  areaCurricular: AreaCurricular;
  nivelAcademico: NivelAcademico;
  isTutor?: boolean;
  horarios?: HorarioResumen[];
  attendanceStatusToday?: "completed" | "pending" | "not_scheduled";
  pendingGradesCount?: number;
  _count?: { estudiantes: number };
}

export interface EvaluacionDocente {
  id: string;
  fecha: string | Date;
  curso: {
    id?: string;
    nombre: string;
    codigo?: string;
    areaCurricular: AreaCurricular;
    nivelAcademico: { grado: Grado; seccion: string };
  };
  tipoEvaluacion: { nombre: string };
}

export interface AlertaAsistencia {
  id: string;
  fecha: string | Date;
  estudiante: { name?: string | null; apellidoPaterno?: string | null };
}

export interface HorarioDocente {
  id: string;
  diaSemana?: number;
  horaInicio: string;
  horaFin: string;
  aula?: string | null;
  curso: {
    id?: string;
    nombre: string;
    codigo?: string;
    areaCurricular: AreaCurricular;
    nivelAcademico: { id?: string; grado: Grado; seccion: string; aulaAsignada?: string | null };
  };
}

export interface TeacherDashboardData {
  cursos: CursoDocente[];
  totalUniqueStudents?: number;
  upcomingEvaluations: EvaluacionDocente[];
  criticalAttendance: AlertaAsistencia[];
  evaluationsToGrade: EvaluacionDocente[];
  todaySchedule: HorarioDocente[];
  weeklySchedule?: HorarioDocente[];
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}
