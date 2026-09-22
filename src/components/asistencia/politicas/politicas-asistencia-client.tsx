"use client";

import { useState, useEffect, useReducer } from "react";
import { IconPlus, IconClock } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getPoliticasAsistenciaAction,
  savePoliticaAsistenciaAction,
  deletePoliticaAsistenciaAction,
} from "@/actions/attendance-policy";
import { getNivelesAction } from "@/actions/academic-structure";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";

import {
  politicaFormInitialState,
  politicaFormReducer,
} from "./components/politicas-types";
import { PoliticaCard } from "./components/politica-card";
import { PoliticasHeader } from "./components/politicas-header";
import { PoliticaDialog } from "./components/politica-dialog";

export function PoliticasAsistenciaClient({
  anioAcademico = 2026,
}: {
  anioAcademico?: number;
}) {
  const [politicas, setPoliticas] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, dispatch] = useReducer(
    politicaFormReducer,
    undefined,
    () => ({
      ...politicaFormInitialState,
    }),
  );

  const [ConfirmDialog, confirm] = useConfirm(
    "¿Está seguro?",
    "Esta acción no se puede deshacer.",
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [politicasRes, nivelesRes] = await Promise.all([
        getPoliticasAsistenciaAction(),
        getNivelesAction(),
      ]);
      if (politicasRes.data) setPoliticas(politicasRes.data);
      if (nivelesRes.data) setNiveles(nivelesRes.data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenDialog = (politica?: any) => {
    dispatch(
      politica ? { type: "OPEN_EDIT", politica } : { type: "OPEN_NEW" },
    );
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const {
      editingPolitica,
      nombre,
      nivelId,
      turno,
      horaEntrada,
      horaSalida,
      tolerancia,
      activo,
    } = formState;

    if (!nombre || !horaEntrada || !horaSalida) {
      toast.error("Por favor complete los campos obligatorios");
      return;
    }
    setIsSaving(true);
    try {
      const res = await savePoliticaAsistenciaAction({
        id: editingPolitica?.id,
        nombre,
        nivelId: nivelId === "all" ? null : nivelId,
        turno: turno === "all" ? null : (turno as any),
        horaEntrada,
        horaSalida,
        tolerancia,
        activo,
      });
      if (res.success) {
        toast.success("Política guardada con éxito");
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    try {
      const res = await deletePoliticaAsistenciaAction(id);
      if (res.success) {
        toast.success("Política eliminada");
        loadData();
      } else {
        toast.error(res.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const activasCount = politicas.filter((p) => p.activo).length;
  const toleranciaPromedio =
    politicas.length > 0
      ? Math.round(
          politicas.reduce((a, p) => a + p.tolerancia, 0) / politicas.length,
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PoliticasHeader
        anioAcademico={anioAcademico}
        isLoading={isLoading}
        politicasCount={politicas.length}
        activasCount={activasCount}
        toleranciaPromedio={toleranciaPromedio}
        onOpenNewDialog={() => handleOpenDialog()}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
          <div className="relative size-12">
            <IconClock className="size-12 opacity-10" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500/40" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">
            Cargando políticas…
          </p>
        </div>
      ) : politicas.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
          <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/50">
            <IconClock className="size-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-foreground">Sin reglas configuradas</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primera política de ingreso para este ciclo.
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            className="gap-2 rounded-xl font-semibold cursor-pointer"
          >
            <IconPlus className="size-4" />
            Agregar primera regla
          </Button>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {politicas.map((p) => (
            <PoliticaCard
              key={p.id}
              p={p}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          ))}

          {/* Add card */}
          <button
            onClick={() => handleOpenDialog()}
            className={cn(
              "group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/30 min-h-[260px] cursor-pointer",
              "hover:border-foreground/20 hover:bg-muted/20 transition-[background-color,border-color] duration-300",
            )}
          >
            <div className="size-10 rounded-xl bg-muted/40 flex items-center justify-center border border-border/40 group-hover:bg-muted/80 group-hover:scale-110 transition-[background-color,transform]">
              <IconPlus className="size-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
              Nueva Regla
            </span>
          </button>
        </div>
      )}

      {/* Modal */}
      <PoliticaDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        formState={formState}
        dispatch={dispatch}
        niveles={niveles}
        isSaving={isSaving}
        onSave={handleSave}
      />

      <ConfirmDialog />
    </div>
  );
}