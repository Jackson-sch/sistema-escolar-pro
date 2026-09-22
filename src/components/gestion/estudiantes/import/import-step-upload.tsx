"use client";

import { useState, useRef } from "react";
import {
  IconFileSpreadsheet,
  IconUpload,
  IconDownload,
  IconLoader2,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { downloadStudentImportTemplate, parseStudentsExcelFile, ParseResult } from "@/lib/excel";
import { toast } from "sonner";

interface ImportStepUploadProps {
  onParsed: (result: ParseResult, file: File) => void;
  isProcessing: boolean;
}

export function ImportStepUpload({ onParsed, isProcessing }: ImportStepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast.error("Formato no válido. Por favor sube un archivo Excel (.xlsx o .xls)");
      return;
    }

    setIsLoadingFile(true);
    try {
      const result = await parseStudentsExcelFile(file);
      if (result.totalRows === 0) {
        toast.error("El archivo está vacío o no contiene filas de estudiantes válidas.");
        return;
      }
      onParsed(result, file);
      toast.success(`Archivo procesado: ${result.totalRows} filas detectadas`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al leer el archivo Excel");
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Caja Informativa y Descarga de Plantilla */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
            <IconInfoCircle className="size-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">
              ¿Primera vez importando?
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Descarga la plantilla Excel oficial preformateada con ejemplos y validaciones de campo.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => downloadStudentImportTemplate()}
          className="gap-2 rounded-xl text-xs font-bold shrink-0 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 cursor-pointer shadow-2xs"
        >
          <IconDownload className="size-4" />
          Descargar Plantilla
        </Button>
      </div>

      {/* Dropzone de Carga */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Cargar archivo Excel"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer text-center ${
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border/60 hover:border-primary/50 hover:bg-muted/30 bg-card/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoadingFile || isProcessing}
        />

        <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
          {isLoadingFile ? (
            <IconLoader2 className="size-8 animate-spin" />
          ) : (
            <IconFileSpreadsheet className="size-8" />
          )}
        </div>

        <h3 className="text-sm font-bold text-foreground mb-1">
          {isLoadingFile ? "Procesando archivo Excel..." : "Selecciona o arrastra tu archivo Excel"}
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Soporta formatos <span className="font-semibold text-foreground">.xlsx</span> y <span className="font-semibold text-foreground">.xls</span> con múltiples estudiantes.
        </p>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-5 gap-2 rounded-xl text-xs font-semibold px-4 pointer-events-none"
        >
          <IconUpload className="size-4" />
          Examinar Archivo
        </Button>
      </div>
    </div>
  );
}
