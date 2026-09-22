import dynamic from "next/dynamic";
import { getGlobalStatsAction } from "@/actions/super-admin";
import { AdminKpiGrid } from "@/components/admin/dashboard/admin-kpi-grid";
import { AdminSystemHealthBento } from "@/components/admin/dashboard/admin-system-health-bento";

const AdminChartsSection = dynamic(() =>
  import("@/components/admin/admin-charts-section").then(
    (mod) => mod.AdminChartsSection,
  ),
);

export default async function AdminDashboardPage() {
  const statsRes = await getGlobalStatsAction();
  const stats = statsRes.success;

  if (statsRes.error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold rounded-2xl">
        {statsRes.error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Panel de Control Global
        </h1>
        <p className="text-muted-foreground mt-1 text-xs font-normal">
          Sincronización, monitoreo y métricas consolidadas de todas las
          instituciones educativas.
        </p>
      </div>

      {/* Grid de KPIs Globales */}
      <AdminKpiGrid
        stats={{
          instituciones: stats?.instituciones || 0,
          estudiantes: stats?.estudiantes || 0,
          profesores: stats?.profesores || 0,
          admins: stats?.admins || 0,
        }}
      />

      {/* Gráficos Analíticos */}
      <AdminChartsSection
        growthData={stats?.growthChartData}
        levelData={stats?.levelChartData}
      />

      {/* Bento Grid: Servicios y Acciones Rápidas */}
      <AdminSystemHealthBento />
    </div>
  );
}
