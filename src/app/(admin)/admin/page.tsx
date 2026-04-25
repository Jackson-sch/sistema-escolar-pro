import { getGlobalStatsAction } from "@/actions/super-admin";
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
        <h1 className="text-3xl font-extrabold tracking-tight">Panel de Control Global</h1>
        <p className="text-zinc-500 mt-1">Sincronización y monitoreo de todas las instituciones educativas.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="group relative overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 p-6 transition-all hover:border-white/10">
               <div className={`absolute top-0 right-0 size-24 bg-linear-to-br ${card.color} opacity-[0.03] blur-2xl group-hover:opacity-[0.08] transition-opacity`} />
               
               <div className="flex items-center justify-between mb-4">
                  <div className={`size-12 rounded-2xl bg-linear-to-br ${card.color} flex items-center justify-center text-white shadow-lg shadow-black/20`}>
                     <Icon className="size-6" />
                  </div>
               </div>

               <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-500">{card.title}</p>
                  <h3 className="text-3xl font-bold tracking-tight">{card.value}</h3>
                  <p className="text-[11px] text-zinc-500 mt-2">{card.description}</p>
               </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity / Quick Actions Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 rounded-3xl bg-zinc-900 border border-white/5 p-8">
            <h2 className="text-xl font-bold mb-6">Estado del Sistema</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Servicios de Datos</span>
                   </div>
                   <span className="text-xs text-zinc-500 uppercase font-bold">Operativo</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Generación de PDFs</span>
                   </div>
                   <span className="text-xs text-zinc-500 uppercase font-bold">100% OK</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Servidor de Imágenes</span>
                   </div>
                   <span className="text-xs text-zinc-500 uppercase font-bold">Conectado</span>
                </div>
            </div>
         </div>

         <div className="rounded-3xl bg-linear-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-20%] size-64 bg-white/10 blur-3xl rounded-full" />
            <div className="relative z-10 space-y-6">
               <h2 className="text-xl font-bold">Acciones Rápidas</h2>
               <div className="space-y-3">
                  <Link href="/admin/instituciones" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10 text-center">Nueva Institución</Link>
                  <Link href="/admin/usuarios" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10 text-center">Registrar Admin</Link>
                  <button className="w-full py-3 px-4 bg-white text-indigo-600 rounded-xl text-sm font-bold transition-all shadow-xl hover:bg-zinc-100">Ver Reporte Global</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
