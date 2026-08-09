import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SystemStatusView } from "@/components/configuracion/estado/system-status-view";

export const metadata = {
  title: "Estado del Sistema & Diagnóstico | Sistema Escolar Pro",
  description: "Panel de salud, latencia y checklist de configuración de la plataforma",
};

export default async function SystemStatusPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const rawRole = (session.user.role || "").toString().toLowerCase();
  const rolesPermitidos = ["super_admin", "administrador", "administrativo", "director", "admin"];
  if (!rawRole || !rolesPermitidos.includes(rawRole)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <SystemStatusView />
    </div>
  );
}
