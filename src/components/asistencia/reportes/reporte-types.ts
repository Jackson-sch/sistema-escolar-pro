import {
  getMonthlyAsistenciaReportAction,
  getAttendanceAlertsAction,
  getInstitutionalSummaryAction,
  getStudentAnnualAttendanceAction,
  getJustificacionesAction,
} from "@/actions/attendance";

export interface InstReportData {
  data: any[];
  stats?: any;
  trendData?: any[];
  meta?: any;
}

export interface ReportResultsState {
  reportData: any[];
  daysInMonth: number;
  alertsData: any[];
  instData: InstReportData;
  studentData: any[];
  justificationsData: any[];
}

export type ReportResultsAction =
  | { type: "RESET" }
  | { type: "SET_REPORT"; data: any[]; days: number }
  | { type: "SET_ALERTS"; data: any[] }
  | { type: "SET_INST"; inst: InstReportData }
  | { type: "SET_STUDENT"; data: any[] }
  | { type: "SET_JUSTIFICATIONS"; data: any[] };

export const reportResultsInitialState: ReportResultsState = {
  reportData: [],
  daysInMonth: 0,
  alertsData: [],
  instData: { data: [] },
  studentData: [],
  justificationsData: [],
};

export function reportResultsReducer(
  state: ReportResultsState,
  action: ReportResultsAction,
): ReportResultsState {
  switch (action.type) {
    case "RESET":
      return { ...reportResultsInitialState };
    case "SET_REPORT":
      return { ...state, reportData: action.data, daysInMonth: action.days };
    case "SET_ALERTS":
      return { ...state, alertsData: action.data };
    case "SET_INST":
      return { ...state, instData: action.inst };
    case "SET_STUDENT":
      return { ...state, studentData: action.data };
    case "SET_JUSTIFICATIONS":
      return { ...state, justificationsData: action.data };
    default:
      return state;
  }
}

export type ReportFetchResult =
  | { ok: true; action: ReportResultsAction }
  | { ok: false; error: string };

export interface ReportFetchParams {
  seccionId: string;
  mes: number;
  anio: number;
  nivelId: string;
  gradoId: string;
  rPeriod: "today" | "month" | "year";
  studentId: string;
}

export async function fetchReportData(
  reportType: string,
  p: ReportFetchParams,
): Promise<ReportFetchResult> {
  if (reportType === "mensual") {
    if (!p.seccionId) return { ok: false, error: "" };
    const res = await getMonthlyAsistenciaReportAction(
      p.seccionId,
      p.mes,
      p.anio,
    );
    if (res.data && res.meta)
      return {
        ok: true,
        action: {
          type: "SET_REPORT",
          data: res.data,
          days: res.meta.totalDias,
        },
      };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "alertas") {
    const res = await getAttendanceAlertsAction(
      p.anio,
      p.seccionId === "all" ? undefined : p.seccionId,
      p.nivelId || undefined,
      p.gradoId || undefined,
    );
    if (res.data)
      return { ok: true, action: { type: "SET_ALERTS", data: res.data } };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "institucional") {
    const res = await getInstitutionalSummaryAction(
      new Date(),
      p.nivelId || undefined,
      p.gradoId || undefined,
      p.mes,
      p.anio,
      p.rPeriod,
    );
    if (res.data)
      return {
        ok: true,
        action: {
          type: "SET_INST",
          inst: {
            data: res.data,
            stats: res.stats,
            trendData: res.trendData,
            meta: res.meta,
          },
        },
      };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "individual") {
    if (!p.studentId) return { ok: false, error: "" };
    const res = await getStudentAnnualAttendanceAction(p.studentId, p.anio);
    if (res.data)
      return { ok: true, action: { type: "SET_STUDENT", data: res.data } };
    if (res.error) return { ok: false, error: res.error };
  } else if (reportType === "justificaciones") {
    const res = await getJustificacionesAction(
      p.anio,
      p.seccionId === "all" ? undefined : p.seccionId,
      p.nivelId || undefined,
      p.gradoId || undefined,
    );
    if (res.data)
      return {
        ok: true,
        action: { type: "SET_JUSTIFICATIONS", data: res.data },
      };
    if (res.error) return { ok: false, error: res.error };
  }

  return { ok: false, error: "" };
}

export interface AsistenciaReportesProps {
  initialSecciones: any[];
  aniosAcademicos: number[];
  defaultYear: number;
  profesorId?: string;
}
