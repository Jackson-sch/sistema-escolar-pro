import {
  IconUser,
  IconId,
  IconCalendar,
  IconHeart,
  IconShieldCheck,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBriefcase,
  IconSchool,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { ParentProfile, getFullAddress, formatDate } from "./parent-types";
import { ParentInfoRow } from "./parent-info-row";

interface ParentProfileDetailsProps {
  profile: ParentProfile;
}

export function ParentProfileDetails({ profile }: ParentProfileDetailsProps) {
  const fullAddress = getFullAddress(profile);

  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* ── CARD 1: INFORMACIÓN PERSONAL Y FILIACIÓN ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/30 pb-3.5">
            <div className="size-9 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <IconUser className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Información Personal & Filiación
              </h3>
              <p className="text-xs text-muted-foreground">
                Datos de identidad del apoderado registrados en el padrón escolar.
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <ParentInfoRow icon={IconUser} label="Nombres" value={profile.name} />
            <ParentInfoRow
              icon={IconUser}
              label="Apellido Paterno"
              value={profile.apellidoPaterno}
            />
            <ParentInfoRow
              icon={IconUser}
              label="Apellido Materno"
              value={profile.apellidoMaterno}
            />
            <ParentInfoRow icon={IconId} label="DNI / Documento" value={profile.dni} isMono />
            <ParentInfoRow
              icon={IconCalendar}
              label="Fecha de Nacimiento"
              value={formatDate(profile.fechaNacimiento)}
            />
            <ParentInfoRow
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
            <ParentInfoRow
              icon={IconHeart}
              label="Estado Civil"
              value={profile.estadoCivil}
              colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            />
            <ParentInfoRow
              icon={IconShieldCheck}
              label="Nacionalidad"
              value={profile.nacionalidad}
              colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: DATOS DE CONTACTO Y DOMICILIO ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/30 pb-3.5">
            <div className="size-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <IconPhone className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Datos de Contacto & Domicilio
              </h3>
              <p className="text-xs text-muted-foreground">
                Teléfonos de localización, correo personal y residencia.
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <ParentInfoRow
              icon={IconMail}
              label="Correo Electrónico"
              value={profile.email}
              colorClass="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            />
            <ParentInfoRow
              icon={IconPhone}
              label="Teléfono Móvil"
              value={profile.telefono}
              isMono
              colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
            />
            <ParentInfoRow
              icon={IconPhone}
              label="Contacto de Emergencia"
              value={profile.telefonoEmergencia}
              isMono
              colorClass="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            />
            <ParentInfoRow
              icon={IconMapPin}
              label="Dirección Completa"
              value={fullAddress || null}
              colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 3: INFORMACIÓN LABORAL E INSTRUCCIÓN ── */}
      <Card className="rounded-3xl border border-border/50 bg-card/80 shadow-xs">
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-border/30 pb-3.5">
            <div className="size-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <IconBriefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Información Laboral & Nivel de Instrucción
              </h3>
              <p className="text-xs text-muted-foreground">
                Ocupación profesional y grado de instrucción alcanzado.
              </p>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <ParentInfoRow
              icon={IconBriefcase}
              label="Ocupación / Profesión"
              value={profile.ocupacion}
              colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            />
            <ParentInfoRow
              icon={IconMapPin}
              label="Centro de Trabajo"
              value={profile.lugarTrabajo}
              colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            />
            <ParentInfoRow
              icon={IconSchool}
              label="Grado de Instrucción"
              value={profile.gradoInstruccion}
              colorClass="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
