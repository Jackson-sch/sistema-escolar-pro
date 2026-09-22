"use client";

import Link from "next/link";
import {
  IconSchool,
  IconId,
  IconBrandWhatsapp,
  IconGenderMale,
  IconGenderFemale,
  IconExternalLink,
  IconUsers,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { RowActions } from "@/components/gestion/estudiantes/components/row-actions";
import { cn } from "@/lib/utils";

interface StudentDirectoryGridProps {
  students: StudentTableType[];
  onSelectStudent?: (student: StudentTableType) => void;
  meta?: any;
  selectedIndex?: number;
}

export function StudentDirectoryGrid({
  students,
  onSelectStudent,
  meta,
  selectedIndex,
}: StudentDirectoryGridProps) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-3xl bg-muted/10">
        <div className="size-14 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-center text-muted-foreground/60 mb-3">
          <IconUsers className="size-7" />
        </div>
        <h4 className="text-sm font-bold text-foreground">
          No se encontraron estudiantes
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No hay estudiantes que coincidan con la búsqueda o los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {students.map((student, idx) => {
        const isCursorActive = selectedIndex !== undefined && idx === selectedIndex;
        const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`.trim();
        const mainGuardian =
          student.padresTutores?.find((p) => p.contactoPrimario) ||
          student.padresTutores?.[0];
        const phone = mainGuardian?.padreTutor?.telefono?.replace(/\D/g, "");
        const isEnrolled = !!student.nivelAcademico;
        const sexo = student.sexo;
        const isMale =
          sexo?.toLowerCase() === "masculino" || sexo?.toLowerCase() === "m";
        const isFemale =
          sexo?.toLowerCase() === "femenino" || sexo?.toLowerCase() === "f";

        const whatsappUrl = phone
          ? `https://wa.me/51${phone.length === 9 ? phone : phone.slice(-9)}?text=${encodeURIComponent(
              `Estimado(a) ${mainGuardian?.padreTutor?.name}, nos comunicamos de la Dirección Escolar respecto al estudiante ${fullName}.`
            )}`
          : null;

        return (
          <div
            key={student.id}
            className={cn(
              "group relative flex flex-col justify-between p-4 rounded-2xl bg-card border border-border/60 shadow-2xs hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden",
              isCursorActive && "ring-2 ring-primary border-primary bg-primary/3 shadow-md"
            )}
          >
            <button
              type="button"
              onClick={() => onSelectStudent?.(student)}
              aria-label={`Ver perfil de ${fullName}`}
              aria-pressed={isCursorActive}
              className="absolute inset-0 size-full rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-0"
            />
            {/* Top Bar: Estado + Sexo */}
            <div className="flex items-center justify-between gap-2 mb-3 pointer-events-none">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                style={{
                  color: student.estado?.color || undefined,
                  borderColor: `${student.estado?.color}30` || undefined,
                  backgroundColor: `${student.estado?.color}12` || undefined,
                }}
              >
                <span
                  className="size-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: student.estado?.color || undefined }}
                />
                {student.estado?.nombre || "Registrado"}
              </span>

              <div className="flex items-center gap-1">
                {sexo && (
                  <span
                    className={cn(
                      "inline-flex items-center size-5 rounded-md border items-center justify-center",
                      isMale &&
                        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                      isFemale &&
                        "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
                      !isMale && !isFemale && "bg-muted/30 text-muted-foreground border-border/40"
                    )}
                    title={sexo}
                  >
                    {isMale ? (
                      <IconGenderMale className="size-3" />
                    ) : isFemale ? (
                      <IconGenderFemale className="size-3" />
                    ) : null}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex items-start gap-3 pointer-events-none">
              <Avatar className="size-12 rounded-2xl border-2 border-border/50 shadow-2xs relative overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-200">
                <AvatarImage
                  src={student.image ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-sm rounded-2xl">
                  {student.name?.charAt(0)?.toUpperCase()}
                  {student.apellidoPaterno?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0 flex-1">
                <h4 className="text-xs font-bold text-foreground leading-snug truncate capitalize">
                  {fullName}
                </h4>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.2 rounded-md border border-border/40 leading-none">
                    DNI: {student.dni || "S/DNI"}
                  </span>
                  {student.codigoEstudiante && (
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground/70">
                      #{student.codigoEstudiante}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Info */}
            <div className="mt-3.5 pt-3 border-t border-border/40 space-y-2 pointer-events-none">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <IconSchool className="size-3.5 text-primary shrink-0" />
                  {isEnrolled ? (
                    <span className="text-xs font-bold text-foreground truncate">
                      {student.nivelAcademico?.grado?.nombre} &quot;{student.nivelAcademico?.seccion}&quot;
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      Sin Matrícula 2026
                    </span>
                  )}
                </div>

                {student.nivelAcademico?.sede && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 leading-none">
                    {student.nivelAcademico.sede.nombre}
                  </span>
                )}
              </div>

              {/* Guardian Info & WhatsApp */}
              {mainGuardian && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/20 border border-border/40">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Apoderado: {mainGuardian.parentesco}
                    </span>
                    <span className="text-xs font-medium text-foreground truncate capitalize">
                      {mainGuardian.padreTutor.name}
                    </span>
                  </div>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 pointer-events-auto size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center shrink-0 border border-emerald-500/20 transition-colors cursor-pointer shadow-2xs"
                      title={`Enviar WhatsApp a ${mainGuardian.padreTutor.name}`}
                    >
                      <IconBrandWhatsapp className="size-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div
              className="relative z-10 flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/40"
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-7.5 px-2.5 text-[11px] font-bold rounded-xl border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer flex-1 gap-1"
              >
                <Link href={`/gestion/estudiantes/${student.id}`}>
                  <IconExternalLink className="size-3" />
                  <span>Expediente 360°</span>
                </Link>
              </Button>

              <div className="shrink-0">
                <RowActions
                  row={{ original: student } as any}
                  table={{ options: { meta } } as any}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
