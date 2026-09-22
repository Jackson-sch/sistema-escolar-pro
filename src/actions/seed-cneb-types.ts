export interface CnebCapacidadData {
  nombre: string;
  descripcion?: string;
}

export interface CnebCompetenciaData {
  nombre: string;
  descripcion?: string;
  capacidades: CnebCapacidadData[];
}

export interface CnebAreaData {
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  orden: number;
  competencias: CnebCompetenciaData[];
}
