import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getParentProfileAction,
  getTeacherProfileAction,
} from "@/actions/portal";
import { ProfileClient } from "@/components/portal/profile/profile-client";
import { TeacherProfileClient } from "@/components/portal/profile/teacher-profile-client";
import { Badge } from "@/components/ui/badge";
import { IconUserCheck } from "@tabler/icons-react";

export const metadata = {
  title: "Mi Perfil | Portal de Familia",
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

function PerfilHeader({ isTeacher }: { isTeacher: boolean }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
      <div className="space-y-2">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
          <IconUserCheck size={14} />
          {isTeacher ? "Cuenta Docente" : "Cuenta de Apoderado"}
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
          Mi Perfil
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
          {isTeacher
            ? "Gestiona tu información profesional, asignación horaria y datos de contacto en la institución."
            : "Consulta tus datos de filiación, teléfonos de contacto y vinculación con tus estudiantes."}
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
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <PerfilHeader isTeacher />
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
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      <PerfilHeader isTeacher={false} />
      <div className="px-1">
        <ProfileClient profile={result.success} />
      </div>
    </div>
  );
}
