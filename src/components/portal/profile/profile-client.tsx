"use client";

import { useState } from "react";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconId,
  IconBriefcase,
  IconSchool,
  IconCalendar,
  IconShieldCheck,
  IconHeart,
  IconUserCircle,
  IconLock,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "./change-password-dialog";
import { cn } from "@/lib/utils";

// ---------- Types ----------
// Nota: los campos de fecha aceptan `string | Date` porque las server actions
// serializan los modelos Prisma (`serialize` convierte Date a ISO string en
// runtime, pero el tipo TS sigue siendo `Date`).
interface ChildRelation {
  parentesco: string;
  hijo: {
    id: string;
    name: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    image: string | null;
    codigoEstudiante: string | null;
    fechaNacimiento: string | Date | null;
    nivelAcademico: {
      nivel: { nombre: string } | null;
      grado: { nombre: string } | null;
      seccion: string;
    } | null;
  };
}

interface ParentProfile {
  id: string;
  name: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  email: string | null;
  dni: string | null;
  telefono: string | null;
  telefonoEmergencia: string | null;
  direccion: string | null;
  distrito: string | null;
  provincia: string | null;
  departamento: string | null;
  fechaNacimiento: string | Date | null;
  sexo: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  ocupacion: string | null;
  lugarTrabajo: string | null;
  gradoInstruccion: string | null;
  image: string | null;
  createdAt: string | Date;
  hijosDeTutor: ChildRelation[];
}

interface ProfileClientProps {
  profile: ParentProfile;
}

// ---------- Helpers ----------
function getInitials(name: string | null, apellido: string | null) {
  const n = name?.charAt(0) || "";
  const a = apellido?.charAt(0) || "";
  return (n + a).toUpperCase() || "U";
}

function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Lima",
  });
}

