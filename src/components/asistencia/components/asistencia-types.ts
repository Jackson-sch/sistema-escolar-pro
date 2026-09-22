export interface SeccionAsistencia {
  id: string;
  seccion?: string;
  turno?: string | null;
  nivel?: { id: string; nombre: string } | null;
  grado?: { id: string; nombre: string } | null;
  tutor?: { id: string } | null;
  cursos?: any[];
}

export interface AlumnoAsistencia {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  image?: string | null;
  estado: string;
  justificacion: string;
}

export interface AsistenciaClientProps {
  initialSecciones: SeccionAsistencia[];
  aniosAcademicos: number[];
  defaultYear: number;
  profesorId?: string;
}
