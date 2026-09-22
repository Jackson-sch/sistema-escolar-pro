"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/badge";
import {
  getCurricularPlanForSectionAction,
  generateBatchCnebEvaluationsAction,
} from "@/actions/evaluations/batch-cneb-generator";
import type { CurricularPlanResult } from "@/actions/evaluations/batch-cneb-types";
import { EscalaCalificacion } from "@prisma/client";
import { CnebBatchHeaderSelectors } from "./cneb-batch-header-selectors";
import { CnebBatchCourseList } from "./cneb-batch-course-list";
import { CnebBatchConfigPanel } from "./cneb-batch-config-panel";

interface CnebBatchGeneratorDialogProps {
  periodos: Array<{ id: string; nombre: string }>;
  secciones: Array<{
    id: string;
    seccion: string;
    nivelId?: string;
    gradoId?: string;
    grado?: { id?: string; nombre: string };
    nivel?: { id?: string; nombre: string };
  }>;
  profesorId?: string;
  triggerClassName?: string;
}

export function CnebBatchGeneratorDialog({
  periodos,
  secciones,
  profesorId,
  triggerClassName,
}: CnebBatchGeneratorDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedPeriodoId, setSelectedPeriodoId] = React.useState(
    periodos[0]?.id || "",
  );
  const [selectedSeccionId, setSelectedSeccionId] = React.useState(
    secciones[0]?.id || "",
  );

  const [plan, setPlan] = React.useState<CurricularPlanResult | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const [selectedMap, setSelectedMap] = React.useState<Record<string, string[]>>({});
  const [selectedTipoId, setSelectedTipoId] = React.useState("");
  const [escala, setEscala] = React.useState<EscalaCalificacion>(
    EscalaCalificacion.LITERAL,
  );
  const [selectedParalelas, setSelectedParalelas] = React.useState<string[]>([]);

  const loadPlan = React.useCallback(async (secId: string, perId: string) => {
    if (!secId || !perId) return;
    setIsLoadingPlan(true);
    try {
      const res = await getCurricularPlanForSectionAction(secId, perId, profesorId);
      if (res.data) {
        setPlan(res.data);
        setEscala(res.data.seccion.escalaRecomendada);
        if (res.data.tiposEvaluacion.length > 0) {
          const sumativa = res.data.tiposEvaluacion.find((t) => t.codigo === "SUMA");
          setSelectedTipoId(sumativa ? sumativa.id : res.data.tiposEvaluacion[0].id);
        }
        const initialMap: Record<string, string[]> = {};
        res.data.cursos.forEach((curso) => {
          initialMap[curso.id] = curso.competencias.map((c) => c.id);
        });
        setSelectedMap(initialMap);
        setSelectedParalelas([]);
      } else {
        toast.error(res.error || "No se pudo cargar el plan curricular");
      }
    } catch {
      toast.error("Error al cargar la información curricular");
    } finally {
      setIsLoadingPlan(false);
    }
  }, [profesorId]);

  React.useEffect(() => {
    if (open && selectedSeccionId && selectedPeriodoId) {
      loadPlan(selectedSeccionId, selectedPeriodoId);
    }
  }, [open, selectedSeccionId, selectedPeriodoId, loadPlan]);

  const handleToggleCompetencia = (cursoId: string, compId: string) => {
    setSelectedMap((prev) => {
      const current = prev[cursoId] || [];
      const updated = current.includes(compId)
        ? current.filter((id) => id !== compId)
        : [...current, compId];
      return { ...prev, [cursoId]: updated };
    });
  };

  const handleToggleCourseAll = (
    cursoId: string,
    allIds: string[],
    checked: boolean,
  ) => {
    setSelectedMap((prev) => ({
      ...prev,
      [cursoId]: checked ? allIds : [],
    }));
  };

  const handleToggleParalela = (id: string) => {
    setSelectedParalelas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const totalCompsSelected = Object.values(selectedMap).reduce(
    (acc, ids) => acc + ids.length,
    0,
  );
  const totalSectionsCount = 1 + selectedParalelas.length;
  const grandTotalEvaluaciones = totalCompsSelected * totalSectionsCount;

  const handleGenerate = async () => {
    if (totalCompsSelected === 0) {
      toast.warning("Selecciona al menos una competencia para evaluar");
      return;
    }

    setIsGenerating(true);
    try {
      const cursosConCompetencias = Object.entries(selectedMap)
        .filter(([, ids]) => ids.length > 0)
        .map(([cursoId, competenciaIds]) => ({ cursoId, competenciaIds }));

      const res = await generateBatchCnebEvaluationsAction({
        periodoId: selectedPeriodoId,
        cursosConCompetencias,
        tipoEvaluacionId: selectedTipoId,
        escala,
        replicateSectionIds: selectedParalelas,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success || "Evaluaciones generadas correctamente");
        setOpen(false);
      }
    } catch {
      toast.error("Error al procesar la creación masiva");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={
            triggerClassName ||
            "rounded-xl h-9 text-xs font-bold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm cursor-pointer transition-all active:scale-95"
          }
        >
          <IconSparkles className="size-4 animate-pulse" />
          <span>Asistente CNEB</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[620px] max-h-[92vh] flex flex-col p-5 gap-4 rounded-3xl border-border/50">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <IconSparkles className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-extrabold tracking-tight">
                  Generador de Evaluaciones CNEB
                </DialogTitle>
                <Badge variant="outline" className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  1-Clic
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Crea las evaluaciones oficiales por competencia para el reporte del SIAGIE.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <CnebBatchHeaderSelectors
          secciones={secciones}
          selectedSeccionId={selectedSeccionId}
          onSeccionChange={setSelectedSeccionId}
          periodos={periodos}
          selectedPeriodoId={selectedPeriodoId}
          onPeriodoChange={setSelectedPeriodoId}
        />

        {/* Contenido Principal con Scroll */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {isLoadingPlan ? (
            <div className="py-14 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <IconLoader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-medium">Cargando malla y competencias CNEB...</span>
            </div>
          ) : plan ? (
            <>
              <CnebBatchCourseList
                cursos={plan.cursos}
                selectedMap={selectedMap}
                onToggleCompetencia={handleToggleCompetencia}
                onToggleCourseAll={handleToggleCourseAll}
              />
              <CnebBatchConfigPanel
                tipos={plan.tiposEvaluacion}
                selectedTipoId={selectedTipoId}
                onTipoChange={setSelectedTipoId}
                escala={escala}
                onEscalaChange={setEscala}
                seccionesParalelas={plan.seccionesParalelas}
                selectedParalelas={selectedParalelas}
                onToggleParalela={handleToggleParalela}
              />
            </>
          ) : null}
        </div>

        {/* Footer con Resumen y Botón de Acción */}
        <DialogFooter className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px] font-bold">
              {grandTotalEvaluaciones} evaluaciones
            </Badge>
            <span className="text-[11px]">
              ({totalCompsSelected} por aula en {totalSectionsCount} {totalSectionsCount === 1 ? "sección" : "secciones"})
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isGenerating}
              className="rounded-xl text-xs h-9"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating || totalCompsSelected === 0 || isLoadingPlan}
              className="rounded-xl text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
            >
              {isGenerating ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconSparkles className="size-3.5" />
              )}
              <span>Generar Plan CNEB</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
