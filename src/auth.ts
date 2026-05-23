import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"

import authConfig from "./auth.config"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
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
          select: { role: true, institucionId: true, apellidoPaterno: true, apellidoMaterno: true, name: true, email: true }
        })
        token.role = dbUser?.role || "estudiante"
        token.institucionId = dbUser?.institucionId
        token.apellidoPaterno = dbUser?.apellidoPaterno
        token.apellidoMaterno = dbUser?.apellidoMaterno
        token.name = dbUser?.name
        token.email = dbUser?.email
      }
      return token
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
})

