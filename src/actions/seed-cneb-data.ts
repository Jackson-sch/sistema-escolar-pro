import { CNEB_CORE_AREAS } from "./seed-cneb-core";
import { CNEB_EXTENDED_AREAS } from "./seed-cneb-extended";
import { CnebAreaData, CnebCompetenciaData, CnebCapacidadData } from "./seed-cneb-types";

export type { CnebAreaData, CnebCompetenciaData, CnebCapacidadData };

/**
 * Catálogo maestro oficial del Currículo Nacional de la Educación Básica (CNEB) - MINEDU
 */
export const CNEB_AREAS: CnebAreaData[] = [
  ...CNEB_CORE_AREAS,
  ...CNEB_EXTENDED_AREAS,
];
