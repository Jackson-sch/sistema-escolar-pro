"use client";

import * as React from "react";
import {
  IconSchool,
  IconFileCertificate,
  IconUser,
  IconCalendar,
  IconDownload,
} from "@tabler/icons-react";
import { formatLongDate, getInitials } from "@/lib/formats";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { EnrollmentCertificateActions } from "../documentos/enrollment-certificate-actions";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EnrollmentTableType } from "./columns";

interface EnrollmentViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enrollment: EnrollmentTableType;
  institucion?: any;
}

export function EnrollmentViewSheet({
  open,
  onOpenChange,
  enrollment,
  institucion,
}: EnrollmentViewSheetProps) {
  const studentFullName = `${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno} ${enrollment.estudiante.name}`;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2">
              <AvatarImage src={enrollment.estudiante.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials(
                  studentFullName,
                  enrollment.estudiante.apellidoPaterno
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1 pt-1">
              <SheetTitle className="text-xl font-bold leading-tight">
                {studentFullName}
              </SheetTitle>
              <SheetDescription className="text-sm">
                DNI: {enrollment.estudiante.dni}
              </SheetDescription>
              <Badge variant="secondary" className="mt-2">
                Año Académico {enrollment.anioAcademico}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        <div className="space-y-6 px-6">
          {/* Sección: Ubicación Académica */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <IconSchool className="h-4 w-4 text-muted-foreground" />
              <h3>Ubicación Académica</h3>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nivel</span>
                <span className="text-sm font-medium">
                  {enrollment.nivelAcademico.nivel.nombre}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Grado</span>
                <span className="text-sm font-medium">
                  {enrollment.nivelAcademico.grado.nombre}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sección</span>
                <Badge variant="outline" className="font-semibold">
                  Sección "{enrollment.nivelAcademico.seccion}"
                </Badge>
              </div>
            </div>
          </div>

          {/* Sección: Información de Ingreso */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <IconFileCertificate className="h-4 w-4 text-muted-foreground" />
              <h3>Información de Ingreso</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Tipo de Ingreso
                </p>
                <p className="text-sm font-semibold">
                  {enrollment.esPrimeraVez ? "Nuevo Ingreso" : "Continuidad"}
                </p>
              </div>
              <div className="rounded-lg border p-3 text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  Repitencia
                </p>
                <p className="text-sm font-semibold">
                  {enrollment.esRepitente ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Procedencia */}
          {enrollment.procedencia && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Institución de Procedencia
              </p>
              <p className="text-sm font-medium rounded-lg border bg-muted/20 p-3">
                {enrollment.procedencia}
              </p>
            </div>
          )}

          {/* Sección: Observaciones */}
          {enrollment.observaciones && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Observaciones
              </p>
              <p className="text-sm rounded-lg border bg-muted/20 p-3 text-muted-foreground">
                {enrollment.observaciones}
              </p>
            </div>
          )}

          <Separator className="my-6" />

          {/* Sección: Información de Registro */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <h3>Información de Registro</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Fecha de matrícula
                </span>
                <span className="font-medium">
                  {formatLongDate(
                    enrollment.fechaMatricula,
                    "EEEE, d 'de' MMMM yyyy"
                  )}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado</span>
                <Badge
                  variant={
                    enrollment.estado === "activo" ? "default" : "secondary"
                  }
                >
                  {enrollment.estado}
                </Badge>
              </div>
            </div>
          </div>

          {/* Botón de Acción con PDF Verified Flow */}
          <div className="pt-4">
            <EnrollmentCertificateActions
              studentId={enrollment.estudiante.id}
              studentName={studentFullName}
              trigger={
                <Button
                  variant="outline"
                  className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary font-bold transition-all active:scale-95"
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Descargar Constancia
                </Button>
              }
            />
            <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
              Documento oficial generado digitalmente
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
