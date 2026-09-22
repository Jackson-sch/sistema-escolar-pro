import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getParentProfileAction,
  getTeacherProfileAction,
} from "@/actions/portal";
import { ProfileClient } from "@/components/portal/profile/profile-client";
import { TeacherProfileClient } from "@/components/portal/profile/teacher-profile-client";
import { PageHeader } from "@/components/common/page-header";
import { IconUserCircle } from "@tabler/icons-react";

export const metadata = {
  title: "Mi Perfil | Sistema Escolar Pro",
  description: "Información personal, datos de contacto y credenciales de usuario.",
};

function PerfilErrorCard({ message }: { message?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="text-center space-y-3 max-w-md bg-card/80 p-6 rounded-2xl border border-destructive/20 shadow-sm">
        <p className="text-destructive font-bold text-lg">
          {message || "Error al cargar la información del perfil"}
        </p>
        <p className="text-xs text-muted-foreground">
          Intenta recargar la página o comunícate con el área de soporte técnico.
        </p>
      </div>
    </div>
  );
}

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isTeacher = session.user.role === "profesor";

  // ── Rama docente ────────────────────────────────────────────────────────
  if (isTeacher) {
    const result = await getTeacherProfileAction({});

    if (result.error || !result.success) {
      return <PerfilErrorCard message={result.error} />;
    }

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <PageHeader
          icon={<IconUserCircle size={20} />}
          title="Mi Perfil Profesional"
          badge="Portal Docente"
          description="Gestión y actualización de datos de identidad, situación contractual y asignación de cursos."
          breadcrumbs={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Portal", href: "/portal/perfil" },
            { label: "Mi Perfil" },
          ]}
        />
        <div className="px-1">
          <TeacherProfileClient profile={result.success} />
        </div>
      </div>
    );
  }

  // ── Rama padre/tutor ────────────────────────────────────────────────────
  const result = await getParentProfileAction({});

  if (result.error || !result.success) {
    return <PerfilErrorCard message={result.error} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      <PageHeader
        icon={<IconUserCircle size={20} />}
        title="Mi Perfil de Apoderado"
        badge="Portal de Familia"
        description="Ficha informativa de apoderado, datos de contacto de emergencia y estudiantes vinculados."
        breadcrumbs={[
          { label: "Inicio", href: "/portal" },
          { label: "Portal", href: "/portal/perfil" },
          { label: "Mi Perfil" },
        ]}
      />
      <div className="px-1">
        <ProfileClient profile={result.success} />
      </div>
    </div>
  );
}
