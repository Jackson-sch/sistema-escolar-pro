import { exportGradesEvaluationExcel } from "./excel/templates/grades-evaluation";

interface StudentGradeExportData {
  codigoEstudiante: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  nota: number | string;
  comentario?: string;
}

export async function exportEvaluacionToExcel({
  evaluacionNombre,
  cursoNombre,
  estudiantes,
}: {
  evaluacionNombre: string;
  cursoNombre: string;
  estudiantes: StudentGradeExportData[];
}) {
  await exportGradesEvaluationExcel({
    evaluacionNombre,
    cursoNombre,
    estudiantes,
  });
}
