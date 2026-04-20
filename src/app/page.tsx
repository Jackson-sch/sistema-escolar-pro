import { auth } from "@/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "super_admin") {
    redirect("/admin")
  }

  // Si hay sesión, redirigir al dashboard
  redirect("/dashboard")
}