"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconCertificate } from "@tabler/icons-react";
import { CertificateActions } from "@/components/gestion/documentos/certificate-actions";
import { EnrollmentCertificateActions } from "@/components/gestion/documentos/enrollment-certificate-actions";
import { GradeReportButton } from "@/components/reports/grade-report-button";

interface StudentDocumentosTabProps {
  studentId: string;
  fullName: string;
}

export function StudentDocumentosTab({
  studentId,
  fullName,
}: StudentDocumentosTabProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <IconCertificate className="size-4 text-primary" /> Generador de
          Documentos Institucionales
        </CardTitle>
        <CardDescription className="text-xs">
          Emisión y descarga instantánea de constancias y reportes oficiales
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <CertificateActions studentId={studentId} studentName={fullName} />
        <EnrollmentCertificateActions
          studentId={studentId}
          studentName={fullName}
        />
        <GradeReportButton
          studentId={studentId}
          studentName={fullName}
          anioAcademico={new Date().getFullYear()}
        />
      </CardContent>
    </Card>
  );
}
