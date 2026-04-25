import { listInstitucionesAction } from "@/actions/super-admin";
import { 
  IconSchool, 
  IconMapPin, 
  IconHash,
  IconUsers,
  IconCalendarEvent
} from "@tabler/icons-react";
import { InstitucionDeleteButton } from "./components/institucion-delete-button";
import { InstitucionSearch } from "./components/institucion-search";
import Link from "next/link";


export default async function AdminInstitucionesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const result = await listInstitucionesAction(query);

  const instituciones = result.success || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Instituciones Educativas</h1>
          <p className="text-zinc-500 mt-1">Gestión y supervisión de colegios en la plataforma.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <InstitucionSearch />
            <Link href="/admin/usuarios" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
               Invitar Director
            </Link>

        </div>
      </div>

      {/* Grid de Instituciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {instituciones.map((inst: any) => (
          <div key={inst.id} className="group rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden transition-all hover:border-white/10 hover:shadow-2xl hover:shadow-black">
             <div className="h-24 bg-linear-to-r from-zinc-800 to-zinc-900 p-6 flex items-start justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-white/2 mix-blend-overlay" />
                <div className="size-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center relative z-10">
                   {inst.logo ? (
                     <img src={inst.logo} alt={inst.nombreInstitucion} className="size-12 object-contain" />
                   ) : (
                     <IconSchool className="size-8 text-indigo-400 opacity-50" />
                   )}
                </div>
                 <div className="flex items-center gap-2 relative z-10">
                    <InstitucionDeleteButton instId={inst.id} instName={inst.nombreInstitucion} />
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${inst._count.users > 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                       {inst._count.users > 0 ? 'ACTIVA' : 'CONFIGURANDO'}
                    </span>
                 </div>

             </div>

             <div className="p-6 space-y-6">
                <div>
                   <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {inst.nombreInstitucion}
                   </h3>
                   <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-1">
                      <IconMapPin className="size-3" />
                      {inst.distrito}, {inst.provincia}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Cód. Modular</p>
                      <div className="flex items-center gap-2 text-sm font-medium">
                         <IconHash className="size-3 text-zinc-600" />
                         {inst.codigoModular}
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Usuarios</p>
                      <div className="flex items-center gap-2 text-sm font-medium">
                         <IconUsers className="size-3 text-zinc-600" />
                         {inst._count.users} miembros
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <IconCalendarEvent className="size-3" />
                      Desde {new Date(inst.createdAt).toLocaleDateString()}
                   </div>
                    <Link href={`/admin/instituciones/${inst.id}`} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 underline-offset-4 hover:underline">
                       Ver detalles
                    </Link>

                </div>
             </div>
          </div>
        ))}

        {instituciones.length === 0 && (
          <div className="col-span-full py-20 bg-zinc-900 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center">
             <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <IconSchool className="size-8 text-zinc-600" />
             </div>
             <p className="text-zinc-500 font-medium">No se encontraron instituciones registradas.</p>
             <button className="mt-4 text-sm font-bold text-indigo-500">Registrar la primera institución</button>
          </div>
        )}
      </div>
    </div>
  );
}
