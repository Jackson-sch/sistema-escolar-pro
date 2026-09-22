import { ColumnDef } from "@tanstack/react-table";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";

export interface StudentTableMeta {
  instituciones?: unknown[];
  estados?: Array<{ id: string; nombre: string }>;
  nivelesAcademicos?: Array<{
    id: string;
    seccion: string;
    nivel: { id: string; nombre: string };
    grado: { id: string; nombre: string; orden?: number };
    sede?: { id: string; nombre: string } | null;
  }>;
  institucion?: unknown;
}

export interface StudentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount?: number;
  meta?: StudentTableMeta;
  stats?: {
    totalStudents: number;
    activeEnrollments: number;
    newEnrollments: number;
    currentYear: number;
  };
  showPadronExport?: boolean;
}
