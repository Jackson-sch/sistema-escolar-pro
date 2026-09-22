"use server";

import {
  getDashboardStatsAction as _getDashboardStatsAction,
  getRecentAdmissionsAction as _getRecentAdmissionsAction,
} from "./dashboard/admin-dashboard";

import { getTeacherDashboardAction as _getTeacherDashboardAction } from "./dashboard/teacher-dashboard";

export async function getDashboardStatsAction(values?: any) {
  return _getDashboardStatsAction(values);
}

export async function getRecentAdmissionsAction(values?: { limit?: number }) {
  return _getRecentAdmissionsAction(values);
}

export async function getTeacherDashboardAction(values?: any) {
  return _getTeacherDashboardAction(values);
}
