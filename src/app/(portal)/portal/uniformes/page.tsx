import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getPortalUniformesDataAction } from "@/actions/uniformes";
import { UniformCatalogue } from "@/components/portal/uniformes/uniform-catalogue";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { IconShirt } from "@tabler/icons-react";

export const metadata = {
  title: "Uniformes y Prendas | Portal de Familia",
  description: "Reserva de prendas reglamentarias, consulta de catálogo por sede y estado de pedidos.",
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
        <div className="max-w-md rounded-2xl border border-destructive/20 bg-card/80 p-6 text-center text-destructive shadow-sm">
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
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconShirt size={14} />
            Tienda Escolar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Catálogo de Uniformes
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Consulta las prendas oficiales del colegio, precios por talla y realiza solicitudes de reserva.
          </p>
        </div>
      </div>

      <div className="px-1">
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
    </div>
  );
}

function PortalUniformsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-32 w-full rounded-2xl" />
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
          <Skeleton key={i} className="aspect-3/4 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
