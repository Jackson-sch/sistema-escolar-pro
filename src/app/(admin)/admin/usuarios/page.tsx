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

interface AdminPendiente {
  id: string;
  name?: string | null;
  email?: string | null;
  mustChangePassword?: boolean;
  createdAt: string | Date;
}


export default async function AdminUsuariosPage() {
  const result = await listPendingAdminsAction();
  const pendingAdmins = result.success || [];

  return (
    <div className="space-y-8 animate-in fade-in animation-duration-">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl drop-shadow-sm">Administradores de Institución</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Gestiona las cuentas de directores autorizados que están pendientes por vincular su colegio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
         {/* Formulario de Creación */}
         <div className="xl:col-span-1 space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card/80 shadow-sm p-6 sticky top-24">
               <div className="flex items-center gap-3 mb-6">
                  <div className="size-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                     <IconUserPlus className="size-5" />
                  </div>
                  <h2 className="font-bold text-foreground">Nueva Cuenta Admin</h2>
               </div>
               
               <AdminCreateForm />

               <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
                  <div className="flex gap-2">
                     <IconAlertCircle className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                     <p className="text-micro text-muted-foreground/90 leading-relaxed">
                        Al crear la cuenta, el usuario recibirá una contraseña temporal <span className="text-indigo-500 font-black">Colegio2026</span> y se le pedirá cambiarla en su primer acceso.
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <IconShieldLock className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                     <p className="text-micro text-muted-foreground/90 leading-relaxed">
                        El sistema lo redirigirá automáticamente al portal de Onboarding tras el inicio de sesión.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Listado de Pendientes */}
         <div className="xl:col-span-2 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-4 text-foreground">
               Cuentas sin Institución
               <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xxs font-black border border-border/20">
                  {pendingAdmins.length}
               </span>
            </h2>

            <div className="grid grid-cols-1 gap-4">
               {pendingAdmins.map((admin: AdminPendiente) => (
                 <div key={admin.id} className="group rounded-2xl border border-border/50 bg-card/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-[background-color,box-shadow,transform] duration-300 hover:bg-card hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center gap-4">
                       <div className="size-12 rounded-full bg-muted border border-border/40 flex items-center justify-center text-muted-foreground group-hover:border-indigo-500/40 group-hover:text-indigo-500 transition-colors duration-300">
                          <IconUser className="size-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-sm leading-none flex items-center gap-2 text-foreground">
                             {admin.name || 'Sin Nombre'}
                             {admin.mustChangePassword && (
                               <span className="text-xxs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/20 font-black">INVITADO</span>
                             )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <IconMail className="size-3.5 text-indigo-500" />
                                {admin.email}
                             </div>
                             <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <IconClock className="size-3.5 text-indigo-500" />
                                Creado el {new Date(admin.createdAt).toLocaleDateString("es-PE")}
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 shrink-0">
                       <AdminDeleteButton 
                         userId={admin.id} 
                         userName={admin.name || admin.email || ""} 
                       />
                       <button className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors active:scale-95">
                          Administrar
                       </button>
                    </div>

                 </div>
               ))}

               {pendingAdmins.length === 0 && (
                 <div className="py-20 bg-card/80 border border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-center opacity-75">
                    <IconUsers className="size-10 text-muted-foreground/60 mb-3" />
                    <p className="text-sm text-muted-foreground font-semibold">No hay administradores pendientes de vinculación.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
