export interface SeccionPromocion {
  id: string;
  seccion?: string;
  nivel?: { id: string; nombre: string } | null;
  grado?: { nombre: string } | null;
}

export interface EstudiantePromocion {
  id: string;
  name?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  dni?: string | null;
  documentoIdentidad?: string | null;
}

export interface PromocionesViewProps {
  aniosDisponibles: number[];
  seccionesOrigen: SeccionPromocion[];
  seccionesDestino: SeccionPromocion[];
  grados: unknown[];
  anioOrigen: number;
  anioDestino: number;
  institucionId: string;
}

export type ActiveTab = "auditoria" | "mapeo" | "ejecucion";

export const VALIDATION_ITEMS = [
  {
    id: "grades",
    label: "Cierre de Calificaciones",
    description: "Promedios anuales y actas finales de notas registradas.",
    status: "complete",
    detail: "100% registros completados",
  },
  {
    id: "attendance",
    label: "Control de Asistencia",
    description: "Cierre de partes diarios y justificaciones procesadas.",
    status: "complete",
    detail: "Cierre de año validado",
  },
  {
    id: "finance",
    label: "Solvencia Estudiantil",
    description: "Sincronización de morosidad y estados de pensión.",
    status: "warning",
    detail: "3 pensiones en revisión",
  },
];
