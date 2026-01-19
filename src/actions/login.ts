"use server"

import * as z from "zod"
import { AuthError } from "next-auth"

import { signIn } from "@/auth"
import { LoginSchema } from "@/lib/schemas/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"

export const loginAction = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos" }
  }

  const { email, password } = validatedFields.data

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })
    return { success: "¡Inicio de sesión exitoso!" }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas" }
        default:
          return { error: "Algo salió mal" }
      }
    }

    throw error
  }
}
