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
  IconEdit,
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

// ---------- Types ----------
interface ChildRelation {
  parentesco: string;
  hijo: {
    id: string;
    name: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    image: string | null;
    codigoEstudiante: string | null;
    fechaNacimiento: string | null;
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
  fechaNacimiento: string | null;
  sexo: string | null;
  estadoCivil: string | null;
  nacionalidad: string | null;
  ocupacion: string | null;
  lugarTrabajo: string | null;
  gradoInstruccion: string | null;
  image: string | null;
  createdAt: string;
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getFullName(profile: ParentProfile) {
  return [profile.name, profile.apellidoPaterno, profile.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
}

function getFullAddress(profile: ParentProfile) {
  return [profile.direccion, profile.distrito, profile.provincia, profile.departamento]
    .filter(Boolean)
    .join(", ");
}

// ---------- Sub-components ----------
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
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
    ? `${nivel.grado?.nombre || ""} "${nivel.seccion}" - ${nivel.nivel?.nombre || ""}`
    : "Sin sección asignada";

  return (
    <Card className="group border-none bg-card/60 hover:bg-card/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={child.image || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {getInitials(child.name, child.apellidoPaterno)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate capitalize">
              {fullName?.toLowerCase()}
            </h4>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {gradoInfo}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg"
              >
                {relation.parentesco}
              </Badge>
              {child.codigoEstudiante && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono px-2 py-0.5 rounded-lg"
                >
                  {child.codigoEstudiante}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Main Component ----------
export function ProfileClient({ profile }: ProfileClientProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const fullName = getFullName(profile);
  const fullAddress = getFullAddress(profile);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN: Profile Card + Children */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Header Card */}
          <Card className="border-none bg-card/60 shadow-lg rounded-2xl overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
            <CardContent className="px-6 pb-6 -mt-12">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-24 ring-4 ring-background shadow-xl">
                  <AvatarImage src={profile.image || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-black text-2xl">
                    {getInitials(profile.name, profile.apellidoPaterno)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-black tracking-tight capitalize">
                  {fullName.toLowerCase()}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                  {profile.email || "Sin correo registrado"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                    <IconShieldCheck size={12} className="mr-1" />
                    Padre / Tutor
                  </Badge>
                </div>
              </div>

              <Separator className="my-5 bg-border/50" />

              <div className="space-y-1">
                <InfoRow icon={IconId} label="DNI" value={profile.dni} />
                <InfoRow icon={IconPhone} label="Teléfono" value={profile.telefono} />
                <InfoRow
                  icon={IconCalendar}
                  label="Miembro desde"
                  value={formatDate(profile.createdAt)}
                />
              </div>

              <Separator className="my-5 bg-border/50" />

              <Button
                variant="outline"
                className="w-full rounded-xl font-bold text-xs gap-2"
                onClick={() => setShowPasswordDialog(true)}
              >
                <IconLock size={16} />
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Children */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <IconHeart size={20} className="text-primary" />
              <h3 className="text-lg font-black tracking-tight">
                Mis Hijos
              </h3>
              <Badge variant="secondary" className="ml-auto rounded-full text-xs font-bold">
                {profile.hijosDeTutor.length}
              </Badge>
            </div>
            {profile.hijosDeTutor.length > 0 ? (
              <div className="space-y-3">
                {profile.hijosDeTutor.map((rel, i) => (
                  <ChildCard key={i} relation={rel} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2 rounded-2xl p-6 text-center bg-muted/20">
                <IconUserCircle size={40} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No hay hijos vinculados
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Contacta a la administración para vincular tus hijos.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Information */}
          <Card className="border-none bg-card/60 shadow-lg rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <IconUser size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Información Personal
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Datos personales y de identidad
                  </p>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
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
                <InfoRow icon={IconId} label="DNI" value={profile.dni} />
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
                />
                <InfoRow
                  icon={IconShieldCheck}
                  label="Nacionalidad"
                  value={profile.nacionalidad}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none bg-card/60 shadow-lg rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <IconPhone size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Contacto
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Información de contacto y dirección
                  </p>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                <InfoRow icon={IconMail} label="Correo Electrónico" value={profile.email} />
                <InfoRow icon={IconPhone} label="Teléfono" value={profile.telefono} />
                <InfoRow
                  icon={IconPhone}
                  label="Teléfono de Emergencia"
                  value={profile.telefonoEmergencia}
                />
                <InfoRow
                  icon={IconMapPin}
                  label="Dirección Completa"
                  value={fullAddress || null}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-none bg-card/60 shadow-lg rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <IconBriefcase size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    Información Laboral
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Datos profesionales y educativos
                  </p>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                <InfoRow
                  icon={IconBriefcase}
                  label="Ocupación"
                  value={profile.ocupacion}
                />
                <InfoRow
                  icon={IconMapPin}
                  label="Lugar de Trabajo"
                  value={profile.lugarTrabajo}
                />
                <InfoRow
                  icon={IconSchool}
                  label="Grado de Instrucción"
                  value={profile.gradoInstruccion}
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
