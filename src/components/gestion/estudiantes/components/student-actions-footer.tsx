import { IconEdit, IconId } from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { StudentCardPDF } from "@/components/gestion/estudiantes/components/student-card-pdf";
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
    };
  };
}

export function StudentActionsFooter({
  student,
  isProfessor,
  onEdit,
  metaData,
}: StudentActionsFooterProps) {
  return (
    <div className="p-4 md:p-6 border-t border-border/40 bg-card space-y-3">
      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        {!isProfessor && (
          <Button
            variant="outline"
            className="w-full rounded-full text-[11px] md:text-sm h-9 md:h-10"
            onClick={onEdit}
          >
            <IconEdit className="size-3.5 md:size-4 mr-1.5 md:mr-2 text-blue-500" />{" "}
            Editar Ficha
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
                lema: metaData?.institucion?.lema || "Excelencia Educativa",
                codigoModular: metaData?.institucion?.codigoModular || "---",
              }}
            />
          }
          fileName={`Carnet-${student.dni}.pdf`}
          className="w-full"
        >
          {({ loading }) => (
            <Button
              variant="outline"
              className="w-full rounded-full text-[11px] md:text-sm h-9 md:h-10"
              disabled={loading}
            >
              <IconId className="size-3.5 md:size-4 mr-1.5 md:mr-2" />
              {loading ? "..." : "Ver Carnet"}
            </Button>
          )}
        </PDFDownloadLink>
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
