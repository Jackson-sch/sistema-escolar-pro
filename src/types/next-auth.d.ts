import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
      institucionId?: string
      apellidoPaterno?: string | null
      apellidoMaterno?: string | null
    } & DefaultSession["user"]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string
    institucionId?: string
    apellidoPaterno?: string | null
    apellidoMaterno?: string | null
  }
}
