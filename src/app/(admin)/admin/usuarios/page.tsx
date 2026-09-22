import { listPendingAdminsAction } from "@/actions/super-admin";
import {
  IconUserPlus,
  IconMail,
  IconUser,
  IconShieldLock,
  IconClock,
  IconAlertCircle,
  IconUsers,
} from "@tabler/icons-react";
import { AdminCreateForm } from "./components/admin-create-form";
import { AdminDeleteButton } from "./components/admin-delete-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminPendiente {
  id: string;
  name?: string | null;
  email?: string | null;
  mustChangePassword?: boolean;
  createdAt: string | Date;
}

export default async function AdminUsuariosPage() {
  const result = await listPendingAdminsAction();
  const pendingAdmins = (result.success as AdminPendiente[]) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Administradores de Institución
        </h1>
        <p className="text-muted-foreground mt-1 text-xs font-normal">
          Directores autorizados para realizar el onboarding de sus respectivos colegios.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Formulario de Creación */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-xs sticky top-20">
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border/40">
              <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <IconUserPlus className="size-4.5" />
              </div>
              <h2 className="text-sm font-bold text-foreground">
                Nueva Cuenta Directiva
              </h2>
            </div>

            <AdminCreateForm />

            <div className="mt-5 p-3.5 rounded-xl bg-muted/20 border border-border/40 space-y-2">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Contraseña provisional:{" "}
                  <span className="font-mono font-bold text-foreground">
                    Colegio2026
                  </span>
                  .
                </p>
              </div>
              <div className="flex items-start gap-2">
                <IconShieldLock className="size-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  El director será guiado por el asistente de onboarding en su primer acceso.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Listado de Administradores Pendientes */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Cuentas por Vincular Colegio</span>
            </h2>
            <Badge variant="outline" className="text-xs font-mono font-bold">
              {pendingAdmins.length} pendientes
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {pendingAdmins.map((admin) => (
              <Card
                key={admin.id}
                className="p-4 rounded-2xl border border-border/60 bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center text-primary shrink-0">
                    <IconUser className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-foreground">
                        {admin.name || "Sin Nombre"}
                      </h3>
                      {admin.mustChangePassword && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        >
                          Invitado
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 font-mono">
                        <IconMail className="size-3 text-primary" />
                        <span>{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconClock className="size-3 text-muted-foreground" />
                        <span>
                          {new Date(admin.createdAt).toLocaleDateString("es-PE")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  <AdminDeleteButton
                    userId={admin.id}
                    userName={admin.name || admin.email || ""}
                  />
                </div>
              </Card>
            ))}

            {pendingAdmins.length === 0 && (
              <div className="py-14 bg-card border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
                <IconUsers className="size-8 text-muted-foreground mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No hay administradores pendientes de vinculación.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
