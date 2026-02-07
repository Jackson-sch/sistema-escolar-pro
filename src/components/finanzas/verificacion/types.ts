export interface Comprobante {
  id: string;
  archivoUrl: string;
  monto: number;
  bancoOrigen: string | null;
  numeroOperacion: string | null;
  fechaOperacion: string;
  estado: string;
  createdAt: string;
  cronograma: {
    monto: number;
    concepto: { nombre: string };
    estudiante: {
      name: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      nivelAcademico: {
        grado: { nombre: string };
        nivel: { nombre: string };
      } | null;
    };
  };
  padre: {
    name: string;
    email: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}
