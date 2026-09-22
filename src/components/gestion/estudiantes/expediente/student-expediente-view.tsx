"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import {
  IconArrowLeft,
  IconUser,
  IconSchool,
  IconReceipt,
  IconHeartbeat,
  IconUsers,
  IconFileText,
  IconBrandWhatsapp,
  IconAward,
  IconShieldCheck,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";
import { FamilyManagementTab } from "@/components/gestion/estudiantes/features/familia/family-management-tab";
import { HealthManagementTab } from "@/components/gestion/estudiantes/features/salud/health-management-tab";
import { DisciplineTab } from "@/components/gestion/estudiantes/features/disciplina/discipline-tab";
import { AchievementsTab } from "@/components/gestion/estudiantes/features/logros/achievements-tab";
import { StudentHeroCard } from "./components/student-hero-card";
import { StudentGeneralTab } from "./components/student-general-tab";
import { StudentAcademicTab } from "./components/student-academic-tab";
import { StudentPagosTab } from "./components/student-pagos-tab";
import { StudentDocumentosTab } from "./components/student-documentos-tab";

interface StudentExpedienteViewProps {
  student: any;
}

function computePagosKpis(cronogramas: any[]) {
  const pagosVencidos = cronogramas.filter(
    (c: any) =>
      c.estado === "EXPIRED" ||
      (c.estado === "PENDING" && new Date(c.fechaVencimiento) < new Date()),
  );
  const totalDeuda = pagosVencidos.reduce(
    (sum: number, c: any) =>
      sum + (Number(c.monto) - Number(c.montoPagado || 0)),
    0,
  );
  return { pagosVencidos, totalDeuda };
}

function computeAsistenciaPercentage(asistencias: any[]) {
  const totalAsistencias = asistencias.length;
  if (totalAsistencias === 0) return 100;
  const asistenciasPresentes = asistencias.filter(
    (a: any) => a.presente && !a.tardanza,
  ).length;
  return Math.round((asistenciasPresentes / totalAsistencias) * 100);
}

function ExpedienteTabsNav({ familyCount }: { familyCount: number }) {
  return (
    <TabsList className="h-auto p-1 bg-muted/40 rounded-xl border border-border/50 flex flex-wrap items-center gap-1 w-full justify-start">
      <TabsTrigger
        value="general"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconUser size={14} />
        <span>Ficha General</span>
      </TabsTrigger>

      <TabsTrigger
        value="familia"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconUsers size={14} />
        <span>Familia ({familyCount})</span>
      </TabsTrigger>

      <TabsTrigger
        value="academico"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconSchool size={14} />
        <span>Matrículas</span>
      </TabsTrigger>

      <TabsTrigger
        value="pensiones"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconReceipt size={14} />
        <span>Pensiones</span>
      </TabsTrigger>

      <TabsTrigger
        value="salud"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconHeartbeat size={14} />
        <span>Salud & Psicología</span>
      </TabsTrigger>

      <TabsTrigger
        value="logros"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconAward size={14} />
        <span>Disciplina</span>
      </TabsTrigger>

      <TabsTrigger
        value="documentos"
        className="rounded-lg text-xs font-bold gap-1.5 h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
      >
        <IconFileText size={14} />
        <span>Documentos</span>
      </TabsTrigger>
    </TabsList>
  );
}

