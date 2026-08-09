import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuditLogsView } from "@/components/configuracion/auditoria/audit-logs-view";

export const metadata = {
  title: "Bitácora de Auditoría | Sistema Escolar Pro",
  description: "Historial de trazabilidad y operaciones del sistema",
};

export default async function AuditoriaPage() {
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
      <AuditLogsView />
    </div>
  );
}
