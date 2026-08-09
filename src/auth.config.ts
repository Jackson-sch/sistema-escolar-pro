import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { LoginSchema } from "@/lib/schemas/auth"

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await prisma.user.findUnique({
            where: { email },
            include: { estado: true },
          })

          if (!user || !user.password) return null

          // Validar que la cuenta esté activa (si tiene estado asignado)
          if (user.estado && user.estado.esActivo === false) {
            console.warn(`[Auth] Intento de login en cuenta inactiva/suspendida: '${email}'`);
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user
        }

        return null
      },
    }),
  ],
} satisfies NextAuthConfig
