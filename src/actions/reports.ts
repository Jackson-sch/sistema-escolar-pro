"use server";

import {
  getGradeReportDataAction as _getGradeReportDataAction,
  getQualitativeReportDataAction as _getQualitativeReportDataAction,
} from "./reports/academic-reports";

import {
  getConstanciaDataAction as _getConstanciaDataAction,
  getEnrollmentDataAction as _getEnrollmentDataAction,
  getStudentCardDataAction as _getStudentCardDataAction,
} from "./reports/administrative-reports";

export async function getGradeReportDataAction(
  studentId: string,
  anioAcademico: number,
) {
  return _getGradeReportDataAction(studentId, anioAcademico);
}

export async function getQualitativeReportDataAction(
  studentId: string,
  periodoId: string,
) {
  return _getQualitativeReportDataAction(studentId, periodoId);
}

export async function getConstanciaDataAction(studentId: string) {
  return _getConstanciaDataAction(studentId);
}

export async function getEnrollmentDataAction(studentId: string) {
  return _getEnrollmentDataAction(studentId);
}

export async function getStudentCardDataAction(studentId: string) {
  return _getStudentCardDataAction(studentId);
}
