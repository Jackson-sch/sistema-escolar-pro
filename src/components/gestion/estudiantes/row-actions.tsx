"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconUsers,
  IconPhone,
  IconId,
  IconIdBadge2,
  IconCheck,
  IconSchool,
  IconMapPin,
  IconCalendar,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { StudentCardPDF } from "./student-card-pdf";
import { GradeReportButton } from "@/components/reports/grade-report-button";
import { ReportActions } from "../documentos/report-actions";
import { CertificateActions } from "../documentos/certificate-actions";
import { EnrollmentCertificateActions } from "../documentos/enrollment-certificate-actions";
import { IconFileCertificate } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormModal } from "@/components/modals/form-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { deleteStudentAction } from "@/actions/students";
import { StudentForm } from "./student-form";
import { StudentTableType } from "./columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FamilyManagementTab } from "./family-management-tab";
import { DisciplineTab } from "./discipline-tab";
import { useCurrentRole } from "@/hooks/use-current-role";

interface RowActionsProps {
  row: Row<StudentTableType>;
  table: Table<StudentTableType>;
}

export function RowActions({ row, table }: RowActionsProps) {
  const role = useCurrentRole();
  const isProfessor = role === "profesor";

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const student = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteStudentAction(student.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = `${student.name?.[0] || ""}${
    student.apellidoPaterno?.[0] || ""
  }`;
  const name = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`;

  const metaData = table.options.meta as {
    instituciones: any[];
    estados: any[];
    nivelesAcademicos: any[];
    institucion: any;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[180px] bg-background/95 backdrop-blur-xl border-border/40"
        >
          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5">
            Opciones
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowViewSheet(true)}
            className="text-[13px] py-2 cursor-pointer transition-colors"
          >
            <IconEye className="mr-2 h-4 w-4 text-violet-500" />
            Ver Expediente
          </DropdownMenuItem>
          {!isProfessor && (
            <>
              <DropdownMenuItem
                onClick={() => setShowEditDialog(true)}
                className="text-[13px] py-2 cursor-pointer transition-colors"
              >
                <IconEdit className="mr-2 h-4 w-4 text-blue-500" />
                Editar Datos
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={() => setShowConfirmModal(true)}
                className="text-[13px] py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Dar de Baja
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Dar de Baja Estudiante"
        description={`¿Estás seguro de eliminar a ${student.name} ${student.apellidoPaterno}? Esta acción es irreversible y el alumno perderá su registro histórico.`}
      />

      <FormModal
        title="Editar Estudiante"
        description="Modifique los datos personales y académicos del alumno."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-4xl"
      >
        <StudentForm
          id={student.id}
          initialData={student}
          onSuccess={() => setShowEditDialog(false)}
          instituciones={metaData?.instituciones || []}
          estados={metaData?.estados || []}
        />
      </FormModal>

      <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
        <SheetContent className="sm:max-w-lg p-0 border-l border-border/40 bg-background/95 backdrop-blur-xl flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Expediente: {student.name}</SheetTitle>
            <SheetDescription>
              Detalles completos del estudiante
            </SheetDescription>
          </SheetHeader>

          {/* Header del Perfil - Premium Aesthetic */}
          <div className="relative pt-12 pb-8 px-6 border-b border-border/40 overflow-hidden">
            {/* Background elements for premium look */}
            <div className="absolute inset-0 bg-linear-to-b from-violet-600/10 via-background to-background" />
            <div className="absolute -top-24 -right-24 size-64 bg-violet-600/10 blur-[100px] rounded-full" />
            <div className="absolute -top-24 -left-24 size-64 bg-indigo-600/10 blur-[100px] rounded-full" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-500/20 blur-2xl rounded-full animate-pulse" />
                <Avatar className="size-28 border-[3px] border-background shadow-2xl relative z-10 transition-transform hover:scale-105 duration-500">
                  <AvatarImage
                    src={student.image || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-black bg-linear-to-br from-violet-600 to-indigo-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h2 className="text-2xl font-black tracking-tight text-foreground/90 mb-2 uppercase drop-shadow-sm">
                {name}
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-[10px] font-black uppercase tracking-widest h-6 px-3 border-border/20 backdrop-blur-md"
                >
                  DNI: {student.dni}
                </Badge>
                <Badge
                  style={{
                    borderColor: `${student.estado.color}30` || undefined,
                    color: student.estado.color || undefined,
                    backgroundColor: `${student.estado.color}10` || undefined,
                  }}
                  className="text-[10px] font-black uppercase tracking-widest h-6 px-3 border shadow-none backdrop-blur-md"
                  variant="outline"
                >
                  {student.estado.nombre}
                </Badge>
              </div>
            </div>
          </div>

          <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 py-2 border-b border-border/40 bg-muted/5 shrink-0">
              <TabsList className="bg-transparent h-10 w-full justify-start gap-6 p-0">
                <TabsTrigger
                  value="general"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-violet-600 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="familia"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-violet-600 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground"
                >
                  Familia
                </TabsTrigger>
                <TabsTrigger
                  value="disciplina"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-violet-600 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground"
                >
                  Disciplina
                </TabsTrigger>
                <TabsTrigger
                  value="asistencia"
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-violet-600 rounded-none h-full data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground opacity-40 cursor-not-allowed"
                >
                  Logros
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6">
                <TabsContent
                  value="general"
                  className="mt-0 space-y-8 animate-in fade-in-0 duration-500"
                >
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2.5 ml-1">
                      <div className="size-1.5 rounded-full bg-muted-foreground/30" />{" "}
                      Formación Académica
                    </h4>
                    <Card className="relative overflow-hidden border-border/40 bg-muted/5 rounded-2xl shadow-none group transition-colors hover:bg-muted/10">
                      <CardContent className="p-0 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/40">
                        {student.nivelAcademico ? (
                          <>
                            <div className="p-6 flex-1 relative z-10">
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2 opacity-60">
                                Grado y Sección
                              </p>
                              <div className="flex items-center gap-2">
                                <IconSchool className="size-4 text-violet-500" />
                                <p className="text-base font-black text-foreground uppercase tracking-tight">
                                  {student.nivelAcademico.grado.nombre} -{" "}
                                  {student.nivelAcademico.seccion}
                                </p>
                              </div>
                            </div>
                            <div className="p-6 flex-1 relative z-10">
                              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2 opacity-60">
                                Nivel Académico
                              </p>
                              <p className="text-base font-black text-foreground uppercase tracking-tight ml-1">
                                {student.nivelAcademico.nivel?.nombre || "N/A"}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="p-6 w-full flex items-center justify-center gap-4 bg-red-500/5 relative z-10">
                            <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                              <IconAlertCircle className="size-5 text-red-500" />
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-black text-red-500 uppercase tracking-tight">
                                Sin Matrícula Activa
                              </p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                Ciclo Académico 2026
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2.5 ml-1">
                      <div className="size-1.5 rounded-full bg-muted-foreground/30" />{" "}
                      Localización
                    </h4>
                    <div className="rounded-2xl border border-border/40 bg-muted/5 p-6 shadow-none relative overflow-hidden group transition-colors hover:bg-muted/10">
                      <div className="flex gap-4 items-start mb-6">
                        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0 mt-1">
                          <IconMapPin className="size-4 text-blue-500" />
                        </div>
                        <p className="text-[14px] font-bold text-foreground/80 leading-relaxed tracking-tight">
                          {student.direccion}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-8 ml-12">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mb-1.5">
                            Distrito
                          </span>
                          <span className="text-xs font-black text-foreground uppercase tracking-wide">
                            {student.distrito}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mb-1.5">
                            Provincia
                          </span>
                          <span className="text-xs font-black text-foreground uppercase tracking-wide">
                            {student.provincia}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2.5 ml-1">
                      <div className="size-1.5 rounded-full bg-muted-foreground/30" />{" "}
                      Registro
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-border/40 bg-muted/5 group hover:bg-muted/10 transition-colors">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block mb-2 opacity-60">
                          Fecha Ingreso
                        </span>
                        <div className="flex items-center gap-2">
                          <IconCalendar className="size-3.5 text-emerald-500" />
                          <span className="text-xs font-black uppercase tracking-wide">
                            {student.fechaIngreso
                              ? new Date(
                                  student.fechaIngreso
                                ).toLocaleDateString()
                              : "---"}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 rounded-2xl border border-border/40 bg-linear-to-br from-background via-background to-emerald-500/5 group">
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest block mb-2 opacity-60">
                          Nacionalidad
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="size-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[8px] font-bold">
                            PE
                          </div>
                          <span className="text-xs font-black uppercase tracking-wide">
                            {student.nacionalidad}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="familia"
                  className="mt-0 animate-in translate-x-4 duration-500"
                >
                  <FamilyManagementTab
                    studentId={student.id}
                    familyRelations={(student as any).padresTutores || []}
                  />
                </TabsContent>

                <TabsContent
                  value="disciplina"
                  className="mt-0 animate-in translate-x-4 duration-500"
                >
                  <DisciplineTab studentId={student.id} />
                </TabsContent>

                <TabsContent value="asistencia" className="mt-0">
                  {/* Espacio para futuros módulos de disciplina y logros */}
                </TabsContent>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border/40 bg-muted/5 space-y-4">
              {/* Primary Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                {!isProfessor && (
                  <Button
                    variant="outline"
                    className="w-full font-black uppercase tracking-widest text-[10px] h-11 border-border/40 hover:bg-muted/50 transition-all rounded-xl"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <IconEdit className="size-4 mr-2 text-blue-500" /> Editar
                    Ficha
                  </Button>
                )}

                <PDFDownloadLink
                  document={
                    <StudentCardPDF
                      student={student as any}
                      institucion={{
                        nombreInstitucion:
                          metaData?.institucion?.nombreInstitucion ||
                          "SISTEMA ESCOLAR PRO",
                        lema:
                          metaData?.institucion?.lema || "Excelencia Educativa",
                        codigoModular:
                          metaData?.institucion?.codigoModular || "---",
                      }}
                    />
                  }
                  fileName={`Carnet-${student.dni}.pdf`}
                  className="w-full"
                >
                  {({ loading }) => (
                    <Button
                      className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-[10px] h-11 shadow-xl shadow-violet-500/20 rounded-xl"
                      disabled={loading}
                    >
                      <IconId className="size-4 mr-2" />
                      {loading ? "..." : "Ver Carnet"}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>

              {/* Document/Academic Actions Grid */}
              <div className="grid grid-cols-2 gap-3">
                <ReportActions
                  studentId={student.id}
                  anioAcademico={new Date().getFullYear()}
                />

                <GradeReportButton
                  studentId={student.id}
                  studentName={`${student.name} ${student.apellidoPaterno}`}
                  anioAcademico={new Date().getFullYear()}
                />
              </div>

              {!isProfessor && (
                <>
                  {/* Legal/Official Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <CertificateActions
                      studentId={student.id}
                      studentName={`${student.name} ${student.apellidoPaterno}`}
                    />

                    <EnrollmentCertificateActions
                      studentId={student.id}
                      studentName={`${student.name} ${student.apellidoPaterno}`}
                    />
                  </div>
                </>
              )}
            </div>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
