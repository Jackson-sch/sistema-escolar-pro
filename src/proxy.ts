import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { 
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  // Restricciones para ROLES específicos (RBAC)
  if (userRole === "profesor") {
    const restrictedPaths = [
      "/finanzas",
      "/configuracion",
      "/gestion/admisiones",
      "/gestion/matriculas",
      "/gestion/academico",
      "/gestion/personal"
    ]

    const isRestricted = restrictedPaths.some(path => nextUrl.pathname.startsWith(path))

    if (isRestricted) {
      return Response.redirect(new URL("/dashboard", nextUrl))
    }
  }

  return
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
