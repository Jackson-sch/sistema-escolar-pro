"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUser, IconMapPin } from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";

interface StudentGeneralTabProps {
  student: any;
  primaryGuardian?: any;
}

export function StudentGeneralTab({
  student,
  primaryGuardian,
}: StudentGeneralTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Datos Personales */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <IconUser className="size-4 text-primary" /> Datos Personales y de
            Nacimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">Nombres:</span>
            <span className="font-bold text-foreground">{student.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Apellidos:
            </span>
            <span className="font-bold text-foreground">
              {student.apellidoPaterno} {student.apellidoMaterno}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              DNI / Documento:
            </span>
            <span className="font-bold text-foreground font-mono">
              {student.dni || "S/D"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Fecha de Nacimiento:
            </span>
            <span className="font-bold text-foreground">
              {student.fechaNacimiento
                ? formatDate(student.fechaNacimiento)
                : "No registrada"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Lugar / País:
            </span>
            <span className="font-bold text-foreground">
              {student.lugarNacimiento || "Perú"} (
              {student.paisNacimiento || "Perú"})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground font-medium">
              Lengua Materna / Religión:
            </span>
            <span className="font-bold text-foreground">
              {student.lenguaMaterna || "Castellano"} ·{" "}
              {student.religion || "Católica"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Domicilio y Contacto de Emergencia */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
        <CardHeader className="p-4 sm:p-5 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <IconMapPin className="size-4 text-primary" /> Domicilio y
            Emergencias
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Dirección Actual:
            </span>
            <span className="font-bold text-foreground">
              {student.direccion || "No registrada"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Distrito / Provincia:
            </span>
            <span className="font-bold text-foreground">
              {student.distrito || "-"} / {student.provincia || "-"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Contacto de Emergencia:
            </span>
            <span className="font-bold text-foreground">
              {student.contactoEmergencia || "Apoderado registrado"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/30">
            <span className="text-muted-foreground font-medium">
              Teléfono de Emergencia:
            </span>
            <span className="font-bold text-foreground font-mono">
              {student.telefonoEmergencia ||
                primaryGuardian?.telefono ||
                "Sin registrar"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground font-medium">
              Condición de Vivienda:
            </span>
            <span className="font-bold text-foreground">
              {student.tipoVivienda || "Propia"}{" "}
              {student.viveConPadres ? "(Vive con padres)" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
