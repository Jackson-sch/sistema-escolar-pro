export interface CreateSectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grados: any[];
  niveles: any[];
  tutores: any[];
  institucionId: string;
  currentAnio: number;
  initialGradeId?: string;
  selectedNivelId?: string;
}

export interface WizardCourse {
  areaCurricularId: string;
  nombre: string;
  codigo: string;
  horasSemanales: number;
  profesorId: string | null;
  selected: boolean;
}
