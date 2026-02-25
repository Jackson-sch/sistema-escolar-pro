"use client";

import { useState, useEffect } from "react";
import {
  IconPlus,
  IconTrash,
  IconClock,
  IconCheck,
  IconX,
  IconHourglass,
  IconLayersIntersect,
  IconAlertTriangle,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getPoliticasAsistenciaAction,
  savePoliticaAsistenciaAction,
  deletePoliticaAsistenciaAction,
} from "@/actions/attendance-policy";
import { getNivelesAction } from "@/actions/academic-structure";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormModal } from "@/components/modals/form-modal";
import { PoliticaFormFields } from "./politica-form-fields";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { TimeGauge } from "./time-gauge";
import HeaderStats from "./header-stats";
import EmptyCard from "./empty-card";
import { formatDate } from "@/lib/formats";

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
  const [editingPolitica, setEditingPolitica] = useState<any>(null);

  // Form states
  const [nombre, setNombre] = useState("");
  const [nivelId, setNivelId] = useState<string>("all");
  const [turno, setTurno] = useState<string>("all");
  const [horaEntrada, setHoraEntrada] = useState("08:00");
  const [horaSalida, setHoraSalida] = useState("13:00");
  const [tolerancia, setTolerancia] = useState(0);
  const [activo, setActivo] = useState(true);

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
    } catch (err) {
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenDialog = (politica?: any) => {
    if (politica) {
      setEditingPolitica(politica);
      setNombre(politica.nombre);
      setNivelId(politica.nivelId || "all");
      setTurno(politica.turno || "all");
      setHoraEntrada(politica.horaEntrada);
      setHoraSalida(politica.horaSalida);
      setTolerancia(politica.tolerancia);
      setActivo(politica.activo);
    } else {
      setEditingPolitica(null);
      setNombre("");
      setNivelId("all");
      setTurno("all");
      setHoraEntrada("08:00");
      setHoraSalida("13:00");
      setTolerancia(0);
      setActivo(true);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-sm">
            Reglas de Ingreso
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground/80">
            Gestione de forma modular los horarios de entrada y márgenes de
            tolerancia por nivel educativo para el ciclo lectivo {anioAcademico}
            .
          </p>
        </div>

        {/* Header Stats */}
        <div className="hidden md:flex flex-wrap gap-4">
          <HeaderStats politicas={politicas} />
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground animate-pulse">
            <IconClock className="size-16 mb-4 opacity-10 animate-spin-slow" />
            <p className="font-bold tracking-widest uppercase text-xs">
              Sincronizando Políticas...
            </p>
          </div>
        ) : politicas.length === 0 ? (
          <EmptyCard handleOpenDialog={handleOpenDialog} />
          
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {politicas.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "relative group flex flex-col overflow-hidden bg-card/50 transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)]",
                  !p.activo && "opacity-60 grayscale",
                )}
              >
                {/* Status Indicator */}
                <div className="absolute top-6 right-6 z-10">
                  {p.activo ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30">
                      <IconCheck className="size-3.5" />
                    </div>
                  ) : (
                    <div className="flex size-6 items-center justify-center rounded-full bg-muted/20 text-muted-foreground border border-muted/30">
                      <IconX className="size-3.5" />
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                      {p.nivel?.nombre.includes("Inicial") ? (
                        <span className="text-2xl">
                          <IconUser />
                        </span>
                      ) : p.nivel?.nombre.includes("Primaria") ? (
                        <span className="text-2xl">
                          <IconUser />
                        </span>
                      ) : (
                        <span className="text-2xl">
                          <IconUser />
                        </span>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black black:text-white decoration-blue-500/30">
                        {p.nombre}
                      </CardTitle>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        {p.nivel?.nombre || "Nivel General"}
                        {p.turno && ` • ${p.turno}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 px-8 pb-4">
                  <div className="flex flex-col items-center">
                    {/* Time Gauge */}
                    <div>
                      <TimeGauge
                        time={p.horaEntrada}
                        label="INGRESO"
                        percentage={85} // Stylized
                      />
                    </div>

                    {/* Tolerance Alert Box */}
                    <div className="w-full rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 flex items-center gap-4 group/box transition-colors hover:bg-blue-500/10">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <IconAlertTriangle className="size-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-muted-foreground tracking-widest uppercase">
                          Tolerancia Máx.
                        </p>
                        <p className="text-lg font-black black:text-white">
                          <span className="text-blue-500">{p.tolerancia}</span>{" "}
                          min
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Footer Actions */}
                <div className="mt-2 border-t border-muted px-8 pt-4 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    ACT.{" "}
                    {formatDate(p.updatedAt || p.createdAt, "dd MMM")}
                  </p>

                  <div className="flex items-center gap-2">
                    {/* Delete hidden by default, visible on hover */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      className="size-9 rounded-full text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                    >
                      <IconTrash className="size-4" />
                    </Button>

                    <Button
                      onClick={() => handleOpenDialog(p)}
                      variant="secondary"
                      className="h-9 px-4 rounded-xl font-bold text-xs gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.4)] hover:-translate-y-0.5"
                    >
                      <IconSettings className="size-3.5" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* New Rule Placeholder Card */}
            <button
              onClick={() => handleOpenDialog()}
              className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2a262433] h-full min-h-[400px] hover:border-blue-500/50 hover:bg-blue-500/2 transition-all duration-500"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-muted/10 text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all duration-500 shadow-inner">
                <IconPlus className="size-8 group-hover:scale-110 transition-transform" />
              </div>
              <p className="mt-4 font-black text-sm uppercase tracking-widest text-muted-foreground transition-colors">
                Nueva Regla
              </p>
            </button>
          </div>
        )}
      </div>

      <FormModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingPolitica ? "Editar Política" : "Nueva Política"}
        description="Defina las reglas de horario para este grupo."
        className="sm:w-md"
      >
        <PoliticaFormFields
          nombre={nombre}
          setNombre={setNombre}
          nivelId={nivelId}
          setNivelId={setNivelId}
          niveles={niveles}
          turno={turno}
          setTurno={setTurno}
          horaEntrada={horaEntrada}
          setHoraEntrada={setHoraEntrada}
          horaSalida={horaSalida}
          setHoraSalida={setHoraSalida}
          tolerancia={tolerancia}
          setTolerancia={setTolerancia}
          activo={activo}
          setActivo={setActivo}
        />

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSaving}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full"
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </FormModal>

      <ConfirmDialog />
    </div>
  );
}
