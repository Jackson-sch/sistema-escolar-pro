import {
  IconId,
  IconPhone,
  IconCalendar,
  IconLock,
  IconHeart,
  IconUserCircle,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/formats";
import { ParentProfile, getFullName, formatDate } from "./parent-types";
import { ParentInfoRow } from "./parent-info-row";
import { ParentChildCard } from "./parent-child-card";

interface ParentProfileSidebarProps {
  profile: ParentProfile;
  onOpenPasswordDialog: () => void;
}

export function ParentProfileSidebar({
  profile,
  onOpenPasswordDialog,
}: ParentProfileSidebarProps) {
  const fullName = getFullName(profile);

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-6">
      {/* ── CARD PRINCIPAL APODERADO ── */}
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-md p-0">
        <div className="h-24 bg-linear-to-r from-indigo-900/40 via-violet-800/30 to-slate-900/50 relative">
          <div className="absolute inset-0 from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <CardContent className="px-6 pb-6 -mt-12">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-24 border-4 border-card shadow-2xl bg-muted">
              <AvatarImage src={profile.image || undefined} className="object-cover" />
              <AvatarFallback className="bg-linear-to-br from-indigo-600 to-violet-700 text-white font-black text-2xl">
                {getInitials(profile.name || "", profile.apellidoPaterno || "") || "A"}
              </AvatarFallback>
            </Avatar>

            <h2 className="mt-3.5 text-base sm:text-lg font-extrabold tracking-tight text-foreground capitalize leading-snug">
              {fullName}
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {profile.email || "Sin correo registrado"}
            </p>
            <div className="mt-2.5">
              <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                <IconShieldCheck className="size-3" />
                Apoderado / Tutor Principal
              </Badge>
            </div>
          </div>

          <Separator className="my-4 bg-border/40" />

          <div className="space-y-1">
            <ParentInfoRow icon={IconId} label="Documento DNI" value={profile.dni} isMono />
            <ParentInfoRow
              icon={IconPhone}
              label="Teléfono Principal"
              value={profile.telefono}
              isMono
              colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            />
            <ParentInfoRow
              icon={IconCalendar}
              label="Miembro Desde"
              value={formatDate(profile.createdAt)}
              colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
            />
          </div>

          <Separator className="my-4 bg-border/40" />

          <Button
            onClick={onOpenPasswordDialog}
            className="w-full rounded-2xl h-9.5 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer transition-all"
          >
            <IconLock className="size-4" />
            <span>Cambiar Contraseña</span>
          </Button>
        </CardContent>
      </Card>

      {/* ── LISTA DE ESTUDIANTES VINCULADOS ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <IconHeart className="size-4 text-rose-500" />
            <h3 className="text-sm font-bold tracking-tight text-foreground">
              Estudiantes Asociados
            </h3>
          </div>
          <Badge variant="outline" className="rounded-full text-[10px] font-bold px-2 py-0.5 border-border/50">
            {profile.hijosDeTutor.length}
          </Badge>
        </div>

        {profile.hijosDeTutor.length > 0 ? (
          <div className="space-y-3">
            {profile.hijosDeTutor.map((rel) => (
              <ParentChildCard key={rel.hijo.id} relation={rel} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/50 p-6 text-center bg-card/80">
            <IconUserCircle className="mx-auto size-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-bold text-foreground">No hay estudiantes vinculados</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Comunícate con la secretaría académica para asociar a tus hijos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
