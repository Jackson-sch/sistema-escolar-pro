import {
  IconCash,
  IconDeviceMobile,
  IconCreditCard,
  IconBuildingBank,
} from "@tabler/icons-react";

export interface CronogramaItem {
  id: string;
  conceptoId: string;
  conceptoNombre: string;
  mes?: number | null;
  montoBase: number;
  moraAcumulada: number;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  fechaVencimiento: Date | string;
  estado: "PAID" | "PENDING" | "EXPIRED" | "PARTIALLY_PAID";
  pagado: boolean;
  diasVencido: number;
}

export interface StudentCobroData {
  student: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    dni?: string;
    image?: string;
    codigoEstudiante?: string;
    codigoSiagie?: string;
    nivelAcademico?: any;
  };
  primaryGuardian?: {
    id: string;
    name: string;
    apellidoPaterno?: string;
    dni?: string;
    telefono?: string;
    email?: string;
  } | null;
  cronogramas: CronogramaItem[];
  resumen: {
    totalDeudaVencida: number;
    totalPorCobrarAnio: number;
    totalCobrado: number;
    cuotasPendientesCount: number;
    cuotasVencidasCount: number;
  };
  nextNumeroBoleta: string;
}

export const METODOS_PAGO = [
  {
    id: "Efectivo",
    label: "Efectivo",
    icon: IconCash,
    color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "Yape",
    label: "Yape",
    icon: IconDeviceMobile,
    color: "text-purple-600 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "Plin",
    label: "Plin",
    icon: IconDeviceMobile,
    color: "text-sky-600 bg-sky-500/10 border-sky-500/30",
  },
  {
    id: "Tarjeta POS",
    label: "Tarjeta POS",
    icon: IconCreditCard,
    color: "text-blue-600 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "Transferencia",
    label: "Transferencia",
    icon: IconBuildingBank,
    color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
  },
];
