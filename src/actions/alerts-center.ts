"use server";

import {
  getDailyAbsenceAlertsAction as _getDailyAbsenceAlertsAction,
  sendBulkAbsenceAlertsAction as _sendBulkAbsenceAlertsAction,
} from "./alerts-center/absence-alerts";

import {
  getUpcomingDuePensionsAlertsAction as _getUpcomingDuePensionsAlertsAction,
  sendBulkPensionsAlertsAction as _sendBulkPensionsAlertsAction,
} from "./alerts-center/pension-alerts";

import { sendBroadcastMessageAction as _sendBroadcastMessageAction } from "./alerts-center/broadcast-alerts";

export async function getDailyAbsenceAlertsAction(fechaStr?: string) {
  return _getDailyAbsenceAlertsAction(fechaStr);
}

export async function sendBulkAbsenceAlertsAction(params: {
  studentAlertIds: string[];
  canal?: "WHATSAPP" | "SMS" | "EMAIL";
}) {
  return _sendBulkAbsenceAlertsAction(params);
}

export async function getUpcomingDuePensionsAlertsAction(
  diasAnticipacion: number = 5,
) {
  return _getUpcomingDuePensionsAlertsAction(diasAnticipacion);
}

export async function sendBulkPensionsAlertsAction(params: {
  cronogramaIds: string[];
  canal?: "WHATSAPP" | "SMS" | "EMAIL";
}) {
  return _sendBulkPensionsAlertsAction(params);
}

export async function sendBroadcastMessageAction(params: {
  subject: string;
  message: string;
  scope?: "ALL" | "NIVEL" | "GRADO" | "SECCION";
  targetId?: string;
  channels?: ("WHATSAPP" | "SMS" | "EMAIL")[];
}) {
  return _sendBroadcastMessageAction(params);
}
