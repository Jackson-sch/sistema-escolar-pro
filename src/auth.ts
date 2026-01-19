import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"

import authConfig from "./auth.config"
import prisma from "@/lib/prisma"
import { LoginSchema } from "@/lib/schemas/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user || !user.password) return null

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) return user
        }

        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.role = token.role as string
        session.user.institucionId = token.institucionId as string
        session.user.apellidoPaterno = token.apellidoPaterno as string | null
        session.user.apellidoMaterno = token.apellidoMaterno as string | null
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, institucionId: true, apellidoPaterno: true, apellidoMaterno: true }
        })
        token.role = dbUser?.role || "estudiante"
        token.institucionId = dbUser?.institucionId
        token.apellidoPaterno = dbUser?.apellidoPaterno
        token.apellidoMaterno = dbUser?.apellidoMaterno
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
})

