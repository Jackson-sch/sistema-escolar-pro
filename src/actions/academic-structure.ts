"use server";

import {
  getNivelesAction as _getNivelesAction,
  upsertNivelAction as _upsertNivelAction,
  deleteNivelAction as _deleteNivelAction,
} from "./academic-structure/niveles-actions";

import {
  getGradosAction as _getGradosAction,
  upsertGradoAction as _upsertGradoAction,
  deleteGradoAction as _deleteGradoAction,
} from "./academic-structure/grados-actions";

import {
  getSeccionesAction as _getSeccionesAction,
  upsertSeccionAction as _upsertSeccionAction,
  createFullSectionWizardAction as _createFullSectionWizardAction,
  deleteSeccionAction as _deleteSeccionAction,
  assignTutorAction as _assignTutorAction,
  getStudentsInSeccionAction as _getStudentsInSeccionAction,
} from "./academic-structure/secciones-actions";

import {
  getAniosAcademicosAction as _getAniosAcademicosAction,
  getTutoresAction as _getTutoresAction,
  getPeriodosByAnioAction as _getPeriodosByAnioAction,
  cloneAcademicStructureAction as _cloneAcademicStructureAction,
} from "./academic-structure/periodos-actions";

export async function getNivelesAction(
  targetInstitucionId?: string,
  targetSedeId?: string,
) {
  return _getNivelesAction(targetInstitucionId, targetSedeId);
}

export async function upsertNivelAction(values: any, id?: string) {
  return _upsertNivelAction(values, id);
}

export async function deleteNivelAction(id: string) {
  return _deleteNivelAction(id);
}

export async function getGradosAction(nivelId?: string, profesorId?: string) {
  return _getGradosAction(nivelId, profesorId);
}

export async function upsertGradoAction(values: any, id?: string) {
  return _upsertGradoAction(values, id);
}

export async function deleteGradoAction(id: string) {
  return _deleteGradoAction(id);
}

export async function getSeccionesAction(filters?: {
  gradoId?: string;
  anioAcademico?: number;
  profesorId?: string;
  institucionId?: string;
}) {
  return _getSeccionesAction(filters);
}

export async function upsertSeccionAction(values: any, id?: string) {
  return _upsertSeccionAction(values, id);
}

export async function createFullSectionWizardAction(values: {
  seccionData: {
    gradoId: string;
    seccion: string;
    turno?: string;
    capacidad?: number;
    aulaAsignada?: string;
    tutorId?: string | null;
    anioAcademico: number;
    institucionId: string;
  };
  cursosData: Array<{
    nombre: string;
    codigo: string;
    areaCurricularId: string;
    horasSemanales: number;
    profesorId?: string | null;
  }>;
}) {
  return _createFullSectionWizardAction(values);
}

export async function deleteSeccionAction(id: string) {
  return _deleteSeccionAction(id);
}

export async function assignTutorAction(
  seccionId: string,
  tutorId: string | null,
) {
  return _assignTutorAction(seccionId, tutorId);
}

export async function getStudentsInSeccionAction(nivelAcademicoId: string) {
  return _getStudentsInSeccionAction(nivelAcademicoId);
}

export async function getAniosAcademicosAction() {
  return _getAniosAcademicosAction();
}

export async function getTutoresAction() {
  return _getTutoresAction();
}

export async function getPeriodosByAnioAction(anio: number) {
  return _getPeriodosByAnioAction(anio);
}

export async function cloneAcademicStructureAction(
  fromYear: number,
  toYear: number,
  institucionId: string,
) {
  return _cloneAcademicStructureAction(fromYear, toYear, institucionId);
}
