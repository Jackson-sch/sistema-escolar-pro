"use server";

import {
  getInstitucionAction as _getInstitucionAction,
  getInstitucionByIdAction as _getInstitucionByIdAction,
  getSedesAction as _getSedesAction,
  getExcelHeaderInfoAction as _getExcelHeaderInfoAction,
} from "./institucion/institucion-queries";

import {
  updateInstitucionAction as _updateInstitucionAction,
  createInstitucionAction as _createInstitucionAction,
} from "./institucion/institucion-mutations";

export type { InstitutionHeaderInfo } from "./institucion/institucion-queries";

export async function getInstitucionAction() {
  return _getInstitucionAction();
}

export async function getInstitucionByIdAction(id?: string) {
  return _getInstitucionByIdAction(id);
}

export async function getSedesAction(institucionId?: string) {
  return _getSedesAction(institucionId);
}

export async function getExcelHeaderInfoAction() {
  return _getExcelHeaderInfoAction();
}

export async function updateInstitucionAction(id: string, values: any) {
  return _updateInstitucionAction(id, values);
}

export async function createInstitucionAction(values: any) {
  return _createInstitucionAction(values);
}
