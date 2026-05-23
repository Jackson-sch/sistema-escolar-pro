export interface VariableSistema {
  id: string;
  clave: string;
  valor: string;
  tipo: string;
  descripcion?: string | null;
  seccion?: string | null;
  activo: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
