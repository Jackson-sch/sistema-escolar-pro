"use client";

import { useState } from "react";
import { IconEdit, IconId, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GradeReportButton } from "@/components/reports/grade-report-button";
import { ReportActions } from "@/components/gestion/documentos/report-actions";
import { CertificateActions } from "@/components/gestion/documentos/certificate-actions";
import { EnrollmentCertificateActions } from "@/components/gestion/documentos/enrollment-certificate-actions";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";

interface StudentActionsFooterProps {
  student: StudentTableType;
  isProfessor: boolean;
  onEdit: () => void;
  metaData?: {
    institucion?: {
      nombreInstitucion?: string;
      lema?: string;
      codigoModular?: string;
      logo?: string;
    };
  };
}

import { getStudentCardDataAction } from "@/actions/reports";

function CarnetDownloadButton({ studentId, dni }: { studentId: string; dni: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getStudentCardDataAction(studentId);
      if (!res.data) {
        toast.error(res.error || "Error al obtener datos del carnet");
        return;
      }

      const { pdf } = await import("@react-pdf/renderer");
      const { StudentCardPDF } = await import(
        "@/components/gestion/estudiantes/components/student-card-pdf"
      );

      const blob = await pdf(
        <StudentCardPDF
          student={res.data.student}
          institucion={res.data.institucion}
          qrCode={res.data.qrCode}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Carnet-${dni}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Carnet generado exitosamente");
    } catch (error) {
      console.error("Error al generar carnet:", error);
      toast.error("Error al generar el carnet. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full rounded-full text-xs md:text-sm h-9 md:h-10 font-semibold border-border/60 hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm"
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <IconLoader2 className="size-3.5 md:size-4 mr-1.5 md:mr-2 animate-spin" />
      ) : (
        <IconId className="size-3.5 md:size-4 mr-1.5 md:mr-2 text-indigo-500" />
      )}
      {loading ? "Generando..." : "Ver Carnet"}
    </Button>
  );
}

export function StudentActionsFooter({
  student,
  isProfessor,
  onEdit,
}: StudentActionsFooterProps) {
  return (
    <div className="p-4 md:p-6 border-t border-border/40 bg-card space-y-3">
      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {!isProfessor && (
          <Button
            variant="outline"
            className="w-full rounded-full text-xs md:text-sm h-9 md:h-10 font-semibold border-border/60 hover:bg-accent hover:text-accent-foreground transition-all duration-200 shadow-sm"
            onClick={onEdit}
          >
            <IconEdit className="size-3.5 md:size-4 mr-1.5 md:mr-2 text-blue-500" />{" "}
            Editar Ficha
          </Button>
        )}

        <CarnetDownloadButton studentId={student.id} dni={student.dni} />
      </div>

      {/* Document/Academic Actions Grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
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
          <div className="grid grid-cols-2 gap-2 md:gap-4">
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
  );
}