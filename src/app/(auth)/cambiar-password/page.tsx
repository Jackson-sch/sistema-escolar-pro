import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verificar si el usuario realmente necesita cambiar la contraseña
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mustChangePassword: true, name: true, role: true },
  });

  if (!user?.mustChangePassword) {
    // Si no necesita cambiar, redirigir según su rol
    if (user?.role === "padre") {
      redirect("/portal");
    }
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">
              Cambiar Contraseña
            </h1>
            <p className="text-muted-foreground mt-2">
              Hola {user.name}, por seguridad debes crear una nueva contraseña
              para continuar.
            </p>
          </div>

          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
