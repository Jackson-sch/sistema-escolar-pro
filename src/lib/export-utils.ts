import * as XLSX from 'xlsx';

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx)
 * @param data Array de objetos con los datos a exportar
 * @param fileName Nombre del archivo (sin extensión)
 * @param sheetName Nombre de la hoja de cálculo
 */
export function exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generar buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  // Guardar archivo
  const fullFileName = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Nota: saveAs es una librería cliente, en Next.js App Router 
  // esto debe llamarse desde un Client Component
  try {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fullFileName;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error('Error al descargar el archivo Excel:', err);
  }
}

/**
 * Formatea los datos del cronograma para exportación Excel
 */
export function formatCronogramaForExcel(cronograma: any[]) {
  return cronograma.map(item => ({
    Estudiante: `${item.estudiante.apellidoPaterno} ${item.estudiante.apellidoMaterno}, ${item.name}`,
    Concepto: item.concepto.nombre,
    Vencimiento: new Date(item.fechaVencimiento).toLocaleDateString(),
    'Monto Original': item.monto,
    'Mora Acumulada': item.moraAcumulada || 0,
    Total: Number(item.monto) + Number(item.moraAcumulada || 0),
    Pagado: item.montoPagado,
    Pendiente: (Number(item.monto) + Number(item.moraAcumulada || 0)) - Number(item.montoPagado),
    Estado: item.pagado ? 'Pagado' : (new Date(item.fechaVencimiento) < new Date() ? 'Vencido' : 'Pendiente')
  }));
}
