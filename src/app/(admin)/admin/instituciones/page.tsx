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
import Image from "next/image";
import { Suspense } from "react";

interface InstitucionCard {
  id: string;
  logo?: string | null;
  nombreInstitucion: string;
  distrito: string;
  provincia: string;
  codigoModular: string;
  createdAt: string | Date;
  _count: { users: number };
}


export default async function AdminInstitucionesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const result = await listInstitucionesAction(query);

  const instituciones = result.success || [];

  return (
    <div className="space-y-8 animate-in fade-in animation-duration-">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-sm">Instituciones Educativas</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Gestión y supervisión global de colegios registrados en la plataforma.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <Suspense fallback={<div className="w-[180px] h-9 rounded-full bg-muted/40 animate-pulse" />}>
             <InstitucionSearch />
           </Suspense>
            <Link href="/admin/usuarios" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-[background-color,transform] shadow-lg shadow-indigo-600/20 active:scale-95">
               Invitar Director
            </Link>
        </div>
      </div>

      {/* Grid de Instituciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {instituciones.map((inst: InstitucionCard) => (
          <div key={inst.id} className="group relative rounded-2xl border border-border/50 bg-card/80 shadow-sm overflow-hidden transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
             <div className="h-24 bg-linear-to-r from-muted/20 to-muted/5 p-6 flex items-start justify-between relative overflow-hidden border-b border-border/40">
                <div className="absolute inset-0 bg-white/2 mix-blend-overlay" />
                <div className="size-16 rounded-2xl bg-muted/50 border border-border/30 flex items-center justify-center relative z-10 shadow-sm">
                   {inst.logo ? (
                     <Image src={inst.logo} alt={inst.nombreInstitucion} width={48} height={48} className="size-12 object-contain rounded-xl" />
                   ) : (
                     <IconSchool className="size-8 text-indigo-500 opacity-75" />
                   )}
                </div>
                 <div className="flex items-center gap-2 relative z-10">
                    <InstitucionDeleteButton instId={inst.id} instName={inst.nombreInstitucion} />
                    <span className={`px-3 py-1 rounded-full text-xxs font-black uppercase tracking-widest border ${inst._count.users > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                       {inst._count.users > 0 ? 'ACTIVA' : 'CONFIGURANDO'}
                    </span>
                 </div>
             </div>

             <div className="p-6 space-y-6">
                <div>
                   <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-indigo-500 transition-colors line-clamp-1 drop-shadow-xs">
                      {inst.nombreInstitucion}
                   </h3>
                   <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1.5">
                      <IconMapPin className="size-3.5 text-indigo-500" />
                      {inst.distrito}, {inst.provincia}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-wider">Cód. Modular</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                         <IconHash className="size-3.5 text-indigo-500" />
                         {inst.codigoModular}
                      </div>
                   </div>
                   <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground/75 uppercase tracking-wider">Usuarios</p>
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                         <IconUsers className="size-3.5 text-indigo-500" />
                         {inst._count.users} miembros
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <IconCalendarEvent className="size-3.5 text-indigo-500" />
                      Desde {new Date(inst.createdAt).toLocaleDateString("es-PE")}
                   </div>
                    <Link href={`/admin/instituciones/${inst.id}`} className="text-xs font-black text-indigo-500 hover:text-indigo-400 underline-offset-4 hover:underline tracking-wide">
                       Ver detalles →
                    </Link>
                </div>
             </div>
          </div>
        ))}

        {instituciones.length === 0 && (
          <div className="col-span-full py-20 bg-card/80 border border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-center opacity-75 animate-in fade-in animation-duration-">
             <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 border border-border/40">
                <IconSchool className="size-8 text-muted-foreground/75" />
             </div>
             <p className="text-muted-foreground font-semibold">No se encontraron instituciones registradas.</p>
             <button className="mt-4 text-sm font-black text-indigo-500 hover:text-indigo-400 transition-colors">Registrar la primera institución</button>
          </div>
        )}
      </div>
    </div>
  );
}
