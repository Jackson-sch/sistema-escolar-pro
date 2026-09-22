import * as z from "zod";

export const formSchema = z.object({
  seccion: z.string().min(1, "La sección es requerida"),
  gradoId: z.string().min(1, "El grado es requerido"),
  tutorId: z.string().optional().nullable().or(z.literal("")),
  sedeId: z.string().optional().nullable().or(z.literal("")),
  capacidad: z.string().min(1, "La capacidad es requerida"),
  aulaAsignada: z.string().optional().nullable().or(z.literal("")),
  color: z.string().optional().nullable().or(z.literal("")),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"]),
  anioAcademico: z.string().min(4, "Año inválido"),
  institucionId: z.string().min(1),
});

export type SeccionFormValues = z.infer<typeof formSchema>;

export interface SeccionFormProps {
  initialData?: any;
  grados: { id: string; nombre: string; nivel: { nombre: string } }[];
  tutores: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  }[];
  sedes: {
    id: string;
    nombre: string;
  }[];
  institucionId: string;
  currentAnio?: number;
  onSuccess?: () => void;
}
