import * as z from "zod";

export const familySchema = z.object({
  dni: z.string().min(8, "El documento debe tener al menos 8 caracteres").max(15, "Máximo 15 caracteres"),
  name: z.string().min(2, "Nombre es requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno es requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno es requerido"),
  telefono: z.string().optional(),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido para el acceso a la plataforma")
    .email("Ingrese un correo electrónico válido"),
  parentesco: z.string().min(1, "Seleccione parentesco"),
  contactoPrimario: z.boolean(),
  autorizadoRecoger: z.boolean(),
  viveCon: z.boolean(),
});

export type FamilyValues = z.infer<typeof familySchema>;

export interface FamilyMemberFormProps {
  studentId: string;
  relationId?: string;
  initialData?: any;
  onSuccess?: () => void;
}
