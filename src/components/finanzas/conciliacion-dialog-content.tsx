"use client";

import React, { useState } from "react";
import {
  IconUpload,
  IconCheck,
  IconAlertCircle,
  IconFileSpreadsheet,
  IconDownload,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { downloadConciliacionTemplate } from "@/lib/excel/templates/conciliacion-bancaria-template";
import type {
  TransaccionBancariaItem,
  ConciliacionResult,
} from "@/actions/finance/conciliacion";

interface ConciliacionUploadSectionProps {
  fileName: string;
  parsedData: TransaccionBancariaItem[];
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ConciliacionUploadSection({
  fileName,
  parsedData,
  onFileUpload,
}: ConciliacionUploadSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDownloading(true);
    try {
      await downloadConciliacionTemplate();
      toast.success("Plantilla oficial descargada con éxito");
    } catch (err) {
      console.error("Error al descargar plantilla:", err);
      toast.error("No se pudo generar la plantilla Excel");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner de Descarga de Plantilla Oficial */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-gradient-to-r from-sky-500/10 via-sky-500/5 to-transparent border border-sky-500/20 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <IconFileSpreadsheet className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">
              ¿No tienes el formato bancario?
            </p>
            <p className="text-[11px] text-muted-foreground">
              Descarga nuestra plantilla oficial con datos de ejemplo
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isDownloading}
          className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-sky-500/30 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15 hover:border-sky-500/40 cursor-pointer w-full sm:w-auto shrink-0 shadow-2xs"
        >
          {isDownloading ? (
            <IconLoader2 className="size-3.5 animate-spin" />
          ) : (
            <IconDownload className="size-3.5" />
          )}
          <span>Descargar Plantilla Excel</span>
        </Button>
      </div>

      <div className="border-2 border-dashed border-border/80 hover:border-sky-500/50 rounded-2xl p-6 text-center transition-colors bg-muted/10">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          id="file-conciliacion"
          className="hidden"
          onChange={onFileUpload}
        />
        <label
          htmlFor="file-conciliacion"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <IconFileSpreadsheet className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold">
              {fileName || "Seleccionar archivo Excel o CSV"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Columnas requeridas: DNI/Código, Monto, N° Operación
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-xl text-xs pointer-events-none mt-1"
          >
            <IconUpload className="size-3.5 mr-1.5" />
            Examinar Archivo
          </Button>
        </label>
      </div>

      {parsedData.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold px-1">
            <span>Registros listos para conciliar:</span>
            <Badge variant="outline" className="text-sky-600 border-sky-500/30">
              {parsedData.length} transacciones
            </Badge>
          </div>

          <div className="border rounded-xl max-h-48 overflow-y-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/40 sticky top-0 text-[11px] font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="p-2">DNI / Código</th>
                  <th className="p-2">Monto</th>
                  <th className="p-2">Operación</th>
                  <th className="p-2">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedData.slice(0, 50).map((t) => (
                  <tr
                    key={`${t.identificador}-${t.referencia}-${t.monto}`}
                    className="hover:bg-muted/20"
                  >
                    <td className="p-2 font-mono font-medium">{t.identificador}</td>
                    <td className="p-2 font-semibold">S/ {t.monto.toFixed(2)}</td>
                    <td className="p-2 text-muted-foreground">{t.referencia}</td>
                    <td className="p-2 text-muted-foreground">{t.canal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConciliacionResultsSectionProps {
  result: ConciliacionResult;
}

export function ConciliacionResultsSection({
  result,
}: ConciliacionResultsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-emerald-600">
            Conciliados
          </p>
          <p className="text-xl font-bold text-emerald-700">
            {result.exitosos}
          </p>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-amber-600">
            No Encontrados
          </p>
          <p className="text-xl font-bold text-amber-700">
            {result.noEncontrados}
          </p>
        </div>
        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-center">
          <p className="text-[10px] uppercase font-bold text-sky-600">
            Total Recaudado
          </p>
          <p className="text-xl font-bold text-sky-700">
            S/ {result.montoTotalConciliado.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold px-1">Detalle del Proceso:</p>
        <div className="border rounded-xl max-h-56 overflow-y-auto text-xs divide-y">
          {result.detalles.map((d) => (
            <div
              key={`${d.identificador}-${d.monto}-${d.mensaje}`}
              className="p-2.5 flex items-center justify-between gap-3 text-[11px]"
            >
              <div>
                <span className="font-mono font-bold mr-2">
                  {d.identificador}
                </span>
                {d.estudianteNombre && (
                  <span className="text-muted-foreground mr-2">
                    ({d.estudianteNombre})
                  </span>
                )}
                <p className="text-muted-foreground text-[10px]">
                  {d.mensaje}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold">S/ {d.monto.toFixed(2)}</span>
                {d.estado === "CONCILIADO" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-[10px]">
                    <IconCheck className="size-3 mr-1" />
                    OK
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-amber-600 border-amber-500/30 text-[10px]"
                  >
                    <IconAlertCircle className="size-3 mr-1" />
                    {d.estado}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
