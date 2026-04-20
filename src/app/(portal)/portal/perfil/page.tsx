import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentProfileAction } from "@/actions/portal";
import { ProfileClient } from "@/components/portal/profile/profile-client";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getParentProfileAction({});

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive font-bold">
          {result.error || "Error al cargar el perfil"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 md:gap-10 p-4 sm:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen max-w-[1600px] mx-auto w-full">
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Mi Perfil
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Información personal y datos de tu cuenta.
        </p>
      </div>

      <ProfileClient profile={result.success as any} />
    </div>
  );
}
