import * as z from "zod"

export const LoginSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es requerido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
  code: z.optional(z.string()),
})

export const RegisterSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico es requerido",
  }),
  password: z.string().min(6, {
    message: "Mínimo 6 caracteres requeridos",
  }),
  name: z.string().min(1, {
    message: "El nombre es requerido",
  }),
})
