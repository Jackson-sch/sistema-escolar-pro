import { getProspectosAction } from "@/actions/admissions";
import { getGradosAction } from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { ProspectoTable } from "@/components/gestion/admisiones/management/prospecto-table";
import { ProspectoKanban } from "@/components/gestion/admisiones/components/prospecto-kanban";
import { AddProspectoButton } from "@/components/gestion/admisiones/components/add-prospecto-button";
import { Suspense } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  IconLayoutKanban,
  IconTable,
  IconUserSearch,
  IconUsers,
  IconClipboardCheck,
  IconUserPlus,
  IconUserX,
  IconSchool,
} from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admisiones (CRM) | Sistema Escolar Pro",
  description: "Gestión de prospectos, evaluaciones y proceso de admisión escolar.",
};

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function AdmisionesPage({ searchParams }: PageProps) {
  const [
    { view = "kanban" },
    prospectosRes,
    gradosRes,
    institucionesRes,
  ] = await Promise.all([
    searchParams,
    getProspectosAction({}),
    getGradosAction(),
    getInstitucionesAction(),
  ]);

  const prospectos = prospectosRes.success || [];
  const grados = gradosRes.data || [];
  const instituciones = institucionesRes.data || [];

  // Compute stats from prospectos data
  const totalProspectos = prospectos.length;
  const interesados = prospectos.filter((p: any) => p.estado === "INTERESADO").length;
  const evaluando = prospectos.filter((p: any) => p.estado === "EVALUANDO").length;
  const admitidos = prospectos.filter((p: any) => p.estado === "ADMITIDO").length;
  const rechazados = prospectos.filter((p: any) => p.estado === "RECHAZADO").length;
  const matriculados = prospectos.filter((p: any) => p.estado === "MATRICULADO").length;
  const conversionRate = totalProspectos > 0 ? Math.round((matriculados / totalProspectos) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconUserSearch size={14} />
            Pipeline de Admisiones
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Admisiones (CRM)
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Seguimiento integral de postulantes, evaluaciones de ingreso y conversión a matrículas activas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Selector de Vistas */}
          <div className="flex items-center bg-card/80 border border-border/40 p-1 rounded-xl">
            <Link
              href="/gestion/admisiones?view=kanban"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-[color] ${
                view === "kanban"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconLayoutKanban className="size-3.5" />
              Kanban
            </Link>
            <Link
              href="/gestion/admisiones?view=table"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-[color] ${
                view === "table"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconTable className="size-3.5" />
              Tabla
            </Link>
          </div>

          <AddProspectoButton grados={grados} instituciones={instituciones} />
        </div>
      </div>

      {/* ── BENTO KPIS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 px-1">
        {/* KPI 1: Total Pipeline */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Pipeline Total</span>
          <h3 className="text-2xl font-bold font-mono text-foreground">{totalProspectos}</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <IconUsers className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">Prospectos</span>
          </div>
        </div>

        {/* KPI 2: Interesados */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Interesados</span>
          <h3 className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{interesados}</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <IconUserSearch className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">Primer contacto</span>
          </div>
        </div>

        {/* KPI 3: En Evaluación */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">En Evaluación</span>
          <h3 className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{evaluando}</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <IconClipboardCheck className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">Proceso activo</span>
          </div>
        </div>

        {/* KPI 4: Admitidos */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Admitidos</span>
          <h3 className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{admitidos}</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IconUserPlus className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">Aprobados</span>
          </div>
        </div>

        {/* KPI 5: Rechazados */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Rechazados</span>
          <h3 className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{rechazados}</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <IconUserX className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">No admitidos</span>
          </div>
        </div>

        {/* KPI 6: Tasa de Conversión */}
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col gap-1 transition-shadow hover:shadow-md">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Conversión</span>
          <h3 className="text-2xl font-bold font-mono text-violet-600 dark:text-violet-400">{conversionRate}%</h3>
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="size-6 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <IconSchool className="size-3.5" />
            </div>
            <span className="text-[10px] text-muted-foreground/80">Matriculados</span>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO (KANBAN / TABLA) ── */}
      <div className="px-1">
        <Suspense
          fallback={
            <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-2xl border border-border/40" />
          }
        >
          {view === "kanban" ? (
            <ProspectoKanban data={prospectos} grados={grados} instituciones={instituciones} />
          ) : (
            <ProspectoTable data={prospectos} grados={grados} instituciones={instituciones} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