function getFullName(profile: ParentProfile) {
  return [profile.name, profile.apellidoPaterno, profile.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function getFullAddress(profile: ParentProfile) {
  return [
    profile.direccion,
    profile.distrito,
    profile.provincia,
    profile.departamento,
  ]
    .filter(Boolean)
    .join(", ");
}

// ---------- Sub-components ----------
function InfoRow({
  icon: Icon,
  label,
  value,
  isMono = false,
  colorClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  isMono?: boolean;
  colorClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border shadow-xs", colorClass)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          {label}
        </span>
        <p className={cn("text-xs md:text-sm font-semibold text-foreground truncate mt-0.5", isMono && "font-mono")}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ChildCard({ relation }: { relation: ChildRelation }) {
  const child = relation.hijo;
  const fullName = [child.name, child.apellidoPaterno, child.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  const nivel = child.nivelAcademico;
  const gradoInfo = nivel
    ? `${nivel.grado?.nombre || ""} "${nivel.seccion}" • ${nivel.nivel?.nombre || ""}`
    : "Sin sección asignada";

  return (
    <div className="group rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm transition-[border-color,box-shadow] hover:border-indigo-500/30 hover:shadow-md">
      <div className="flex items-center gap-3.5">
        <Avatar className="size-12 ring-2 ring-indigo-500/20">
          <AvatarImage src={child.image || undefined} className="object-cover" />
          <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            {getInitials(child.name, child.apellidoPaterno)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-foreground truncate capitalize">
            {fullName}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
            {gradoInfo}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge
              variant="outline"
              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            >
              {relation.parentesco}
            </Badge>
            {child.codigoEstudiante && (
              <Badge
                variant="outline"
                className="text-[9px] font-mono px-2 py-0.5 rounded-md border-border/40 text-muted-foreground"
              >
                #{child.codigoEstudiante}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Component ----------
export function ProfileClient({ profile }: ProfileClientProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const fullName = getFullName(profile);
  const fullAddress = getFullAddress(profile);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in animation-duration-">
        {/* LEFT COLUMN: Profile Header + Children */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-xl">
            <div className="h-20 bg-linear-to-r from-indigo-600/20 via-primary/10 to-indigo-600/20" />
            <CardContent className="px-6 pb-6 -mt-10">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-20 ring-4 ring-card shadow-xl">
                  <AvatarImage src={profile.image || undefined} className="object-cover" />
                  <AvatarFallback className="bg-indigo-600 text-white font-bold text-xl">
                    {getInitials(profile.name, profile.apellidoPaterno)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-lg font-bold tracking-tight text-foreground capitalize">
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

              <Separator className="my-4 bg-border/30" />

              <div className="space-y-1">
                <InfoRow icon={IconId} label="Documento DNI" value={profile.dni} isMono />
                <InfoRow
                  icon={IconPhone}
                  label="Teléfono Principal"
                  value={profile.telefono}
                  isMono
                  colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                />
                <InfoRow
                  icon={IconCalendar}
                  label="Miembro Desde"
                  value={formatDate(profile.createdAt)}
                  colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                />
              </div>

              <Separator className="my-4 bg-border/30" />

              <Button
                onClick={() => setShowPasswordDialog(true)}
                className="w-full rounded-xl h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
              >
                <IconLock className="size-4" />
                <span>Cambiar Contraseña</span>
              </Button>
            </CardContent>
          </Card>

          {/* Children List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <IconHeart className="size-4 text-indigo-500" />
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  Estudiantes Asociados
                </h3>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] font-bold px-2 py-0.5 border-border/40">
                {profile.hijosDeTutor.length}
              </Badge>
            </div>

            {profile.hijosDeTutor.length > 0 ? (
              <div className="space-y-3">
                {profile.hijosDeTutor.map((rel) => (
                  <ChildCard key={rel.hijo.id} relation={rel} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/40 p-6 text-center bg-card/80">
                <IconUserCircle className="mx-auto size-10 text-muted-foreground/30 mb-2" />
                <p className="text-xs font-bold text-foreground">No hay estudiantes vinculados</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Comunícate con la secretaría académica para asociar a tus hijos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Information */}
          <Card className="rounded-2xl border border-border/40 bg-card/80 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border/20 pb-3">
                <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                  <IconUser className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Información Personal y Filiación
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Datos de identidad del apoderado registrados en el sistema.
                  </p>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <InfoRow icon={IconUser} label="Nombres" value={profile.name} />
                <InfoRow
                  icon={IconUser}
                  label="Apellido Paterno"
                  value={profile.apellidoPaterno}
                />
                <InfoRow
                  icon={IconUser}
                  label="Apellido Materno"
                  value={profile.apellidoMaterno}
                />
                <InfoRow icon={IconId} label="DNI / Documento" value={profile.dni} isMono />
                <InfoRow
                  icon={IconCalendar}
                  label="Fecha de Nacimiento"
                  value={formatDate(profile.fechaNacimiento)}
                />
                <InfoRow
                  icon={IconUser}
                  label="Sexo"
                  value={
                    profile.sexo === "M"
                      ? "Masculino"
                      : profile.sexo === "F"
                        ? "Femenino"
                        : profile.sexo
                  }
                />
                <InfoRow
                  icon={IconHeart}
                  label="Estado Civil"
                  value={profile.estadoCivil}
                  colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                />
                <InfoRow
                  icon={IconShieldCheck}
                  label="Nacionalidad"
                  value={profile.nacionalidad}
                  colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="rounded-2xl border border-border/40 bg-card/80 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border/20 pb-3">
                <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <IconPhone className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Datos de Contacto y Domicilio
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Números telefónicos, correo y ubicación domiciliaria.
                  </p>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <InfoRow
                  icon={IconMail}
                  label="Correo Electrónico"
                  value={profile.email}
                  colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                />
                <InfoRow
                  icon={IconPhone}
                  label="Teléfono Móvil"
                  value={profile.telefono}
                  isMono
                  colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                />
                <InfoRow
                  icon={IconPhone}
                  label="Contacto de Emergencia"
                  value={profile.telefonoEmergencia}
                  isMono
                  colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                />
                <InfoRow
                  icon={IconMapPin}
                  label="Dirección Completa"
                  value={fullAddress || null}
                  colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="rounded-2xl border border-border/40 bg-card/80 shadow-sm">
            <CardContent className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-border/20 pb-3">
                <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <IconBriefcase className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    Información Laboral e Instrucción
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ocupación actual y nivel de educación del apoderado.
                  </p>
                </div>
              </div>

              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <InfoRow
                  icon={IconBriefcase}
                  label="Ocupación / Profesión"
                  value={profile.ocupacion}
                  colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                />
                <InfoRow
                  icon={IconMapPin}
                  label="Centro de Trabajo"
                  value={profile.lugarTrabajo}
                  colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                />
                <InfoRow
                  icon={IconSchool}
                  label="Grado de Instrucción"
                  value={profile.gradoInstruccion}
                  colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </>
  );
}
