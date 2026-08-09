"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconId,
  IconSchool,
  IconCalendar,
  IconArrowRight,
  IconClipboardCheck,
  IconUserPlus,
  IconEdit,
  IconTrash,
  IconMenu2,
  IconChevronRight,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormModal } from "@/components/modals/form-modal";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProspectoForm } from "@/components/gestion/admisiones/management/prospecto-form";
import { AdmisionFlow } from "@/components/gestion/admisiones/management/admision-flow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  updateProspectoStatusAction,
  convertProspectoToAdmisionAction,
  updateAdmisionResultAction,
  convertProspectoToEstudianteAction,
} from "@/actions/admissions";

interface ProspectoKanbanProps {
  data: any[];
  grados: any[];
  instituciones: any[];
}

const COLUMNS = [
  { id: "INTERESADO", title: "Interesados", color: "border-blue-500/20 bg-blue-500/5 text-blue-500 dark:text-blue-400" },
  { id: "EVALUANDO", title: "En Evaluación", color: "border-amber-500/20 bg-amber-500/5 text-amber-500 dark:text-amber-400" },
  { id: "ADMITIDO", title: "Admitidos", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400" },
  { id: "RECHAZADO", title: "Rechazados", color: "border-rose-500/20 bg-rose-500/5 text-rose-500 dark:text-rose-400" },
  { id: "MATRICULADO", title: "Matriculados", color: "border-violet-500/20 bg-violet-500/5 text-violet-500 dark:text-violet-400" },
];

const EMPTY_DATA: any[] = [];
const EMPTY_GRADOS: any[] = [];
const EMPTY_INSTITUCIONES: any[] = [];

export function ProspectoKanban({
  data = EMPTY_DATA,
  grados = EMPTY_GRADOS,
  instituciones = EMPTY_INSTITUCIONES,
}: ProspectoKanbanProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showEditId, setShowEditId] = useState<string | null>(null);
  const [showFlowId, setShowFlowId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // Buscar prospecto activo para modales
  const activeEditProspecto = data.find((p) => p.id === showEditId);
  const activeFlowProspecto = data.find((p) => p.id === showFlowId);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    draggedIdRef.current = id;
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setHoveredCol(null);
  };

  const handleMove = async (id: string, newStatus: string) => {
    const prospecto = data.find((p) => p.id === id);
    if (!prospecto) return;

    const oldStatus = prospecto.estado;
    if (oldStatus === newStatus) return;

    setLoadingId(id);
    try {
      // Reglas de negocio avanzadas al mover columnas
      if (newStatus === "EVALUANDO") {
        // 1. Iniciar evaluación formal
        const res = await convertProspectoToAdmisionAction({ prospectoId: id });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      } else if ((newStatus === "ADMITIDO" || newStatus === "RECHAZADO") && oldStatus === "EVALUANDO") {
        // 2. Resolver proceso de admisión
        const admisionId = prospecto.admision?.id;
        if (admisionId) {
          const res = await updateAdmisionResultAction({
            admisionId,
            values: { resultadoExamen: "Actualizado vía CRM Kanban" },
            finalStatus: newStatus as any,
          });
          if (res.success) toast.success(res.success);
          else toast.error(res.error);
        } else {
          // Si no tiene expediente formal de admisión, forzar cambio de estado genérico
          const res = await updateProspectoStatusAction({ id, estado: newStatus });
          if (res.success) toast.success(res.success);
          else toast.error(res.error);
        }
      } else if (newStatus === "MATRICULADO" && oldStatus === "ADMITIDO") {
        // 3. Generar matriculado / estudiante formal
        const res = await convertProspectoToEstudianteAction({ prospectoId: id });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      } else {
        // 4. Actualización genérica de estado
        const res = await updateProspectoStatusAction({ id, estado: newStatus });
        if (res.success) toast.success(res.success);
        else toast.error(res.error);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al mover el prospecto");
    } finally {
      setLoadingId(null);
    }
  };

  const onStartEvaluation = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await convertProspectoToAdmisionAction({ prospectoId: id });
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } finally {
      setLoadingId(null);
    }
  };

  const onEnrollStudent = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await convertProspectoToEstudianteAction({ prospectoId: id });
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in animation-duration-">
      {/* Tablero Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start w-full overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map((col) => {
          const colProspectos = data.filter((p) => p.estado === col.id);
          const isHovered = hoveredCol === col.id;

          return (
            <div
              key={col.id}
              className={cn(
                "flex flex-col rounded-2xl p-4 gap-4 bg-muted/40 border border-border/50 transition-[background-color,border-color,box-shadow] duration-300 min-h-[500px] w-full",
                isHovered ? "border-primary/50 bg-muted/70 ring-2 ring-primary/20" : ""
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setHoveredCol(col.id);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setHoveredCol(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const idFromData = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text");
                const targetId = idFromData || draggedIdRef.current;
                if (targetId) {
                  handleMove(targetId, col.id);
                }
                setHoveredCol(null);
                draggedIdRef.current = null;
              }}
            >
              {/* Encabezado Columna */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <h3 className="font-extrabold text-xs tracking-wider text-foreground flex items-center gap-2 uppercase">
                  <span className={`size-2 rounded-full bg-linear-to-br ${col.id === "INTERESADO" ? "from-blue-500 to-indigo-600" : col.id === "EVALUANDO" ? "from-amber-500 to-orange-600" : col.id === "ADMITIDO" ? "from-emerald-500 to-teal-600" : col.id === "RECHAZADO" ? "from-rose-500 to-red-600" : "from-violet-500 to-purple-600"}`} />
                  {col.title}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-card text-foreground/80 text-xxs font-black border border-border/50 shadow-2xs">
                  {colProspectos.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="flex flex-col gap-3 h-full overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {colProspectos.map((p) => {
                    const gradeName = grados.find((g) => g.id === p.gradoInteresId)?.nombre || "Sin Asignar";
                    const isCardLoading = loadingId === p.id;

                    return (
                      <LazyMotion key={p.id} features={domAnimation}>
                        <m.div layout>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, p.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "group rounded-2xl p-4 border border-border/60 bg-card shadow-xs transition-[background-color,box-shadow,transform] duration-200 hover:bg-card hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing relative",
                            isCardLoading ? "opacity-50 pointer-events-none" : ""
                          )}
                        >
                        {/* Cabecera Tarjeta */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {p.nombre} {p.apellidoPaterno}
                            </h4>
                            <p className="text-xxs text-muted-foreground/80 font-bold flex items-center gap-1 mt-1">
                              <IconId className="size-3 text-primary shrink-0" />
                              DNI {p.dni || "S/D"}
                            </p>
                          </div>

                          {/* Menú de Acciones */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 rounded-full hover:bg-muted shrink-0">
                                <IconDotsVertical className="size-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-border/50 bg-popover shadow-md rounded-xl">
                              <DropdownMenuItem onClick={() => setShowEditId(p.id)} className="rounded-lg text-xs gap-2">
                                <IconEdit className="size-3.5 text-blue-500" />
                                Editar Datos
                              </DropdownMenuItem>
                              {p.admision && (
                                <DropdownMenuItem onClick={() => setShowFlowId(p.id)} className="rounded-lg text-xs gap-2">
                                  <IconClipboardCheck className="size-3.5 text-emerald-500" />
                                  Ver Expediente
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator className="bg-border/20" />
                              {COLUMNS.map((c) => (
                                <DropdownMenuItem
                                  key={c.id}
                                  onClick={() => handleMove(p.id, c.id)}
                                  className={`rounded-lg text-xxs font-black uppercase tracking-wider gap-2 ${
                                    p.estado === c.id ? "bg-muted text-foreground" : "text-muted-foreground"
                                  }`}
                                >
                                  <IconChevronRight className="size-3" />
                                  Mover a {c.title}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Detalles */}
                        <div className="mt-4 pt-3 border-t border-border/10 space-y-2">
                          <div className="flex items-center gap-1.5 text-xxs text-muted-foreground font-semibold">
                            <IconSchool className="size-3 text-primary shrink-0" />
                            {gradeName}
                          </div>
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-xxs text-muted-foreground font-semibold truncate">
                              <IconMail className="size-3 text-primary shrink-0" />
                              {p.email}
                            </div>
                          )}
                          {p.telefono && (
                            <div className="flex items-center gap-1.5 text-xxs text-muted-foreground font-semibold">
                              <IconPhone className="size-3 text-primary shrink-0" />
                              {p.telefono}
                            </div>
                          )}
                        </div>

                        {/* Botón de Acción Dinámica */}
                        <div className="mt-4">
                          {p.estado === "INTERESADO" && (
                            <Button
                              onClick={() => onStartEvaluation(p.id)}
                              className="w-full h-8 rounded-full text-xxs font-bold gap-1 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white transition-[color,background-color,transform] border border-blue-500/20 active:scale-95"
                              disabled={isCardLoading}
                            >
                              Iniciar Eval
                              <IconChevronRight className="size-3.5" />
                            </Button>
                          )}

                          {p.estado === "EVALUANDO" && (
                            <Button
                              onClick={() => setShowFlowId(p.id)}
                              className="w-full h-8 rounded-full text-xxs font-bold gap-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-[color,background-color,transform] border border-amber-500/20 active:scale-95"
                              disabled={isCardLoading}
                            >
                              Ver Expediente
                              <IconClipboardCheck className="size-3.5" />
                            </Button>
                          )}

                          {p.estado === "ADMITIDO" && (
                            <Button
                              onClick={() => onEnrollStudent(p.id)}
                              className="w-full h-8 rounded-full text-xxs font-black uppercase tracking-wider gap-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-[color,background-color,transform] border border-emerald-500/20 active:scale-95 shadow-md shadow-emerald-500/10"
                              disabled={isCardLoading}
                            >
                              Matricular
                              <IconUserPlus className="size-3.5" />
                            </Button>
                          )}

                          {p.estado === "MATRICULADO" && (
                            <div className="py-1 px-3 text-center rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-500/10 border border-violet-500/20 text-violet-500">
                              Matriculado
                            </div>
                          )}

                          {p.estado === "RECHAZADO" && (
                            <div className="py-1 px-3 text-center rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 text-rose-500">
                              Rechazado
                            </div>
                          )}
                        </div>
                      </div>
                      </m.div>
                    </LazyMotion>
                  );
                  })}
                </AnimatePresence>

                {colProspectos.length === 0 && (
                  <div className="h-28 border border-dashed border-border/40 bg-card/5 rounded-2xl flex items-center justify-center text-center p-4 opacity-50 select-none">
                    <p className="text-xxs text-muted-foreground font-semibold uppercase tracking-wide">Arrastra aquí</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edición */}
      <FormModal
        title="Editar Prospecto"
        description="Actualice la información del interesado."
        isOpen={!!showEditId}
        onOpenChange={(open) => !open && setShowEditId(null)}
        className="sm:max-w-lg"
      >
        {activeEditProspecto && (
          <ProspectoForm
            id={activeEditProspecto.id}
            initialData={activeEditProspecto}
            grados={grados}
            instituciones={instituciones}
            onSuccess={() => setShowEditId(null)}
          />
        )}
      </FormModal>

      {/* Sheet de Expediente / Evaluación */}
      <Sheet open={!!showFlowId} onOpenChange={(open) => !open && setShowFlowId(null)}>
        <SheetContent className="sm:max-w-lg bg-background/95 border-l border-border/40 px-4">
          {activeFlowProspecto && activeFlowProspecto.admision && (
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-bold uppercase tracking-tight text-foreground">
                  Expediente de Admisión
                </SheetTitle>
                <SheetDescription className="capitalize text-muted-foreground">
                  Seguimiento de evaluación para: {activeFlowProspecto.nombre} {activeFlowProspecto.apellidoPaterno}{" "}
                  {activeFlowProspecto.apellidoMaterno}
                </SheetDescription>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-150px)] pr-4 mt-4">
                <AdmisionFlow
                  admision={{ ...activeFlowProspecto.admision, prospecto: activeFlowProspecto }}
                  onSuccess={() => setShowFlowId(null)}
                />
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
