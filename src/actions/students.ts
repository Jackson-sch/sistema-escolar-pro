"use server";

import {
  getStudentsAction as _getStudentsAction,
  getUserStatusesAction as _getUserStatusesAction,
  getInstitucionesAction as _getInstitucionesAction,
  getNivelesAcademicosAction as _getNivelesAcademicosAction,
  getGuardianByDniAction as _getGuardianByDniAction,
} from "./students/student-queries";

import {
  searchStudentsAction as _searchStudentsAction,
  getStudentByIdAction as _getStudentByIdAction,
  getStudentFullProfileDetailAction as _getStudentFullProfileDetailAction,
} from "./students/student-profile-queries";

import {
  createStudentAction as _createStudentAction,
  updateStudentAction as _updateStudentAction,
  deleteStudentAction as _deleteStudentAction,
} from "./students/student-mutations";

import { getStudentDashboardStatsAction as _getStudentDashboardStatsAction } from "./students/student-stats";

import { importStudentsBulkAction as _importStudentsBulkAction } from "./students/student-import-actions";
import { StudentImportPayload } from "./students/student-import-types";

export async function getStudentsAction(params?: {
  page?: number;
  pageSize?: number;
  estado?: string;
  nivel?: string;
}) {
  return _getStudentsAction(params);
}

export async function getUserStatusesAction() {
  return _getUserStatusesAction();
}

export async function getInstitucionesAction() {
  return _getInstitucionesAction();
}

export async function getNivelesAcademicosAction(
  anio?: number,
  nivelId?: string,
) {
  return _getNivelesAcademicosAction(anio, nivelId);
}

export async function getGuardianByDniAction(dni: string) {
  return _getGuardianByDniAction(dni);
}

export async function searchStudentsAction(query: string) {
  return _searchStudentsAction(query);
}

export async function getStudentByIdAction(id: string) {
  return _getStudentByIdAction(id);
}

export async function getStudentFullProfileDetailAction(studentId: string) {
  return _getStudentFullProfileDetailAction(studentId);
}

export async function createStudentAction(values: any) {
  return _createStudentAction(values);
}

export async function updateStudentAction(id: string, values: any) {
  return _updateStudentAction(id, values);
}

export async function deleteStudentAction(id: string) {
  return _deleteStudentAction(id);
}

export async function getStudentDashboardStatsAction() {
  return _getStudentDashboardStatsAction();
}

export async function importStudentsBulkAction(
  students: StudentImportPayload[],
  defaultNivelAcademicoId?: string,
) {
  return _importStudentsBulkAction(students, defaultNivelAcademicoId);
}
