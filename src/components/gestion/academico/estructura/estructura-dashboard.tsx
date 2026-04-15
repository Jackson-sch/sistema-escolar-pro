"use client";

import { useState, useMemo } from "react";
import {
  IconPlus,
  IconSearch,
  IconSchool,
  IconFilter,
  IconCopy,
  IconCalendarEvent,
  IconChevronRight,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormModal } from "@/components/modals/form-modal";

import { NivelList } from "./components/nivel-list";
import { GradeTimelineItem } from "./components/grade-timeline-item";
import { AssignTutorDialog } from "./components/assign-tutor-dialog";
import { NivelForm } from "./niveles/add-nivel-button";
import { GradoForm } from "./grados/add-grado-button";
import { SeccionForm } from "./secciones/seccion-form";
import {
  deleteNivelAction,
  deleteGradoAction,
  deleteSeccionAction,
  cloneAcademicStructureAction,
} from "@/actions/academic-structure";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";
import { ANIO_LECTIVO_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EstructuraDashboardProps {
  initialNiveles: any[];
  initialGrados: any[];
  initialSecciones: any[];
  tutores: any[];
  sedes: any[];
  selectedYear: number;
  institucionId: string;
}

export function EstructuraDashboard({
  initialNiveles,
  initialGrados,
  initialSecciones,
  tutores,
  sedes,
  selectedYear,
  institucionId,
}: EstructuraDashboardProps) {
  const router = useRouter();
  const [selectedNivelId, setSelectedNivelId] = useState<string>(
    initialNiveles[0]?.id || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"niveles" | "grados">("niveles");

  const [nivelModal, setNivelModal] = useState<{ open: boolean; data?: any }>({
    open: false,
  });
  const [gradoModal, setGradoModal] = useState<{ open: boolean; data?: any }>({
    open: false,
  });
  const [seccionModal, setSeccionModal] = useState<{
    open: boolean;
    data?: any;
    gradeId?: string;
  }>({ open: false });
  const [tutorModal, setTutorModal] = useState<{
    open: boolean;
    seccion?: any;
  }>({ open: false });
  const [clonando, setClonando] = useState(false);

  const [ConfirmDialog, confirm] = useConfirm(
    "¿Estás seguro?",
    "Esta acción no se puede deshacer y eliminará todos los datos relacionados.",
  );
  const [CloneConfirmDialog, confirmClone] = useConfirm(
    "Clonar Estructura Académica",
    `¿Deseas copiar la estructura de ${selectedYear} al año ${selectedYear + 1}? Se copiarán niveles, grados y secciones (sin tutores).`,
  );

  const selectedNivel = initialNiveles.find((n) => n.id === selectedNivelId);

  const filteredGrados = useMemo(() => {
    let result = initialGrados.filter((g) => g.nivelId === selectedNivelId);
    if (searchQuery) {
      result = result.filter(
        (g) =>
          g.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return result.sort((a, b) => a.orden - b.orden);
  }, [initialGrados, selectedNivelId, searchQuery]);

  const getSectionsForGrade = (gradeId: string) =>
    initialSecciones.filter((s) => s.gradoId === gradeId);

  const handleEditNivel = (e: React.MouseEvent, nivel: any) => {
    e.stopPropagation();
    setNivelModal({ open: true, data: nivel });
  };

  const handleDeleteNivel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteNivelAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDeleteGrade = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteGradoAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleDeleteSection = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    const res = await deleteSeccionAction(id);
    if (res.success) {
      toast.success(res.success);
      router.refresh();
    } else toast.error(res.error);
  };

  const handleClone = async () => {
    const ok = await confirmClone();
    if (!ok) return;
    setClonando(true);
    try {
      const res = await cloneAcademicStructureAction(
        selectedYear,
        selectedYear + 1,
        institucionId,
      );
      if (res.success) {
        toast.success(res.success);
        router.push(`/gestion/academico/estructura?anio=${selectedYear + 1}`);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al clonar la estructura");
    } finally {
      setClonando(false);
    }
  };

  const handleYearChange = (year: string) =>
    router.push(`/gestion/academico/estructura?anio=${year}`);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConfirmDialog />
      <CloneConfirmDialog />

      {/* ── Sidebar: Niveles ── */}
      <div
        className={cn(
          "w-full lg:w-72 flex flex-col gap-3 overflow-hidden h-full",
          mobileView === "niveles" ? "flex" : "hidden lg:flex",
        )}
      >
        <NivelList
          niveles={initialNiveles}
          grados={initialGrados}
          secciones={initialSecciones}
          selectedNivelId={selectedNivelId}
          onSelectNivel={(id) => {
            setSelectedNivelId(id);
            setMobileView("grados");
          }}
          onAddNivel={() => setNivelModal({ open: true })}
          onEditNivel={handleEditNivel}
          onDeleteNivel={handleDeleteNivel}
        />
      </div>

      {/* ── Main panel: Grados & Secciones ── */}
      <Card
        className={cn(
          "flex-1 flex flex-col overflow-hidden h-full min-h-0 border-border/50",
          mobileView === "grados" ? "flex" : "hidden lg:flex",
        )}
      >
        {/* Panel header */}
        <div className="px-4 sm:px-6 py-4 border-b border-border/50 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile back button */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg lg:hidden shrink-0 -ml-1"
                onClick={() => setMobileView("niveles")}
              >
                <IconChevronRight size={16} className="rotate-180" />
              </Button>

              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <IconSchool
                  size={20}
                  className="text-primary"
                  strokeWidth={1.75}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base font-bold tracking-tight text-foreground truncate">
                    {selectedNivel?.nombre || "Selecciona un nivel"}
                  </h1>
                  <Badge
                    variant="outline"
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md border-primary/25 text-primary bg-primary/5 shrink-0"
                  >
                    {selectedYear}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Grados y distribución de secciones
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year selector */}
              <Select
                key={selectedYear}
                onValueChange={handleYearChange}
                defaultValue={String(selectedYear)}
              >
                <SelectTrigger className="h-9 w-auto gap-2 rounded-lg border-border/60 bg-muted/30 px-3 text-sm font-semibold focus:ring-1 focus:ring-primary/40">
                  <IconCalendarEvent
                    size={14}
                    className="text-muted-foreground shrink-0"
                  />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {ANIO_LECTIVO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="rounded-lg text-sm"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Buscar grado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 w-full sm:w-40 text-sm bg-muted/30 border-border/60 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/40"
                />
              </div>

              {/* Clone */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClone}
                disabled={clonando}
                className="h-9 rounded-lg px-3 gap-1.5 text-xs font-semibold border-border/60 text-muted-foreground hover:text-foreground"
              >
                <IconCopy size={14} />
                <span className="hidden xl:inline">Clonar</span>
              </Button>

              {/* New grade */}
              <Button
                size="sm"
                onClick={() => setGradoModal({ open: true })}
                className="h-9 rounded-lg px-3 gap-1.5 text-xs font-bold"
              >
                <IconPlus size={14} strokeWidth={3} />
                <span className="hidden sm:inline">Nuevo Grado</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Grades list */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea className="h-full w-full" type="always">
            <div className="p-3 max-w-4xl mx-auto space-y-3">
              {filteredGrados.length > 0 ? (
                filteredGrados.map((grado, idx) => (
                  <GradeTimelineItem
                    key={grado.id}
                    grado={grado}
                    secciones={getSectionsForGrade(grado.id)}
                    onAddSection={() =>
                      setSeccionModal({ open: true, gradeId: grado.id })
                    }
                    onEditSection={(seccion) =>
                      setSeccionModal({ open: true, data: seccion })
                    }
                    onDeleteSection={handleDeleteSection}
                    onAssignTutor={(seccion) =>
                      setTutorModal({ open: true, seccion })
                    }
                    onEditGrade={() =>
                      setGradoModal({ open: true, data: grado })
                    }
                    onDeleteGrade={() => handleDeleteGrade(grado.id)}
                    isLast={idx === filteredGrados.length - 1}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <div className="size-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center">
                    <IconFilter
                      size={28}
                      className="text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-muted-foreground">
                      No se encontraron grados
                    </h3>
                    <p className="text-xs text-muted-foreground/60 max-w-xs leading-relaxed">
                      Cambia el año lectivo o añade un nuevo grado a este nivel.
                    </p>
                  </div>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="rounded-lg text-xs h-8 px-4"
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* ── Modals ── */}
      <FormModal
        title={nivelModal.data ? "Editar Nivel" : "Nuevo Nivel"}
        description={
          nivelModal.data
            ? "Actualiza el nombre del nivel educativo."
            : "Crea un nuevo nivel para la institución."
        }
        isOpen={nivelModal.open}
        onOpenChange={(open) => setNivelModal({ open })}
        className="sm:max-w-xs"
      >
        <NivelForm
          institucionId={institucionId}
          initialData={nivelModal.data}
          onSuccess={() => {
            setNivelModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      <FormModal
        title={gradoModal.data ? "Editar Grado" : "Nuevo Grado"}
        description={
          gradoModal.data
            ? "Cambia los detalles del grado académico."
            : "Añade un año escolar al nivel seleccionado."
        }
        isOpen={gradoModal.open}
        onOpenChange={(open) => setGradoModal({ open })}
        className="sm:max-w-sm"
      >
        <GradoForm
          niveles={initialNiveles}
          initialData={gradoModal.data ?? { nivelId: selectedNivelId }}
          onSuccess={() => {
            setGradoModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      <FormModal
        title={seccionModal.data ? "Editar Sección" : "Nueva Sección"}
        description={
          seccionModal.data
            ? "Modifica los datos de la sección."
            : "Registra un aula y tutor para el grado seleccionado."
        }
        isOpen={seccionModal.open}
        onOpenChange={(open) => setSeccionModal({ open })}
        className="sm:max-w-xl"
      >
        <SeccionForm
          grados={initialGrados.map((g) => ({
            ...g,
            nivel: initialNiveles.find((n) => n.id === g.nivelId),
          }))}
          tutores={tutores}
          sedes={sedes}
          institucionId={institucionId}
          currentAnio={selectedYear}
          initialData={
            seccionModal.data ?? {
              gradoId: seccionModal.gradeId,
              anioAcademico: selectedYear,
              institucionId,
            }
          }
          onSuccess={() => {
            setSeccionModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      {/* ── Quick Tutor Assignment Dialog ── */}
      <AssignTutorDialog
        open={tutorModal.open}
        onOpenChange={(open) => setTutorModal({ open })}
        seccion={tutorModal.seccion}
        tutores={tutores}
      />
    </div>
  );
}