function StudentSaludTab({ student }: { student: any }) {
  const fichas = student.fichasEstudiante || [];

  return (
    <div className="space-y-4">
      <HealthManagementTab student={student} />
      <div className="pt-2">
        <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <IconShieldCheck className="size-4 text-primary" /> Fichas y
              Evaluaciones Psicopedagógicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            {fichas.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No hay observaciones psicopedagógicas registradas.
              </p>
            ) : (
              <div className="divide-y divide-border/40">
                {fichas.map((f: any) => (
                  <div key={f.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {f.motivo || "Ficha Psicopedagógica"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(f.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {f.observaciones ||
                        f.diagnostico ||
                        "Sin observaciones adicionales."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ExpedienteHeaderActions({
  primaryGuardian,
  fullName,
}: {
  primaryGuardian?: any;
  fullName: string;
}) {
  const handleOpenWhatsapp = () => {
    if (!primaryGuardian?.telefono) return;
    const cleanPhone = primaryGuardian.telefono.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Estimado(a) ${primaryGuardian.name || "Apoderado"}, le saludamos de la institución educativa con relación al estudiante ${fullName}.`,
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {primaryGuardian?.telefono && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenWhatsapp}
          className="rounded-xl h-9 text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
        >
          <IconBrandWhatsapp className="size-4" />
          <span className="hidden sm:inline">WhatsApp Apoderado</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        asChild
        className="rounded-xl h-9 text-xs font-bold gap-1.5 border-border/60 bg-card cursor-pointer shadow-2xs"
      >
        <Link href="/gestion/estudiantes">
          <IconArrowLeft className="size-4" />
          <span>Volver al Padrón</span>
        </Link>
      </Button>
    </div>
  );
}

function ExpedienteTabsContent({
  student,
  primaryGuardian,
  cronogramas,
  fullName,
}: {
  student: any;
  primaryGuardian: any;
  cronogramas: any[];
  fullName: string;
}) {
  return (
    <>
      <TabsContent value="general" className="space-y-4">
        <StudentGeneralTab
          student={student}
          primaryGuardian={primaryGuardian}
        />
      </TabsContent>

      <TabsContent value="familia">
        <FamilyManagementTab
          studentId={student.id}
          familyRelations={student.padresTutores || []}
        />
      </TabsContent>

      <TabsContent value="academico" className="space-y-4">
        <StudentAcademicTab student={student} />
      </TabsContent>

      <TabsContent value="pensiones" className="space-y-4">
        <StudentPagosTab cronogramas={cronogramas} />
      </TabsContent>

      <TabsContent value="salud" className="space-y-4">
        <StudentSaludTab student={student} />
      </TabsContent>

      <TabsContent value="logros" className="space-y-4">
        <AchievementsTab studentId={student.id} />
        <DisciplineTab studentId={student.id} />
      </TabsContent>

      <TabsContent value="documentos" className="space-y-4">
        <StudentDocumentosTab studentId={student.id} fullName={fullName} />
      </TabsContent>
    </>
  );
}

export function StudentExpedienteView({ student }: StudentExpedienteViewProps) {
  const [activeTab, setActiveTab] = useState("general");

  const fullName =
    `${student.name} ${student.apellidoPaterno || ""} ${student.apellidoMaterno || ""}`.trim();
  const initials = `${student.name?.[0] || ""}${student.apellidoPaterno?.[0] || ""}`;

  const primaryGuardian =
    student.padresTutores?.find((p: any) => p.contactoPrimario)?.padreTutor ||
    student.padresTutores?.[0]?.padreTutor;

  const cronogramas = student.cronogramaPagos || [];
  const { pagosVencidos, totalDeuda } = computePagosKpis(cronogramas);
  const asistenciaPorcentaje = computeAsistenciaPercentage(student.asistencias || []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      <PageHeader
        icon={<IconUser size={20} />}
        title={fullName}
        badge={student.estado?.nombre || "Estudiante"}
        description={`DNI: ${student.dni || "S/D"} · Código SIAGIE: ${student.codigoSiagie || "No asignado"} · ${student.nivelAcademico?.grado?.nombre || ""} "${student.nivelAcademico?.seccion || ""}"`}
        breadcrumbs={[
          { label: "Personas", href: "/gestion/estudiantes" },
          { label: "Estudiantes", href: "/gestion/estudiantes" },
          { label: student.name || "Expediente" },
        ]}
        actions={
          <ExpedienteHeaderActions
            primaryGuardian={primaryGuardian}
            fullName={fullName}
          />
        }
      />

      <StudentHeroCard
        student={student}
        fullName={fullName}
        initials={initials}
        asistenciaPorcentaje={asistenciaPorcentaje}
        pagosVencidos={pagosVencidos}
        totalDeuda={totalDeuda}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <ExpedienteTabsNav familyCount={student.padresTutores?.length || 0} />
        <ExpedienteTabsContent
          student={student}
          primaryGuardian={primaryGuardian}
          cronogramas={cronogramas}
          fullName={fullName}
        />
      </Tabs>
    </div>
  );
}
