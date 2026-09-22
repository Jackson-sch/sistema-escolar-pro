export interface ScanNotificationInfo {
  notified: boolean;
  channels?: ("WHATSAPP" | "EMAIL" | "SMS")[];
  parentsCount?: number;
  dispatchedCount?: number;
  reason?: string;
  pending?: boolean;
}

export type ScannerMode = "ingreso" | "salida";

export interface AuthorizedGuardian {
  id: string;
  name: string;
  parentesco: string;
  dni?: string | null;
  telefono?: string | null;
  image?: string | null;
  autorizadoRecoger: boolean;
  esContactoEmergencia?: boolean;
}

export interface ScanLog {
  id: string;
  studentName: string;
  dni: string | null;
  time: string;
  status: "success" | "late" | "warning" | "error";
  image?: string;
  aula?: string;
  grado?: string;
  seccion?: string;
  notification?: ScanNotificationInfo;
  mode?: ScannerMode;
  horaSalida?: string;
  authorizedGuardians?: AuthorizedGuardian[];
}

export interface ScanStats {
  total: number;
  puntuales: number;
  tardanzas: number;
  salidas?: number;
}


export interface StudentScanDetail {
  name: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni: string | null;
  image?: string;
  nivel?: string;
}

export interface AttendanceNotificationConfig {
  enabled: boolean;
  notifyOnPuntual: boolean;
  notifyOnTardanza: boolean;
  channels: ("WHATSAPP" | "EMAIL" | "SMS")[];
}

export const DEFAULT_ATTENDANCE_NOTIF_CONFIG: AttendanceNotificationConfig = {
  enabled: true,
  notifyOnPuntual: true,
  notifyOnTardanza: true,
  channels: ["WHATSAPP", "EMAIL"],
};
