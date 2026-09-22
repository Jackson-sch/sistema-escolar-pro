export type SiagieExportType = "notas" | "asistencia" | "consolidado";

export interface SiagieExportParams {
  nivelAcademicoId: string;
  periodoId: string;
  cursoId?: string;
}

export interface SiagieAttendanceExportParams {
  nivelAcademicoId: string;
  periodoId: string;
}

export interface SiagieBulkExportParams {
  periodoId: string;
  nivelNombre?: string;
  tipo: "notas" | "asistencia";
}

export interface SiagieExportResult {
  success?: boolean;
  fileName?: string;
  base64?: string;
  error?: string;
  totalSecciones?: number;
}

export interface SiagieStudentGrade {
  index: number;
  codigoEstudiante: string;
  tipoDocumento: string;
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  grades: Record<string, { nota: string | number; conclusion: string }>;
}

export interface SiagieStudentAttendance {
  index: number;
  codigoEstudiante: string;
  tipoDocumento: string;
  dni: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  asistencias: number;
  tardanzas: number;
  faltasJustificadas: number;
  faltasInjustificadas: number;
  totalDias: number;
  porcentajeAsistencia: number;
}

export interface SiagieCursoDef {
  id: string;
  nombre: string;
}

export interface SiagieSectionData {
  institucionName: string;
  codigoModular: string;
  sedeNombre?: string;
  nivelNombre: string;
  gradoNombre: string;
  seccionNombre: string;
  periodoNombre: string;
  anioEscolar: number;
  cursos: SiagieCursoDef[];
  estudiantes: SiagieStudentGrade[];
}

export interface SiagieAttendanceSectionData {
  institucionName: string;
  codigoModular: string;
  sedeNombre?: string;
  nivelNombre: string;
  gradoNombre: string;
  seccionNombre: string;
  periodoNombre: string;
  anioEscolar: number;
  estudiantes: SiagieStudentAttendance[];
}
