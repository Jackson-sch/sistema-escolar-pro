import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPortalUniformesDataAction } from "@/actions/uniformes";
import { UniformCatalogue } from "@/components/portal/uniformes/uniform-catalogue";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Uniformes | Portal de Padres",
  description: "Reserva de uniformes escolares para tus hijos.",
};

export default async function PortalUniformesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const res = await getPortalUniformesDataAction(session.user.id);

  if (res.error || !res.data) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
          <p className="font-bold text-lg mb-2">Error de Carga</p>
          <p className="text-sm">
            {res.error || "No se pudo obtener la información de uniformes."}
          </p>
        </div>
      </div>
    );
  }

  const { uniforms, categorias, sedes, hijos, ventas } = res.data;

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen max-w-[1600px] mx-auto w-full">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Guía de Uniformes
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Información sobre los uniformes y prendas reglamentarias.
        </p>
      </div>
      <Suspense fallback={<PortalUniformsSkeleton />}>
        <UniformCatalogue
          uniforms={uniforms}
          categorias={categorias}
          sedes={sedes}
          hijos={hijos}
          ventas={ventas}
          currentPadreId={session.user.id}
        />
      </Suspense>
    </div>
  );
}

function PortalUniformsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="flex justify-center">
        <Skeleton className="h-14 w-full max-w-md rounded-2xl" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-11 w-96 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="aspect-3/4 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
