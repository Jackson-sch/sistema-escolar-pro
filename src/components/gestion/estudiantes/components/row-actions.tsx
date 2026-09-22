"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconFilePlus,
  IconDownload,
  IconExternalLink,
} from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

import { FormDrawer } from "@/components/modals/form-drawer";
import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";

import { deleteStudentAction } from "@/actions/students";
import { getGradeReportDataAction } from "@/actions/reports";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { useCurrentRole } from "@/hooks/use-current-role";

const StudentForm = dynamic(
  () =>
    import(
      "@/components/gestion/estudiantes/management/student-form"
    ).then((m) => ({ default: m.StudentForm })),
  { ssr: false },
);
const ConfirmModal = dynamic(
  () =>
    import("@/components/modals/confirm-modal").then((m) => ({
      default: m.ConfirmModal,
    })),
  { ssr: false },
);
const ViewStudentSheet = dynamic(
  () =>
    import(
      "@/components/gestion/estudiantes/management/view-student-sheet"
    ).then((m) => ({ default: m.ViewStudentSheet })),
  { ssr: false },
);
const EnrollmentForm = dynamic(
  () =>
    import(
      "@/components/gestion/matriculas/management/enrollment-form"
    ).then((m) => ({ default: m.EnrollmentForm })),
  { ssr: false },
);

interface RowActionsProps {
  row: Row<StudentTableType>;
  table: Table<StudentTableType>;
}

export function RowActions({ row, table }: RowActionsProps) {
  const router = useRouter();
  const role = useCurrentRole();
  const canManage = role === "administrativo" || role === "super_admin";
  const isProfessor = role === "profesor";

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloadingGradeReport, setIsDownloadingGradeReport] = useState(false);
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

  const metaData = table.options.meta as {
    instituciones: any[];
    estados: any[];
    nivelesAcademicos: any[];
    institucion: any;
  };

  const isEnrolled = !!student.matriculadoEsteAnio;
  const year = new Date().getFullYear();

  const downloadGradeReport = async () => {
    if (isDownloadingGradeReport) return;
    setIsDownloadingGradeReport(true);
    try {
      const report = await getGradeReportDataAction(student.id, year);
      if (!report.data) {
        throw new Error(report.error || "No se pudieron obtener los datos de la boleta.");
      }

      const [{ pdf }, { GradeReportPDF }, qrModule] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/reports/grade-report-pdf"),
        import("qrcode"),
      ]);
      const verificationCode = `LIB-${report.data.estudiante.dni || student.id}-${year}`;
      const qrCode = await qrModule.default.toDataURL(
        `${window.location.origin}/verificar?codigo=${verificationCode}`,
        { margin: 1, width: 160 },
      );
      const blob = await pdf(
        <GradeReportPDF
          data={{ ...report.data, origin: window.location.origin, qrCode } as any}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Libreta_${student.dni || student.id}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Libreta descargada correctamente.");
    } catch (error) {
      console.error("Error al descargar libreta:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo descargar la libreta. Inténtalo nuevamente.",
      );
    } finally {
      setIsDownloadingGradeReport(false);
    }
  };

  const actions: ActionItem[] = ([
    {
      icon: IconEye,
      label: "Vista Rápida",
      onClick: () => setShowViewSheet(true),
      variant: "ghost",
      className: "rounded-full",
    },
    {
      icon: IconExternalLink,
      label: "Expediente Completo",
      onClick: () => router.push(`/gestion/estudiantes/${student.id}`),
      variant: "ghost",
      className: "text-primary rounded-full",
    },
    !!student.nivelAcademico && {
      icon: IconDownload,
      label: "Libreta de Notas",
      onClick: downloadGradeReport,
      variant: "ghost",
      className: "text-violet-500 rounded-full",
      disabled: isDownloadingGradeReport,
    },
    ...(canManage
      ? [
          !isEnrolled && {
            icon: IconFilePlus,
            label: "Matricular Alumno",
            onClick: () => setShowEnrollmentDialog(true),
            variant: "ghost",
            className: "text-emerald-500 rounded-full",
          },
          {
            icon: IconEdit,
            label: "Editar Datos",
            onClick: () => setShowEditDialog(true),
            variant: "ghost",
            className: "text-blue-500 rounded-full",
          },
          { isSeparator: true },
          {
            icon: IconTrash,
            label: "Dar de Baja",
            onClick: () => setShowConfirmModal(true),
            variant: "ghost",
            className: "text-red-500 rounded-full",
          },
        ]
      : []),
  ].filter(Boolean) as ActionItem[]);

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Opciones" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Dar de Baja Estudiante"
        description={`¿Estás seguro de eliminar a ${student.name} ${student.apellidoPaterno}? Esta acción es irreversible y el alumno perderá su registro histórico.`}
      />

      <FormDrawer
        title="Editar Estudiante"
        description="Modifique los datos personales y académicos del alumno."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <StudentForm
          id={student.id}
          initialData={student}
          onSuccess={() => setShowEditDialog(false)}
          instituciones={metaData?.instituciones || []}
          estados={metaData?.estados || []}
        />
      </FormDrawer>

      <FormDrawer
        title={`Inscripción Académica ${year}`}
        description={`Formalice la vacante de ${student.name} ${student.apellidoPaterno} para el nuevo periodo lectivo.`}
        isOpen={showEnrollmentDialog}
        onOpenChange={setShowEnrollmentDialog}
      >
        {showEnrollmentDialog && (
          <EnrollmentForm
            onSuccess={() => {
              setShowEnrollmentDialog(false);
            }}
            onCancel={() => setShowEnrollmentDialog(false)}
            nivelesAcademicos={metaData?.nivelesAcademicos || []}
            defaultStudentId={student.id}
          />
        )}
      </FormDrawer>

      <ViewStudentSheet
        student={student}
        isOpen={showViewSheet}
        onOpenChange={setShowViewSheet}
        isProfessor={isProfessor}
        onEdit={() => setShowEditDialog(true)}
        metaData={metaData}
      />
    </>
  );
}
