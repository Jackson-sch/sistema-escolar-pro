import { EscalaCalificacion } from "@prisma/client";

export interface BatchPlanCourseItem {
  id: string;
  nombre: string;
  areaCurricularId: string;
  profesorNombre?: string;
  competencias: Array<{
    id: string;
    nombre: string;
    capacidades: Array<{ id: string; nombre: string }>;
  }>;
  existingEvaluacionesCount: number;
}

export interface CurricularPlanResult {
  seccion: {
    id: string;
    gradoNombre: string;
    seccion: string;
    nivelNombre: string;
    escalaRecomendada: EscalaCalificacion;
  };
  cursos: BatchPlanCourseItem[];
  seccionesParalelas: Array<{
    id: string;
    seccion: string;
    gradoNombre: string;
  }>;
  tiposEvaluacion: Array<{ id: string; nombre: string; codigo: string }>;
}

export interface GenerateBatchInput {
  periodoId: string;
  cursosConCompetencias: Array<{
    cursoId: string;
    competenciaIds: string[];
  }>;
  tipoEvaluacionId?: string;
  escala?: EscalaCalificacion;
  replicateSectionIds?: string[];
  fecha?: string;
}

export const BATCH_CNEB_MODULE = true;
