"use client";

import { useState } from "react";
import { IconFileText, IconLoader2 } from "@tabler/icons-react";
import { getGradeReportDataAction } from "@/actions/reports";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GradeReportButtonProps {
  studentId: string;
  studentName: string;
  anioAcademico?: number;
}

export function GradeReportButton({
  studentId,
  studentName,
  anioAcademico = 2025,
}: GradeReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await getGradeReportDataAction(studentId, anioAcademico);
      if (!res.data) {
        toast.error(res.error || "No se pudieron obtener los datos de la libreta");
        return;
      }

      const { pdf } = await import("@react-pdf/renderer");
      const { GradeReportPDF } = await import("./grade-report-pdf");

      const blob = await pdf(<GradeReportPDF data={res.data as any} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Libreta-${studentName}-${anioAcademico}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Libreta descargada exitosamente");
    } catch (error) {
      console.error("Error al generar libreta:", error);
      toast.error("Error al procesar la libreta de notas");
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
        <IconFileText className="size-3.5 md:size-4 mr-1.5 md:mr-2 text-emerald-500" />
      )}
      {loading ? "Generando..." : "Generar Libreta"}
    </Button>
  );
}
