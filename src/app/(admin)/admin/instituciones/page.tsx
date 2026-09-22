import { listInstitucionesAction } from "@/actions/super-admin";
import { IconSchool, IconUserPlus } from "@tabler/icons-react";
import { InstitucionSearch } from "./components/institucion-search";
import {
  InstitucionCard,
  type InstitucionItem,
} from "./components/institucion-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

export default async function AdminInstitucionesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const result = await listInstitucionesAction(query);
  const instituciones = (result.success as InstitucionItem[]) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header del Catálogo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Instituciones Educativas
          </h1>
          <p className="text-muted-foreground mt-1 text-xs font-normal">
            Supervisión global, sedes y comunidades escolares vinculadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Suspense
            fallback={
              <div className="w-72 h-9 rounded-xl bg-muted/40 animate-pulse" />
            }
          >
            <InstitucionSearch />
          </Suspense>

          <Button
            asChild
            size="sm"
            className="h-9 rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/admin/usuarios">
              <IconUserPlus className="size-4" />
              <span>Invitar Director</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid de Instituciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {instituciones.map((inst) => (
          <InstitucionCard key={inst.id} inst={inst} />
        ))}

        {instituciones.length === 0 && (
          <div className="col-span-full py-16 bg-card border border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-3">
              <IconSchool className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              No se encontraron instituciones registradas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invita a un director para iniciar el proceso de onboarding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
