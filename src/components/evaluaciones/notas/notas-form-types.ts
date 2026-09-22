export interface EstudianteType {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codigoEstudiante: string | null;
}

export interface NotaData {
  valor: number;
  valorLiteral?: string;
  comentario?: string;
}

export type EscalaType = "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";

export interface NotasFormProps {
  evaluacionId: string;
  cursoId: string;
  estudiantes: EstudianteType[];
  notasExistentes: Record<string, NotaData>;
  escala?: EscalaType;
  cursoNombre?: string;
  evaluacionNombre?: string;
}
