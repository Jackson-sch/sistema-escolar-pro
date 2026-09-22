export interface Section {
  id: string;
  seccion: string;
  grado: { id: string; nombre: string };
  nivel: { id: string; nombre: string };
}

export interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  cursoId: string;
  aula?: string | null;
  curso?: { id: string; horasSemanales?: number | null };
}

export interface ScheduleCourse {
  id: string;
  nombre: string;
  nivelAcademicoId: string;
  horasSemanales?: number | null;
  profesor?: { name: string; apellidoPaterno: string } | null;
}

export interface ScheduleManagerProps {
  secciones: Section[];
  allCourses: ScheduleCourse[];
  selectedYear: number;
}
