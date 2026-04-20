import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLayoutUserAction } from "@/actions/auth";
import { IconSchool } from "@tabler/icons-react";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Si ya tiene institución, enviar al dashboard
  const userRes = await getLayoutUserAction(session.user.id);
  const user = userRes.success;

  if (user?.institucionId) {
    redirect("/dashboard");
  }

  if (user?.role !== "administrativo") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[120px] animate-blob animation-delay-4000" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
            <IconSchool className="h-5 w-5 text-primary" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">EduPeru Pro</span>
            <p className="text-xs text-zinc-500">Configuración Inicial</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-xs text-zinc-600">
        © {new Date().getFullYear()} EduPeru Pro. Todos los derechos reservados.
      </footer>
    </div>
  );
}
