import dynamic from "next/dynamic";
import { getGlobalStatsAction } from "@/actions/super-admin";

const AdminChartsSection = dynamic(
  () => import("@/components/admin/admin-charts-section").then((mod) => mod.AdminChartsSection)
);
import Link from "next/link";
import { 
  IconSchool, 
  IconUsers, 
  IconUserShield,
  IconChartBar
} from "@tabler/icons-react";

export default async function AdminDashboardPage() {
  const statsRes = await getGlobalStatsAction();
  const stats = statsRes.success;

  if (statsRes.error) {
    return <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">{statsRes.error}</div>;
  }

  const statCards = [
    { 
      title: "Instituciones", 
      value: stats?.instituciones || 0, 
      icon: IconSchool, 
      color: "from-blue-500 to-indigo-600",
      description: "Colegios registrados"
    },
    { 
      title: "Estudiantes", 
      value: stats?.estudiantes || 0, 
      icon: IconUsers, 
      color: "from-emerald-500 to-teal-600",
      description: "Total matriculados"
    },
    { 
      title: "Docentes", 
      value: stats?.profesores || 0, 
      icon: IconUserShield, 
      color: "from-purple-500 to-violet-600",
      description: "Profesores activos"
    },
    { 
      title: "Administradores", 
      value: stats?.admins || 0, 
      icon: IconChartBar, 
      color: "from-orange-500 to-amber-600",
      description: "Cuentas administrativas"
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-sm">Panel de Control Global</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Sincronización y monitoreo de todas las instituciones educativas de la plataforma.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="group relative flex flex-col justify-between rounded-2xl p-6 border border-border/50 bg-card/80 shadow-sm transition-[transform,box-shadow,border-color] duration-500 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
            >
              {/* Animated Ambient Blob */}
              <div 
                className={`absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 animate-blob bg-linear-to-br ${card.color}`} 
              />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className={`flex size-12 items-center justify-center rounded-2xl border border-white/10 shadow-inner bg-linear-to-br ${card.color} text-white shadow-lg shadow-black/20`}>
                     <Icon className="size-6" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/75">{card.title}</p>
                  <h3 className="text-3.5xl font-black tracking-tight text-foreground drop-shadow-sm">{card.value.toLocaleString("es-PE")}</h3>
                  <p className="text-xxs text-muted-foreground/80 font-medium">{card.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Analytics Charts Section */}
      <AdminChartsSection 
        growthData={stats?.growthChartData} 
        levelData={stats?.levelChartData} 
      />

      {/* System Status / Quick Actions Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card/80 shadow-sm p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-6">Estado General del Sistema</h2>
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/30 transition-colors hover:bg-muted/80">
                     <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                        <span className="text-sm font-semibold">Servicios de Base de Datos</span>
                     </div>
                     <span className="text-xxs text-emerald-500 uppercase font-black tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Operativo</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/30 transition-colors hover:bg-muted/80">
                     <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                        <span className="text-sm font-semibold">Generación de Reportes & PDFs</span>
                     </div>
                     <span className="text-xxs text-emerald-500 uppercase font-black tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">100% OK</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/30 transition-colors hover:bg-muted/80">
                     <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
                        <span className="text-sm font-semibold">Servidor de Medios & Almacenamiento</span>
                     </div>
                     <span className="text-xxs text-emerald-500 uppercase font-black tracking-widest bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">Conectado</span>
                  </div>
              </div>
            </div>
         </div>

         <div className="rounded-2xl bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden group flex flex-col justify-between min-h-[300px] shadow-lg hover:shadow-xl hover:shadow-indigo-500/20">
            <div className="absolute top-[-20%] right-[-20%] size-64 bg-white/10 blur-3xl rounded-full animate-blob" />
            <div className="relative z-10 space-y-6 w-full">
               <h2 className="text-xl font-bold tracking-tight">Acciones Rápidas</h2>
               <div className="space-y-3">
                  <Link href="/admin/instituciones" className="block w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl text-xs font-bold transition-[background-color,transform] border border-white/10 text-center tracking-wide">Nueva Institución</Link>
                  <Link href="/admin/usuarios" className="block w-full py-3.5 px-4 bg-white/10 hover:bg-white/20 active:scale-95 rounded-2xl text-xs font-bold transition-[background-color,transform] border border-white/10 text-center tracking-wide">Registrar Admin</Link>
                  <button className="w-full py-3.5 px-4 bg-white text-indigo-600 active:scale-95 rounded-2xl text-xs font-bold transition-[background-color,transform] shadow-xl hover:bg-zinc-100 tracking-wide font-black">Ver Reporte Global</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
