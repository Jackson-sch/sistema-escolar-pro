export interface GradeReportPDFProps {
  data: {
    estudiante: {
      nombreCompleto: string;
      apellidoPaterno?: string;
      apellidoMaterno?: string;
      nombres?: string;
      name?: string;
      dni: string;
      codigo: string;
      grado: string;
      seccion: string;
      nivel: string;
      tutor?: string;
      profesor?: string;
      institucion: string;
      institucionCompleta?: {
        nombreInstitucion?: string;
        nombre?: string;
        lema?: string;
        dre?: string;
        ugel?: string;
        codigoModular?: string;
        resolucionCreacion?: string;
        resolucionActual?: string;
        rd?: string;
        direccion?: string;
        distrito?: string;
        provincia?: string;
        departamento?: string;
        tipoGestion?: string;
        director?:
          | {
              name?: string;
              apellidoPaterno?: string;
              apellidoMaterno?: string;
            }
          | string;
        logo?: string;
      };
      logo?: string;
    };
    periodos: any[];
    cursos: Array<{
      cursoId: string;
      cursoNombre: string;
      periodos: Array<{
        periodoId: string;
        promedio: number;
        literal?: string;
      }>;
      promedioFinal?: number;
      literalFinal?: string;
      notaRecuperacion?: number | string;
    }>;
    anioAcademico: number;
    resumen?: {
      puntajes?: number[];
      promedios?: number[];
      ordenMerito?: (string | number)[];
    };
    comportamiento?: (number | string)[];
    asistenciasJustificadas?: (number | string)[];
    asistenciasInjustificadas?: (number | string)[];
    participacionPadres?: (number | string)[];
    observacionesPorBimestre?: string[];
    origin?: string;
    qrCode?: string;
  };
}

export const getLiteralFromNumber = (val: number): string => {
  if (val >= 17) return "AD";
  if (val >= 14) return "A";
  if (val >= 11) return "B";
  if (val > 0) return "C";
  return "-";
};
