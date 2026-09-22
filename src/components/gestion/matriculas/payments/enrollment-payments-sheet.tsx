"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EnrollmentTableType } from "@/components/gestion/matriculas/components/columns";
import { EnrollmentPayments } from "./enrollment-payments";
import {
  IconBolt,
  IconBuilding,
  IconId,
  IconPhone,
  IconSchool,
  IconUser,
} from "@tabler/icons-react";
import { getInitials } from "@/lib/formats";

interface EnrollmentPaymentsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: EnrollmentTableType;
}

export function EnrollmentPaymentsSheet({
  open,
  onOpenChange,
  enrollment,
}: EnrollmentPaymentsSheetProps) {
  const [guardian, setGuardian] = React.useState<any | null>(null);

  const fullName = `${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno}, ${enrollment.estudiante.name}`;
  const sedeName = enrollment.nivelAcademico?.sede?.nombre;
  const aulaInfo = enrollment.nivelAcademico
    ? `${enrollment.nivelAcademico.grado?.nombre} "${enrollment.nivelAcademico.seccion}" · ${enrollment.nivelAcademico.nivel?.nombre}`
    : "Sin sección asignada";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full border-l border-border/60 bg-background/98 backdrop-blur-md shadow-2xl">
        {/* ENCABEZADO: Perfil Institucional del Alumno */}
        <SheetHeader className="p-5 sm:p-6 bg-muted/20 border-b border-border/60 space-y-3">
          <div className="flex items-start gap-4">
            <Avatar className="size-14 sm:size-16 rounded-2xl border-2 border-border/50 shadow-md shrink-0">
              <AvatarImage
                src={enrollment.estudiante.image || ""}
                alt={fullName}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-black">
                {getInitials(
                  enrollment.estudiante.name,
                  enrollment.estudiante.apellidoPaterno,
                )}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <SheetTitle className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-foreground truncate">
                  {fullName}
                </SheetTitle>
              </div>

              <SheetDescription className="flex flex-col gap-1 text-xs">
                {/* DNI y Grado */}
                <div className="flex items-center gap-3 text-foreground/80 flex-wrap">
                  <span className="flex items-center gap-1 font-mono font-bold text-foreground">
                    <IconId className="size-3.5 text-primary" />
                    DNI: {enrollment.estudiante.dni || "Sin DNI"}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <IconSchool className="size-3.5 text-primary/70" />
                    {aulaInfo}
                  </span>
                </div>

                {/* Sede y Apoderado */}
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap pt-0.5">
                  {sedeName && (
                    <span className="flex items-center gap-1 font-medium text-[11px] text-foreground/70">
                      <IconBuilding className="size-3.5 text-muted-foreground" />
                      {sedeName}
                    </span>
                  )}
                  {guardian && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <IconUser className="size-3.5 text-muted-foreground" />
                      {guardian.name} {guardian.apellidoPaterno}
                      {guardian.telefono && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-[10px] text-primary/80">
                          <IconPhone className="size-2.5" />
                          {guardian.telefono}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </SheetDescription>
            </div>
          </div>

          {/* Badges de Estado y Periodo */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Badge
              variant="outline"
              className="bg-card/70 font-mono text-[11px] font-bold border-border/60"
            >
              Periodo {enrollment.anioAcademico}
            </Badge>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 font-bold text-[11px] capitalize"
            >
              ● {enrollment.estado}
            </Badge>
            {enrollment.esPrimeraVez && (
              <Badge
                variant="outline"
                className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 text-[10px] font-bold"
              >
                Nuevo Ingreso
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* CUERPO: Componente de Pagos Desacoplado */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          <EnrollmentPayments
            estudianteId={enrollment.estudiante.id}
            onGuardianLoaded={setGuardian}
          />
        </div>

        {/* PIE: Acciones Operativas Rápidas */}
        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20 sm:flex-row sm:items-center sm:justify-between gap-3">
          <SheetClose asChild>
            <Button
              variant="outline"
              className="rounded-xl text-xs font-bold border-border/60 cursor-pointer"
            >
              Cerrar
            </Button>
          </SheetClose>

          <Button
            asChild
            className="rounded-xl h-9 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-amber-950 dark:text-white shadow-md shadow-amber-500/20 gap-1.5 cursor-pointer"
          >
            <Link href={`/finanzas/caja?estudianteId=${enrollment.estudiante.id}`}>
              <IconBolt className="size-4" />
              <span>Cobrar en Caja Rápida (POS)</span>
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
