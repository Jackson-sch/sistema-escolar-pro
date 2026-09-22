import {
  IconSchool,
  IconClipboardCheck,
  IconCalendarCheck,
  IconUsers,
  IconReceipt,
  IconSpeakerphone,
  IconUserPlus,
  IconShieldLock,
  type Icon,
} from "@tabler/icons-react";

export interface PermisoItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  modulo: string | null;
  activo: boolean;
}

export interface CargoItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  jerarquia: number | null;
  activo: boolean;
  permisos: {
    permisoId: string;
    permiso: {
      id: string;
      codigo: string;
      modulo: string | null;
    };
  }[];
  _count: {
    usuarios: number;
  };
}

export interface PermissionsMatrixData {
  cargos: CargoItem[];
  permisos: PermisoItem[];
}

export interface ModuleTheme {
  icon: Icon;
  badgeBg: string;
  badgeText: string;
  border: string;
  accent: string;
}

export const MODULE_THEMES: Record<string, ModuleTheme> = {
  Académico: {
    icon: IconSchool,
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    accent: "text-blue-500",
  },
  Evaluaciones: {
    icon: IconClipboardCheck,
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    accent: "text-indigo-500",
  },
  Asistencia: {
    icon: IconCalendarCheck,
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    accent: "text-emerald-500",
  },
  Estudiantes: {
    icon: IconUsers,
    badgeBg: "bg-cyan-500/10",
    badgeText: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/20",
    accent: "text-cyan-500",
  },
  Finanzas: {
    icon: IconReceipt,
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    accent: "text-amber-500",
  },
  Comunicaciones: {
    icon: IconSpeakerphone,
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    accent: "text-rose-500",
  },
  Personal: {
    icon: IconUserPlus,
    badgeBg: "bg-teal-500/10",
    badgeText: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
    accent: "text-teal-500",
  },
  Seguridad: {
    icon: IconShieldLock,
    badgeBg: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    accent: "text-violet-500",
  },
};
