import {
  IconUserCheck,
  IconPhoneCall,
  IconLayoutGrid,
  type Icon,
} from "@tabler/icons-react";

export type TeacherTabId = "profesional" | "contacto" | "cursos";

export interface TeacherTabConfig {
  id: TeacherTabId;
  label: string;
  description: string;
  icon: Icon;
  color: string;
}

export const TEACHER_PROFILE_TABS: TeacherTabConfig[] = [
  {
    id: "profesional",
    label: "Ficha Profesional & Personal",
    description: "Identidad personal, asignación laboral y escalafón docente.",
    icon: IconUserCheck,
    color: "bg-indigo-600 text-indigo-600",
  },
  {
    id: "contacto",
    label: "Contacto & Emergencia",
    description: "Teléfonos, correo institucional, domicilio y contactos de auxilio.",
    icon: IconPhoneCall,
    color: "bg-emerald-600 text-emerald-600",
  },
  {
    id: "cursos",
    label: "Mis Asignaturas",
    description: "Aulas asignadas, secciones a cargo y distribución horaria.",
    icon: IconLayoutGrid,
    color: "bg-amber-600 text-amber-600",
  },
];
