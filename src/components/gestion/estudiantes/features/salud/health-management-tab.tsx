"use client";

import { useState } from "react";
import {
  IconHeartbeat,
  IconFileDescription,
  IconEdit,
  IconPill,
  IconActivity,
  IconAlertCircle,
  IconWorld,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormModal } from "@/components/modals/form-modal";
import { HealthForm } from "@/components/gestion/estudiantes/features/salud/health-form";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { useCurrentRole } from "@/hooks/use-current-role";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

interface HealthManagementTabProps {
  student: StudentTableType;
}

export function HealthManagementTab({ student }: HealthManagementTabProps) {
  const role = useCurrentRole();
  const isProfessor = role === "profesor"; // Adjust if needed
  const [showEditModal, setShowEditModal] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            Salud y Bienestar
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Información médica, condiciones y datos complementarios.
          </p>
        </div>
        {!isProfessor && (
          <Button
            size="sm"
            onClick={() => setShowEditModal(true)}
            className="rounded-full w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20"
          >
            <IconEdit className="mr-2 h-4 w-4" /> Editar Información
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card: Salud */}
        <MagicCard gradientColor={theme === "dark" ? "#4FCF8033" : "#D9D9D955"} gradientFrom="#4FCF8033" gradientTo="#D9D9D955" className="relative overflow-hidden border border-border/40 bg-linear-to-br from-emerald-500/5 to-transparent rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-0 border-b border-emerald-500/10 bg-emerald-500/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 py-4 px-6">
              <IconHeartbeat className="h-4 w-4" />
              Estado de Salud
            </h3>
          </div>
          <div className="px-0 py-0">
            <div className="grid grid-cols-1 md:grid-cols-2 text-sm px-4">
              <div className="p-4 border-b md:border-b-0 md:border-r border-border/40">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      Tipo Sangre
                    </span>
                    <p className="font-semibold">{student.tipoSangre || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      Peso / Talla
                    </span>
                    <p className="font-semibold">
                      {student.peso ? `${student.peso} kg` : "-"} /{" "}
                      {student.talla ? `${student.talla} cm` : "-"}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      Seguro Médico
                    </span>
                    <p className="font-semibold text-emerald-600/80">
                      {student.seguroMedico || "No registrado"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                    <IconActivity className="h-3 w-3" />
                    Alergias
                  </span>
                  <p className="font-medium text-foreground/90 leading-tight">
                    {student.alergias || "Ninguna"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                    <IconAlertCircle className="h-3 w-3" />
                    Condiciones Médicas
                  </span>
                  <p className="font-medium text-foreground/90 leading-tight">
                    {student.condicionesMedicas || "Ninguna"}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 border-t border-border/40 bg-muted/5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                  <IconPill className="h-3 w-3" />
                  Medicamentos / Tratamientos
                </span>
                <p className="font-medium text-foreground/90 leading-tight">
                  {student.medicamentos || "Ninguno actualmente."}
                </p>
              </div>
            </div>
          </div>
        </MagicCard>

        {/* Card: Datos Complementarios */}
        <MagicCard className="relative overflow-hidden border border-border/40 bg-linear-to-br from-blue-500/5 to-transparent rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-0 border-b border-blue-500/10 bg-blue-500/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2 py-4 px-6">
              <IconFileDescription className="h-4 w-4" />
              Datos Personales y Origen
            </h3>
          </div>
          <div className="px-8 py-4 grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                <IconWorld className="h-3 w-3" />
                Nacimiento
              </span>
              <p className="font-semibold">
                {student.paisNacimiento}
                {student.lugarNacimiento && ` - ${student.lugarNacimiento}`}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                Lengua Materna
              </span>
              <p className="font-semibold">
                {student.lenguaMaterna || "ESPAÑOL"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                Religión
              </span>
              <p className="font-semibold">{student.religion || "-"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                <IconUsers className="h-3 w-3" />
                Hermanos
              </span>
              <p className="font-semibold">{student.numeroHermanos || "0"}</p>
            </div>
          </div>
          {/* Section Emergencia Secundaria */}
          {(student.nombreContactoEmergencia2 ||
            student.telefonoContactoEmergencia2) && (
            <div className="p-4 border-t border-border/40 bg-orange-500/5">
              <h4 className="text-[11px] font-bold text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <IconAlertCircle className="h-3.5 w-3.5" />
                Contacto de Emergencia Adicional
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground/80">
                    {student.nombreContactoEmergencia2}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {student.parentescoContactoEmergencia2?.toLowerCase()}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-orange-500/20 text-orange-600 bg-orange-500/10 font-bold"
                >
                  {student.telefonoContactoEmergencia2}
                </Badge>
              </div>
            </div>
          )}
        </MagicCard>
      </div>

      <FormModal
        title="Editar Salud y Bienestar"
        description="Actualice la información médica y complementaria."
        isOpen={showEditModal}
        onOpenChange={setShowEditModal}
        className="sm:max-w-2xl"
      >
        <HealthForm
          studentId={student.id}
          initialData={{
            tipoSangre: student.tipoSangre || undefined,
            alergias: student.alergias || undefined,
            condicionesMedicas: student.condicionesMedicas || undefined,
            medicamentos: student.medicamentos || undefined,
            seguroMedico: student.seguroMedico || undefined,
            discapacidades: student.discapacidades || undefined,
            carnetConadis: student.carnetConadis || undefined,
            restriccionesAlimenticias:
              student.restriccionesAlimenticias || undefined,
            centroSaludPreferido: student.centroSaludPreferido || undefined,
            peso: student.peso || undefined,
            talla: student.talla || undefined,
            parentescoContactoEmergencia:
              student.parentescoContactoEmergencia || undefined,
            nombreContactoEmergencia2:
              student.nombreContactoEmergencia2 || undefined,
            telefonoContactoEmergencia2:
              student.telefonoContactoEmergencia2 || undefined,
            parentescoContactoEmergencia2:
              student.parentescoContactoEmergencia2 || undefined,
            paisNacimiento: student.paisNacimiento || undefined,
            lugarNacimiento: student.lugarNacimiento || undefined,
            lenguaMaterna: student.lenguaMaterna || undefined,
            religion: student.religion || undefined,
            numeroHermanos: student.numeroHermanos || undefined,
          }}
          onSuccess={() => setShowEditModal(false)}
        />
      </FormModal>
    </div>
  );
}
