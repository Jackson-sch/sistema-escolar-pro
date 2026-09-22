"use client";

import { useState } from "react";
import {
  IconFileSpreadsheet,
  IconLoader2,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ParseResult } from "@/lib/excel";
import { importStudentsBulkAction } from "@/actions/students";
import { toast } from "sonner";
import { ImportStepUpload } from "./import-step-upload";
import { ImportStepPreview } from "./import-step-preview";

interface ImportStudentsDialogProps {
  nivelesAcademicos?: any[];
}

const DEFAULT_NIVELES_ACADEMICOS: any[] = [];

export function ImportStudentsDialog({
  nivelesAcademicos = DEFAULT_NIVELES_ACADEMICOS,
}: ImportStudentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [defaultSectionId, setDefaultSectionId] = useState<string>("none");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleParsed = (result: ParseResult) => {
    setParseResult(result);
    setStep("preview");
  };

  const handleReset = () => {
    setStep("upload");
    setParseResult(null);
    setDefaultSectionId("none");
  };

  const handleExecuteImport = async () => {
    if (!parseResult) return;

    // Solo importar filas válidas y con advertencias leves (descartar errores críticos)
    const validRows = parseResult.rows.filter((r) => r.status !== "error");
    if (validRows.length === 0) {
      toast.error(
        "No hay registros válidos para importar. Corrige los errores en el archivo Excel.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = validRows.map((r) => ({
        dni: r.dni,
        apellidoPaterno: r.apellidoPaterno,
        apellidoMaterno: r.apellidoMaterno,
        nombres: r.nombres,
        genero: r.genero,
        fechaNacimiento: r.fechaNacimiento,
        codigoSiagie: r.codigoSiagie,
        telefono: r.telefono,
        email: r.email,
        direccion: r.direccion,
        nivel: r.nivel,
        grado: r.grado,
        seccion: r.seccion,
        dniApoderado: r.dniApoderado,
        apoderadoNombre: r.apoderadoNombre,
        telefonoApoderado: r.telefonoApoderado,
        parentesco: r.parentesco,
      }));

      const sectionId =
        defaultSectionId !== "none" ? defaultSectionId : undefined;
      const res = await importStudentsBulkAction(payload, sectionId);

      if ("error" in res && res.error) {
        toast.error(res.error);
        return;
      }

      if ("success" in res && res.success) {
        toast.success("¡Importación masiva completada con éxito!", {
          description: `${res.createdCount} creados, ${res.updatedCount} actualizados.${
            res.errorsCount > 0 ? ` (${res.errorsCount} omitidos)` : ""
          }`,
        });
        setOpen(false);
        handleReset();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al ejecutar la importación masiva");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount =
    parseResult?.rows.filter((r) => r.status !== "error").length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) handleReset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer hover:bg-muted/80 shadow-2xs"
        >
          <IconFileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Importar Excel</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl rounded-3xl p-6 border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <IconFileSpreadsheet className="size-5 text-emerald-600" />
            Importación Masiva de Estudiantes
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {step === "upload"
              ? "Carga un archivo Excel (.xlsx o .xls) con el padrón de estudiantes."
              : "Revisa la validación de los datos antes de guardarlos en el sistema."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <ImportStepUpload
            onParsed={handleParsed}
            isProcessing={isSubmitting}
          />
        ) : (
          parseResult && (
            <ImportStepPreview
              parseResult={parseResult}
              nivelesAcademicos={nivelesAcademicos}
              defaultSectionId={defaultSectionId}
              onDefaultSectionChange={setDefaultSectionId}
            />
          )
        )}

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/50 mt-2">
          {step === "preview" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isSubmitting}
                className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <IconArrowLeft className="size-4" />
                Cargar otro archivo
              </Button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExecuteImport}
                  disabled={isSubmitting || validCount === 0}
                  className="gap-2 rounded-xl text-xs font-bold cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {isSubmitting ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    <IconCheck className="size-4" />
                  )}
                  {isSubmitting
                    ? "Importando..."
                    : `Confirmar e Importar (${validCount})`}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-end w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
