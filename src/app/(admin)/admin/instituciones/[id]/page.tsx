import { getInstitucionDetailAction } from "@/actions/super-admin";
import {
  IconSchool,
  IconUsers,
  IconChevronLeft,
  IconCalendar,
  IconFingerprint,
  IconMapPin,
  IconPhone,
  IconMail,
  IconInfoCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

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
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/instituciones"
          className="size-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <IconChevronLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {inst.nombreInstitucion}
          </h1>
          <p className="text-sm text-zinc-500 uppercase font-bold tracking-widest mt-0.5">
            Detalles de la Sede
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Información General */}
        <div className="xl:col-span-2 space-y-8">
          <div className="rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-linear-to-br from-indigo-500/5 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="size-24 rounded-3xl bg-zinc-800 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    {inst.logo ? (
                      <Image
                        src={inst.logo}
                        alt="Logo"
                        className="size-20 object-contain relative z-10"
                        fill
                      />
                    ) : (
                      <IconSchool className="size-12 text-zinc-600 opacity-50" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {inst.nombreInstitucion}
                    </h2>
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <IconFingerprint className="size-3.5 text-indigo-500" />
                        <span className="font-medium">
                          Cód. Modular: {inst.codigoModular}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <IconCalendar className="size-3.5 text-indigo-500" />
                        <span className="font-medium">
                          Registrado el{" "}
                          {new Date(inst.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${inst._count.users > 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-orange-500/10 text-orange-500 border border-orange-500/20"}`}
                >
                  {inst._count.users > 0 ? "Activa" : "Configurando"}
                </span>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <IconMapPin className="size-4" /> Ubicación
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Dirección
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {inst.direccion || "No especificada"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        Distrito
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {inst.distrito}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        Provincia
                      </p>
                      <p className="text-sm font-medium mt-1">
                        {inst.provincia}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <IconInfoCircle className="size-4" /> Contacto y Jerarquía
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        DRE
                      </p>
                      <p className="text-sm font-medium mt-1">{inst.dre}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        UGEL
                      </p>
                      <p className="text-sm font-medium mt-1">{inst.ugel}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Email (Institucional)
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                      <IconMail className="size-3.5 text-zinc-500" />
                      {inst.email || "No registrado"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usuarios Recientes */}
          <div className="rounded-3xl bg-zinc-900 border border-white/5 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold flex items-center gap-3">
                <IconUsers className="size-5 text-indigo-500" />
                Miembros Recientes
              </h2>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                Últimos {inst.users.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table className="w-full text-left">
                <TableHeader>
                  <TableRow className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] border-b border-white/5">
                    <TableHead className="pb-4">Usuario</TableHead>
                    <TableHead className="pb-4">Rol</TableHead>
                    <TableHead className="pb-4 text-right">
                      Fecha de Registro
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/5 text-sm">
                  {inst.users.map((user: any) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback>
                              {user.name?.[0] || user.email?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold">
                              {`${user.name} ${user.apellidoPaterno} ${user.apellidoMaterno}` ||
                                "Sin nombre"}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 uppercase text-[10px] font-bold text-zinc-500 tracking-wider">
                        {user.role}
                      </TableCell>
                      <TableCell className="py-4 text-right text-zinc-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {inst.users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-12 text-center text-zinc-500 italic opacity-50"
                      >
                        No hay usuarios vinculados a esta institución todavía.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Sidebar de Estadísticas Rápidas */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-zinc-900 border border-white/5 p-6 shadow-2xl shadow-black/40">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">
              Métricas Globales
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <IconUsers className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Usuarios</p>
                </div>
                <span className="text-xl font-black">{inst._count.users}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <IconSchool className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Niveles</p>
                </div>
                <span className="text-xl font-black">
                  {inst._count.niveles}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <IconMapPin className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Sedes</p>
                </div>
                <span className="text-xl font-black">{inst._count.sedes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <IconCalendar className="size-5" />
                  </div>
                  <p className="text-sm font-medium">Periodos</p>
                </div>
                <span className="text-xl font-black">
                  {inst._count.periodos}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-indigo-600/10 border border-indigo-500/20 p-6">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-3">
              Acción Directa
            </p>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
              Configurar Institución
            </button>
            <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed italic text-center">
              "Permite al super admin acceder a la configuración interna de este
              colegio pedagógicamente."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
