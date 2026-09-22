import { getInstitucionDetailAction } from "@/actions/super-admin";
import { notFound } from "next/navigation";
import { InstitucionDetailHeader } from "./components/institucion-detail-header";
import { InstitucionInfoBento } from "./components/institucion-info-bento";
import { InstitucionUsersTable } from "./components/institucion-users-table";
import { InstitucionMetricsSidebar } from "./components/institucion-metrics-sidebar";

export default async function InstitucionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getInstitucionDetailAction(id);
  const inst = result.success;

  if (result.error || !inst) {
    return notFound();
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Principal */}
      <InstitucionDetailHeader inst={inst} />

      {/* 2. Grid de Información y Métricas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <InstitucionInfoBento inst={inst} />
          <InstitucionUsersTable users={inst.users || []} />
        </div>

        <div className="xl:col-span-1">
          <InstitucionMetricsSidebar
            metrics={inst._count}
            institucionId={inst.id}
          />
        </div>
      </div>
    </div>
  );
}
