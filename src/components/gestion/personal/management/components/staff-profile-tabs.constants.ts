import {
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconPhone,
  IconHeartbeat,
} from "@tabler/icons-react";

export const STAFF_TABS = [
  { id: "personal", label: "Datos Personales", icon: IconUser },
  { id: "laboral", label: "Datos Laborales", icon: IconBriefcase },
  { id: "academico", label: "Perfil Académico", icon: IconCertificate },
  { id: "contacto", label: "Contacto", icon: IconPhone },
  { id: "emergencia", label: "Emergencia", icon: IconHeartbeat },
] as const;

export type StaffTabId = (typeof STAFF_TABS)[number]["id"];
