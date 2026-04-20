import { listPendingAdminsAction } from "@/actions/super-admin";
import { 
  IconUserPlus, 
  IconMail, 
  IconUser,
  IconShieldLock,
  IconClock,
  IconAlertCircle,
  IconUsers
} from "@tabler/icons-react";
import { AdminCreateForm } from "./components/admin-create-form";
import { AdminDeleteButton } from "./components/admin-delete-button";


export default async function AdminUsuariosPage() {
  const result = await listPendingAdminsAction();
  const pendingAdmins = result.success || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Administradores de Institución</h1>
          <p className="text-zinc-500 mt-1">Gestiona las cuentas de directores que aún no han vinculado su colegio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
         {/* Formulario de Creación */}
         <div className="xl:col-span-1 space-y-6">
            <div className="rounded-3xl bg-zinc-900 border border-white/5 p-6 sticky top-24">
               <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                     <IconUserPlus className="size-5" />
                  </div>
                  <h2 className="font-bold">Nueva Cuenta Admin</h2>
               </div>
               
               <AdminCreateForm />

               <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                  <div className="flex gap-2">
                     <IconAlertCircle className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Al crear la cuenta, el usuario recibirá una contraseña temporal <span className="text-indigo-400 font-bold">Colegio2026</span> y se le pedirá cambiarla al primer inicio de sesión.
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <IconShieldLock className="size-4 text-indigo-400 shrink-0 mt-0.5" />
                     <p className="text-[11px] text-zinc-400 leading-relaxed">
                        El sistema lo redirigirá automáticamente al formulario de registro de institución tras el login.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Listado de Pendientes */}
         <div className="xl:col-span-2 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4">
               Cuentas sin Institución
               <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold">
                  {pendingAdmins.length}
               </span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
               {pendingAdmins.map((admin: any) => (
                 <div key={admin.id} className="group rounded-2xl bg-zinc-900 border border-white/5 p-5 flex items-center justify-between transition-all hover:border-white/10 hover:bg-zinc-900/50">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-colors">
                          <IconUser className="size-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-sm leading-none flex items-center gap-2">
                             {admin.name || 'Sin Nombre'}
                             {admin.mustChangePassword && (
                               <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20">Invited</span>
                             )}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <IconMail className="size-3" />
                                {admin.email}
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <IconClock className="size-3" />
                                Creado el {new Date(admin.createdAt).toLocaleDateString()}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <AdminDeleteButton 
                         userId={admin.id} 
                         userName={admin.name || admin.email} 
                       />
                       <button className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors">
                          Administrar
                       </button>
                    </div>

                 </div>
               ))}

               {pendingAdmins.length === 0 && (
                 <div className="py-20 bg-zinc-900/50 border border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center opacity-50">
                    <IconUsers className="size-10 text-zinc-700 mb-3" />
                    <p className="text-sm text-zinc-500">No hay administradores pendientes de vinculación.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
