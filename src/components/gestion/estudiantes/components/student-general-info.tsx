"use client";

import {
  IconSchool,
  IconMapPin,
  IconCalendar,
  IconAlertCircle,
  IconUser,
  IconId,
  IconPhone,
  IconBuilding,
  IconBrandWhatsapp,
  IconUserCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { formatDate } from "@/lib/formats";
import { calculateAge } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StudentGeneralInfoProps {
  student: StudentTableType;
}

export function StudentGeneralInfo({ student }: StudentGeneralInfoProps) {
  const primaryGuardianRelation = (student as any).padresTutores?.find(
    (p: any) => p.contactoPrimario
  ) || (student as any).padresTutores?.[0];

  const guardian = primaryGuardianRelation?.padreTutor;

  const handleOpenWhatsapp = () => {
    if (!guardian?.telefono) return;
    const cleanPhone = guardian.telefono.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const studentName = `${student.name} ${student.apellidoPaterno}`;
    const msg = encodeURIComponent(
      `Estimado(a) ${guardian.name || "Apoderado"}, le saludamos de la institución educativa respecto al alumno(a) ${studentName}.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-5 animate-in fade-in-0 animation-duration-">
      {/* SECCIÓN 1: FORMACIÓN ACADÉMICA */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconSchool className="size-4 text-indigo-500" />
          Formación Académica
        </h3>

        <div className="p-4 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-3">
          {student.nivelAcademico ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Grado y Sección
                </span>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-500" />
                  {student.nivelAcademico.grado.nombre} - &quot;{student.nivelAcademico.seccion}&quot;
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Nivel Educativo
                </span>
                <div>
                  <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-xs rounded-lg">
                    {student.nivelAcademico.nivel?.nombre || "General"}
                  </Badge>
                </div>
              </div>

              {student.nivelAcademico.sede && (
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-border/20">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sede Institucional
                  </span>
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <IconBuilding className="size-3.5 text-indigo-500" />
                    {student.nivelAcademico.sede.nombre}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <IconAlertCircle className="size-5 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Sin Matrícula Activa
                </p>
                <p className="text-[11px] text-muted-foreground">
                  El alumno no se encuentra matriculado en una sección del periodo actual.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: DATOS DEL APODERADO PRINCIPAL */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconUserCheck className="size-4 text-emerald-500" />
          Apoderado Principal
        </h3>

        <div className="p-4 rounded-2xl bg-background/50 border border-border/30 shadow-xs">
          {guardian ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground capitalize">
                    {guardian.name} {guardian.apellidoPaterno} {guardian.apellidoMaterno}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {primaryGuardianRelation?.parentesco || "Tutor Legal"}
                  </p>
                </div>

                {guardian.telefono && (
                  <Button
                    size="sm"
                    type="button"
                    onClick={handleOpenWhatsapp}
                    className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
                  >
                    <IconBrandWhatsapp className="size-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20 text-xs">
                {guardian.dni && (
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                    <IconId className="size-3.5 text-muted-foreground/70" />
                    <span>DNI: {guardian.dni}</span>
                  </div>
                )}
                {guardian.telefono && (
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
                    <IconPhone className="size-3.5 text-muted-foreground/70" />
                    <span>{guardian.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No hay apoderado principal registrado.
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: UBICACIÓN Y DOMICILIO */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconMapPin className="size-4 text-indigo-500" />
          Ubicación y Residencia
        </h3>

        <div className="p-4 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-3">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Dirección
            </span>
            <p className="text-xs font-semibold text-foreground leading-relaxed">
              {student.direccion || "Sin dirección registrada"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/20 text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Distrito</span>
              <span className="font-semibold text-foreground">{student.distrito || "-"}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Provincia</span>
              <span className="font-semibold text-foreground">{student.provincia || "-"}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground block">Departamento</span>
              <span className="font-semibold text-foreground">{student.departamento || "-"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: INFORMACIÓN BIOGRÁFICA Y REGISTRO */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Edad / Nacimiento
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <IconCalendar className="size-3.5 text-indigo-500" />
            <span>
              {student.fechaNacimiento
                ? `${calculateAge(student.fechaNacimiento)} años`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Nacionalidad
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0">
              PE
            </Badge>
            <span>{student.nacionalidad || "PERUANA"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
