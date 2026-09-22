export interface AbsentStudentAlert {
  id: string;
  asistenciaId: string;
  estudianteId: string;
  nombreCompleto: string;
  dni?: string;
  image?: string;
  aula: string;
  tipoFalta: "INASISTENCIA" | "TARDANZA";
  horaRegistro?: string;
  justificado: boolean;
  apoderadoNombre?: string;
  apoderadoTelefono?: string;
  apoderadoEmail?: string;
  whatsappDirectUrl: string;
}

export interface DuePensionAlert {
  id: string;
  cronogramaId: string;
  estudianteId: string;
  nombreEstudiante: string;
  aula: string;
  concepto: string;
  monto: number;
  saldoPendiente: number;
  fechaVencimiento: Date;
  diasRestantes: number;
  esVencido: boolean;
  apoderadoNombre?: string;
  apoderadoTelefono?: string;
  apoderadoEmail?: string;
  whatsappDirectUrl: string;
}
