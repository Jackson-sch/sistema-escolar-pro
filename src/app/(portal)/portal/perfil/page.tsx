import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentProfileAction, getTeacherProfileAction } from "@/actions/portal";
import { ProfileClient } from "@/components/portal/profile/profile-client";
import { TeacherProfileClient } from "@/components/portal/profile/teacher-profile-client";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const isTeacher = session.user.role === "profesor";
  const result = isTeacher 
    ? await getTeacherProfileAction({}) 
    : await getParentProfileAction({});

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-destructive font-black text-xl">
            {result.error || "Error al cargar el perfil"}
          </p>
          <p className="text-muted-foreground font-medium">
            Por favor, intenta recargar la página o contacta a soporte técnico.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 md:gap-10 p-4 sm:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen max-w-[1600px] mx-auto w-full">
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
          Mi Perfil
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed max-w-2xl">
          {isTeacher 
            ? "Gestiona tu información profesional, carga académica y datos personales dentro de la institución."
            : "Consulta tu información personal, datos de contacto y la relación con tus hijos inscritos."}
        </p>
      </div>

      {isTeacher ? (
        <TeacherProfileClient profile={result.success as any} />
      ) : (
        <ProfileClient profile={result.success as any} />
      )}
    </div>
  );
}
