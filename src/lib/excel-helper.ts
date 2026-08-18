import XLSX from "xlsx-js-style";

interface StudentGradeExportData {
  codigoEstudiante: string | null;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  nota: number | string;
  comentario?: string;
}

export function exportEvaluacionToExcel({
  evaluacionNombre,
  cursoNombre,
  estudiantes,
}: {
  evaluacionNombre: string;
  cursoNombre: string;
  estudiantes: StudentGradeExportData[];
}) {
  const data = estudiantes.map((e, index) => ({
    "#": index + 1,
    "Código": e.codigoEstudiante || "",
    "Apellido Paterno": e.apellidoPaterno,
    "Apellido Materno": e.apellidoMaterno,
    "Nombres": e.nombre,
    "Nota": e.nota,
    "Observaciones / Feedback": e.comentario || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Notas");

  // Ajustar anchos de columnas
  worksheet["!cols"] = [
    { wch: 5 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 10 },
    { wch: 30 },
  ];

  const fileName = `Notas_${cursoNombre.replace(/\s+/g, "_")}_${evaluacionNombre.replace(/\s+/g, "_")}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
