"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconFileText, IconTable, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { FinanceReportPDF } from "../finance-report-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false },
);

interface ReportHeaderBannerProps {
  isMounted: boolean;
  isExportingExcel: boolean;
  onExportExcel: () => void;
  pdfData: any;
  institucion: any;
  todayStamp: string;
}

export function ReportHeaderBanner({
  isMounted,
  isExportingExcel,
  onExportExcel,
  pdfData,
  institucion,
  todayStamp,
}: ReportHeaderBannerProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/60 shadow-2xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
          <Sparkles size={18} />
        </div>
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground">
              Consolidado de Recaudación y Balance
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-primary/30 text-primary bg-primary/5 px-2 py-0"
            >
              Tiempo Real
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-normal truncate">
            Auditoría de ingresos proyectados vs reales, morosidad por nivel y proyecciones.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          disabled={isExportingExcel}
          onClick={onExportExcel}
          className="flex-1 md:flex-none rounded-xl font-bold gap-1.5 px-3 h-8.5 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 cursor-pointer shadow-2xs transition-all hover:scale-[1.02] text-xs"
        >
          {isExportingExcel ? (
            <IconLoader2 className="size-3.5 animate-spin" />
          ) : (
            <IconTable className="size-3.5 text-emerald-600" />
          )}
          <span>{isExportingExcel ? "Generando..." : "Exportar Excel Oficial"}</span>
        </Button>

        {isMounted && (
          <PDFDownloadLink
            document={
              <FinanceReportPDF data={pdfData} institucion={institucion} />
            }
            fileName={`Reporte_Finanzas_${todayStamp}.pdf`}
          >
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none rounded-xl font-bold gap-1.5 px-3 h-8.5 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 cursor-pointer shadow-2xs transition-all hover:scale-[1.02] text-xs"
            >
              <IconFileText className="size-3.5 text-red-600" />
              <span>Descargar PDF</span>
            </Button>
          </PDFDownloadLink>
        )}
      </div>
    </div>
  );
}
