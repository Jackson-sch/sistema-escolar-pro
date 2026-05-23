"use client";

import {
  IconUsers,
  IconArrowRight,
  IconSchool,
  IconCheck,
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconChartBar,
  IconRocket,
  IconArrowLeft,
  IconLayoutGrid,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { cn } from "@/lib/utils";

interface PromocionesMapeoProps {
  anioOrigen: number;
  anioDestino: number;
  niveles: any[];
  selectedLevelId: string;
  onLevelChange: (value: string) => void;
  seccionesDestino: any[];
  filteredSourceSecciones: any[];
  filteredTargetSecciones: any[];
  sourceSeccionId: string;
  onSourceChange: (value: string) => void;
  targetSeccionId: string;
  onTargetChange: (value: string) => void;
  students: any[];
  filteredStudents: any[];
  selectedIds: string[];
  onToggleStudent: (id: string) => void;
  onToggleAll: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loadingStudents: boolean;
  isPending: boolean;
  onBack: () => void;
  onPromote: () => void;
}

export function PromocionesMapeo({
  anioOrigen,
  anioDestino,
  niveles,
  selectedLevelId,
  onLevelChange,
  seccionesDestino,
  filteredSourceSecciones,
  filteredTargetSecciones,
  sourceSeccionId,
  onSourceChange,
  targetSeccionId,
  onTargetChange,
  students,
  filteredStudents,
  selectedIds,
  onToggleStudent,
  onToggleAll,
  searchQuery,
  onSearchChange,
  loadingStudents,
  isPending,
  onBack,
  onPromote,
}: PromocionesMapeoProps) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 rounded-2xl group"
        >
          <IconArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Volver a Auditoría
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-semibold italic tracking-tighter uppercase">
            Configuración de Mapeo
          </h2>
          <p className="text-xs text-muted-foreground">
            Ciclo {anioOrigen} → {anioDestino}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Columna Izquierda: Configuración Masiva ── */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="liquid-glass p-6 rounded-[2.5rem] border-border/50 bg-card/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <IconFilter className="text-primary size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Filtros Inteligentes</h3>
                <p className="text-xxs text-muted-foreground uppercase tracking-widest font-medium">
                  Optimización de carga
                </p>
              </div>
            </div>

            <LevelSegmentedControl
              levels={[
                { id: "all", label: "Todas" },
                ...niveles.map((n: any) => ({ id: n.id, label: n.nombre })),
              ]}
              value={selectedLevelId}
              onChange={onLevelChange}
              label="Nivel Educativo"
            />

            <div className="p-4 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className="text-xxs font-medium uppercase tracking-[0.2em] text-primary/60 ml-1 block mb-2">
                    Origen {anioOrigen}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredSourceSecciones.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSourceChange(s.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-center",
                          sourceSeccionId === s.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-background/50 border-border/40 hover:border-primary/30 hover:bg-primary/5",
                        )}
                      >
                        <span className="text-lg font-bold leading-none">
                          {s.seccion}
                        </span>
                        <span className="text-xxs font-medium opacity-70">
                          {s.grado.nombre}
                        </span>
                      </button>
                    ))}
                    {filteredSourceSecciones.length === 0 && (
                      <p className="col-span-2 text-xxs text-muted-foreground/60 text-center py-4">
                        Sin secciones disponibles
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <div className="p-2 rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <IconArrowRight className="size-4" strokeWidth={3} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="text-xxs font-medium uppercase tracking-[0.2em] text-primary/60 ml-1 block mb-2">
                    Destino {anioDestino}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                    {filteredTargetSecciones.map((s: any) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onTargetChange(s.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-center",
                          targetSeccionId === s.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-background/50 border-border/40 hover:border-primary/30 hover:bg-primary/5",
                        )}
                      >
                        <span className="text-lg font-bold leading-none">
                          {s.seccion}
                        </span>
                        <span className="text-xxs font-medium opacity-70">
                          {s.grado.nombre}
                        </span>
                      </button>
                    ))}
                    {filteredTargetSecciones.length === 0 && (
                      <p className="col-span-2 text-xxs text-muted-foreground/60 text-center py-4">
                        Sin secciones disponibles
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {seccionesDestino.length === 0 && (
              <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20 flex gap-3">
                <IconAlertCircle className="size-5 text-warning shrink-0" />
                <p className="text-micro text-warning/80 leading-relaxed font-normal">
                  No hay secciones para el ciclo destino. Sincroniza la
                  estructura en el panel de configuración.
                </p>
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-[2.5rem] border-border/40 bg-blue-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <IconChartBar size={18} />
                <span className="text-xxs font-medium uppercase tracking-widest">
                  Estado del Nivel
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xxs font-medium mb-1">
                  <span className="text-muted-foreground">PROGRESADO</span>
                  <span>{niveles.length > 0 ? "12%" : "0%"}</span>
                </div>
                <div className="h-1.5 w-full bg-border/40 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[12%] shadow-sm shadow-blue-500/40"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Columna Derecha: Selección de Estudiantes GIGANTE ── */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[650px]">
          <Card className="flex-1 liquid-glass rounded-[3rem] border-border/40 flex flex-col overflow-hidden bg-card/30">
            <div className="px-8 py-6 border-b border-border/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/20 dark:bg-black/20">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold italic tracking-tighter uppercase">
                    Listado de Promoción
                  </h3>
                  <Badge
                    variant="secondary"
                    className="rounded-lg px-2 text-xxs font-medium"
                  >
                    {selectedIds.length} / {students.length}
                  </Badge>
                </div>
                <p className="text-xxs text-muted-foreground uppercase tracking-[0.2em] font-normal">
                  Panel de selección masiva
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group flex-1 lg:flex-none">
                  <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Buscar alumno..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-11 h-12 w-full lg:w-72 bg-white/40 dark:bg-black/40 border-border/40 rounded-2xl text-sm shadow-inner transition-all focus:ring-primary/20"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={onToggleAll}
                  className="rounded-2xl h-12 px-6 text-xs font-medium uppercase tracking-widest border-border/50 hover:bg-white/50"
                >
                  {selectedIds.length === filteredStudents.length
                    ? "Ninguno"
                    : "Todos"}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-8">
              {!sourceSeccionId ? (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                  <div className="size-24 rounded-[2.5rem] bg-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <IconSchool className="size-12 text-primary/20 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold italic tracking-tighter uppercase text-muted-foreground/60">
                      Carga de Datos Pendiente
                    </h3>
                    <p className="text-xs text-muted-foreground/40 max-w-sm mx-auto font-normal">
                      Define primero la sección de origen para instanciar el
                      proceso de transferencia al ciclo {anioDestino}.
                    </p>
                  </div>
                </div>
              ) : loadingStudents ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-20 w-full bg-primary/5 animate-pulse rounded-[2rem] border border-primary/10"
                    />
                  ))}
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedIds.includes(student.id);
                    return (
                      <div
                        key={student.id}
                        onClick={() => onToggleStudent(student.id)}
                        className={cn(
                          "group p-5 rounded-[2.2rem] border-2 transition-all cursor-pointer flex items-center gap-5 relative overflow-hidden",
                          isSelected
                            ? "bg-primary/10 border-primary/30 shadow-lg shadow-primary/5"
                            : "bg-white/40 dark:bg-black/40 border-transparent hover:border-border/60 hover:bg-white/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center size-8 rounded-[0.9rem] border-2 transition-all",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground rotate-0"
                              : "bg-white dark:bg-black border-border/60 rotate-45"
                          )}
                        >
                          <IconCheck
                            size={16}
                            className={cn(
                              "transition-all",
                              isSelected
                                ? "scale-100 opacity-100"
                                : "scale-0 opacity-0"
                            )}
                            strokeWidth={4}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold tracking-tight truncate uppercase italic">
                            {student.apellidoPaterno}{" "}
                            {student.apellidoMaterno}, {student.name}
                          </h4>
                          <p className="text-[9px] font-medium text-muted-foreground/60 mt-0.5 tracking-wider">
                            CÓDIGO:{" "}
                            {student.id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "size-2 rounded-full",
                            isSelected
                              ? "bg-primary animate-pulse"
                              : "bg-muted-foreground/20"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-primary/5 rounded-[3rem] border-2 border-dashed border-primary/10">
                  <p className="text-sm font-medium italic uppercase text-primary/40 tracking-widest">
                    Sin alumnos registrados
                  </p>
                </div>
              )}
            </ScrollArea>

            <div className="px-8 py-6 bg-primary/5 border-t border-primary/10 flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex -space-x-3">
                  {students.slice(0, 4).map((s: any, i: number) => (
                    <div
                      key={i}
                      className="size-10 rounded-2xl bg-white dark:bg-black border-2 border-primary/20 shadow-xl overflow-hidden flex items-center justify-center"
                    >
                      <span className="text-xxs font-medium text-primary uppercase">
                        {s.name[0]}
                        {s.apellidoPaterno[0]}
                      </span>
                    </div>
                  ))}
                  {students.length > 4 && (
                    <div className="size-10 rounded-2xl bg-primary text-primary-foreground border-2 border-primary border-white flex items-center justify-center text-xxs font-medium shadow-xl">
                      +{students.length - 4}
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xxs font-medium uppercase tracking-widest text-primary italic">
                    Transferencia Lista
                  </p>
                  <p className="text-[9px] text-muted-foreground font-medium">
                    Se generarán registros para el ciclo {anioDestino}
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={onPromote}
                disabled={
                  isPending ||
                  !sourceSeccionId ||
                  !targetSeccionId ||
                  selectedIds.length === 0
                }
                className="rounded-[2rem] h-16 px-10 font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.1em] gap-3"
              >
                {isPending ? (
                  <>OPTIMIZANDO...</>
                ) : (
                  <>
                    EJECUTAR PROMOCIÓN
                    <IconRocket size={20} className="animate-bounce" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
