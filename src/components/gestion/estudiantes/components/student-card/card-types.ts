export const CARD_WIDTH = 242.6; // ~85.6mm (CR80)
export const CARD_HEIGHT = 153;  // ~54mm

export interface StudentCardPDFProps {
  student: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    image?: string | null;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
      sede?: { nombre: string } | null;
    } | null;
  };
  institucion: {
    nombreInstitucion: string;
    lema?: string;
    codigoModular?: string;
    logo?: string | null;
  };
  qrCode?: string;
}
