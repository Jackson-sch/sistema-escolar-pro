"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import {
  IconArrowRight,
  IconSchool,
  IconCheck,
  IconAlertCircle,
  IconSearch,
  IconFilter,
  IconRocket,
  IconCircleCheckFilled,
  IconArrowLeft,
  IconShieldCheck,
  IconUserCheck,
  IconTrendingUp,
  IconRefresh,
  IconInfoCircle,
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
  IconBook,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getStudentsInSeccionAction } from "@/actions/academic-structure";
import { promoteStudentsAction } from "@/actions/enrollments";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { StepperItem } from "./stepper-item";
import { cn } from "@/lib/utils";

interface SeccionPromocion {
  id: string;
  seccion?: string;
  nivel?: { id: string; nombre: string } | null;
  grado?: { nombre: string } | null;
}

interface EstudiantePromocion {
  id: string;
  name?: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  dni?: string | null;
  documentoIdentidad?: string | null;
}

interface PromocionesViewProps {
  aniosDisponibles: number[];
  seccionesOrigen: SeccionPromocion[];
  seccionesDestino: SeccionPromocion[];
  grados: unknown[];
  anioOrigen: number;
  anioDestino: number;
  institucionId: string;
}

type ActiveTab = "auditoria" | "mapeo" | "ejecucion";

const VALIDATION_ITEMS = [
  {
    id: "grades",
    label: "Cierre de Calificaciones",
    description: "Promedios anuales y actas finales de notas registradas.",
    status: "complete",
    detail: "100% registros completados",
  },
  {
    id: "attendance",
    label: "Control de Asistencia",
    description: "Cierre de partes diarios y justificaciones procesadas.",
    status: "complete",
    detail: "Cierre de año validado",
  },
  {
    id: "finance",
    label: "Solvencia Estudiantil",
    description: "Sincronización de morosidad y estados de pensión.",
    status: "warning",
    detail: "3 pensiones en revisión",
  },
];

import { useQueryState, parseAsString } from "nuqs";

export function PromocionesView({
  seccionesOrigen,
  seccionesDestino,
  anioOrigen,
  anioDestino,
}: PromocionesViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Stepper State
  const [activeTab, setActiveTab] = useQueryState(
    "step",
    parseAsString.withDefault("auditoria")
  ) as [ActiveTab, (v: ActiveTab | null) => void];

  // States
  const [selectedLevelId, setSelectedLevelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault("")
  );
  const [sourceSeccionId, setSourceSeccionId] = useQueryState(
    "sourceId",
    parseAsString.withDefault("")
  );
  const [targetSeccionId, setTargetSeccionId] = useQueryState(
    "targetId",
    parseAsString.withDefault("")
  );
  const [isAutoSelectedTarget, setIsAutoSelectedTarget] =
    useState<boolean>(false);
  const [students, setStudents] = useState<EstudiantePromocion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("")
  );

  const niveles = useMemo<Array<{ id: string; nombre: string }>>(() => {
    const map = new Map<string, { id: string; nombre: string }>();
    seccionesOrigen.forEach((s) => {
      if (s.nivel && !map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [seccionesOrigen]);

  // Auto-selección inicial del primer nivel activo
  useEffect(() => {
    if (niveles.length > 0 && !selectedLevelId) {
      setSelectedLevelId(niveles[0].id);
    }
  }, [niveles, selectedLevelId]);

  const activeLevelId = selectedLevelId || (niveles[0]?.id ?? "");

  const filteredSourceSecciones = useMemo(() => {
    if (!activeLevelId) return seccionesOrigen;
    return seccionesOrigen.filter((s) => s.nivel?.id === activeLevelId);
  }, [seccionesOrigen, activeLevelId]);

  const filteredTargetSecciones = useMemo(() => {
    if (!activeLevelId) return seccionesDestino;
    return seccionesDestino.filter((s) => s.nivel?.id === activeLevelId);
  }, [seccionesDestino, activeLevelId]);

  // Detección e inferencia automática de la sección destino (ej. 2° A -> 3° A)
  const autoDetectTargetSeccion = (sourceId: string) => {
    const sourceObj = seccionesOrigen.find((s) => s.id === sourceId);
    if (!sourceObj) return;

    const sourceNivelId = sourceObj.nivel?.id;
    const sourceLetter = sourceObj.seccion?.trim().toUpperCase();
    const gradeName = sourceObj.grado?.nombre || "";

    const match = gradeName.match(/\d+/);
    const currentGradeNum = match ? parseInt(match[0], 10) : null;

    if (currentGradeNum !== null) {
      const nextGradeNum = currentGradeNum + 1;

      const matchTarget = seccionesDestino.find((t) => {
        const sameNivel =
          t.nivel?.id === sourceNivelId ||
          t.nivel?.nombre === sourceObj.nivel?.nombre;
        const sameLetter = t.seccion?.trim().toUpperCase() === sourceLetter;
        const tMatch = t.grado?.nombre?.match(/\d+/);
        const tGradeNum = tMatch ? parseInt(tMatch[0], 10) : null;
        return sameNivel && sameLetter && tGradeNum === nextGradeNum;
      });

      if (matchTarget) {
        setTargetSeccionId(matchTarget.id);
        setIsAutoSelectedTarget(true);
        toast.info(
          `Sugerencia automática: ${matchTarget.nivel?.nombre || ""} ${matchTarget.grado?.nombre || ""} "${matchTarget.seccion}" (${anioDestino}).`,
          { id: "auto-target-toast" },
        );
        return;
      }
    }

    const fallbackTarget = seccionesDestino.find((t) => {
      const sameNivel = t.nivel?.id === sourceNivelId;
      const sameLetter = t.seccion?.trim().toUpperCase() === sourceLetter;
      return sameNivel && sameLetter;
    });

    if (fallbackTarget) {
      setTargetSeccionId(fallbackTarget.id);
      setIsAutoSelectedTarget(true);
    } else {
      setIsAutoSelectedTarget(false);
    }
  };

  const handleSourceSeccionChange = (val: string) => {
    setSourceSeccionId(val);
    if (val) {
      autoDetectTargetSeccion(val);
    } else {
      setTargetSeccionId("");
      setIsAutoSelectedTarget(false);
    }
  };

  // Carga de estudiantes al cambiar sección origen
  useEffect(() => {
    let ignore = false;
    if (sourceSeccionId) {
      const timer = setTimeout(() => setLoadingStudents(true), 0);
      getStudentsInSeccionAction(sourceSeccionId)
        .then((res) => {
          if (ignore) return;
          if (res.data) {
            setStudents(res.data);
            setSelectedIds(res.data.map((s) => s.id));
          } else {
            toast.error(res.error || "No se pudieron cargar los estudiantes");
          }
        })
        .catch(() => {
          if (!ignore) toast.error("Error al conectar con el servidor");
        })
        .finally(() => {
          if (!ignore) setLoadingStudents(false);
        });
      return () => {
        ignore = true;
        clearTimeout(timer);
      };
    }
    const timer = setTimeout(() => {
      setStudents([]);
      setSelectedIds([]);
    }, 0);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [sourceSeccionId]);

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.apellidoPaterno} ${s.apellidoMaterno}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const toggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handlePromote = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un estudiante para promover.");
      return;
    }
    if (!targetSeccionId) {
      toast.error("Selecciona la sección de destino para la promoción.");
      return;
    }

    setActiveTab("ejecucion");

    startTransition(async () => {
      const res = await promoteStudentsAction(
        selectedIds,
        targetSeccionId,
        anioDestino,
      );

      if (res.success) {
        toast.success(res.success);
        router.refresh();
      } else {
        toast.error(res.error || "Ocurrió un error en el proceso");
        setActiveTab("mapeo");
      }
    });
  };

  const sourceSeccionObj = seccionesOrigen.find(
    (s) => s.id === sourceSeccionId,
  );
  const targetSeccionObj = seccionesDestino.find(
    (s) => s.id === targetSeccionId,
  );

  const resetMapping = () => {
    setActiveTab("mapeo");
    setSourceSeccionId("");
    setTargetSeccionId("");
    setIsAutoSelectedTarget(false);
  };

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <PromotionGuideCard anioOrigen={anioOrigen} anioDestino={anioDestino} />

      <PromotionStepper activeTab={activeTab} onTabChange={setActiveTab} />

      <Separator className="bg-border/30" />

      {/* ── PASO 1: AUDITORÍA ACADÉMICA ── */}
      {activeTab === "auditoria" && (
        <AuditoriaTab
          anioOrigen={anioOrigen}
          anioDestino={anioDestino}
          onContinue={() => setActiveTab("mapeo")}
        />
      )}

      {/* ── PASO 2: MAPEO Y NÓMINA DE PROMOCIÓN ── */}
      {activeTab === "mapeo" && (
        <MappingStep
          anioOrigen={anioOrigen}
          anioDestino={anioDestino}
          onBack={() => setActiveTab("auditoria")}
          niveles={niveles}
          selectedLevelId={selectedLevelId}
          onLevelChange={(val) => {
            setSelectedLevelId(val);
            setSourceSeccionId("");
            setTargetSeccionId("");
            setIsAutoSelectedTarget(false);
          }}
          sourceSeccionId={sourceSeccionId}
          onSourceChange={handleSourceSeccionChange}
          filteredSourceSecciones={filteredSourceSecciones}
          targetSeccionId={targetSeccionId}
          onTargetChange={(val) => {
            setTargetSeccionId(val);
            setIsAutoSelectedTarget(false);
          }}
          filteredTargetSecciones={filteredTargetSecciones}
          isAutoSelectedTarget={isAutoSelectedTarget}
          sourceSeccionObj={sourceSeccionObj}
          targetSeccionObj={targetSeccionObj}
          loadingStudents={loadingStudents}
          filteredStudents={filteredStudents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIds={selectedIds}
          onToggleStudent={toggleStudent}
          onToggleAll={toggleAll}
          isPending={isPending}
          onPromote={handlePromote}
        />
      )}

      {/* ── PASO 3: CENTRO DE CONTROL Y RESULTADOS DE PROMOCIÓN ── */}
      {activeTab === "ejecucion" && (
        <PromotionResultCard
          isPending={isPending}
          selectedCount={selectedIds.length}
          sourceSeccionObj={sourceSeccionObj}
          targetSeccionObj={targetSeccionObj}
          anioOrigen={anioOrigen}
          anioDestino={anioDestino}
          onContinue={resetMapping}
          onGoToEnrollments={() => router.push("/gestion/matriculas")}
        />
      )}
    </div>
  );
}

/* ── Subcomponentes ── */

function PromotionGuideCard({
  anioOrigen,
  anioDestino,
}: {
  anioOrigen: number;
  anioDestino: number;
}) {
  const [showGuide, setShowGuide] = useState<boolean>(false);

  return (
    <Card className="p-4 sm:p-5 rounded-2xl border-indigo-500/30 bg-indigo-950/20 space-y-3 relative overflow-hidden shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <IconInfoCircle className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                Guía Operativa: Cierre Escolar y Promoción Masiva
              </h3>
              <Badge className="bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                SISTEMA ESCOLAR PRO
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Transición institucional de matrículas y asignación de aulas entre el ciclo{" "}
              <span className="font-bold text-indigo-400">{anioOrigen}</span> y{" "}
              <span className="font-bold text-emerald-400">{anioDestino}</span>.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="h-8 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1.5 cursor-pointer"
        >
          <span>{showGuide ? "Ocultar guía" : "Ver indicaciones"}</span>
          {showGuide ? (
            <IconChevronUp className="size-3.5" />
          ) : (
            <IconChevronDown className="size-3.5" />
          )}
        </Button>
      </div>

      {showGuide && (
        <div className="pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in animation-duration-">
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconShieldCheck className="size-4 shrink-0" />
              <span>1. Auditoría Inicial</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Verifica el cierre de calificaciones y solvencia para certificar que el ciclo escolar está apto para promoción.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconTrendingUp className="size-4 shrink-0" />
              <span>2. Mapeo Automático</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Al elegir la sección origen (ej. 2° A {anioOrigen}), el sistema <strong className="text-foreground font-semibold">detecta y sugiere</strong> la sección correlativa (3° A {anioDestino}).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <IconRocket className="size-4 shrink-0" />
              <span>3. Generación de Matrículas</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Confirma los alumnos promovibles. Al procesar, se formalizan automáticamente sus matrículas para el periodo {anioDestino}.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

function PromotionStepper({
  activeTab,
  onTabChange,
}: {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-3 py-1">
      <StepperItem
        active={activeTab === "auditoria"}
        completed={activeTab !== "auditoria"}
        icon={<IconShieldCheck className="size-4" />}
        label="Paso 1"
        title="Auditoría de Cierre"
        onClick={() => onTabChange("auditoria")}
      />
      <div className="hidden md:block w-8 h-0.5 bg-border/40" />
      <StepperItem
        active={activeTab === "mapeo"}
        completed={activeTab === "ejecucion"}
        icon={<IconTrendingUp className="size-4" />}
        label="Paso 2"
        title="Mapeo & Nómina"
        onClick={() =>
          activeTab !== "auditoria" ? onTabChange("mapeo") : null
        }
        disabled={activeTab === "auditoria"}
      />
      <div className="hidden md:block w-8 h-0.5 bg-border/40" />
      <StepperItem
        active={activeTab === "ejecucion"}
        completed={false}
        icon={<IconRocket className="size-4" />}
        label="Paso 3"
        title="Confirmación & Cierre"
        disabled={activeTab !== "ejecucion"}
      />
    </div>
  );
}

function AuditoriaTab({
  anioOrigen,
  anioDestino,
  onContinue,
}: {
  anioOrigen: number;
  anioDestino: number;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 animation-duration-">
      <div className="text-center space-y-1.5">
        <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full px-3.5 py-1 text-xs font-bold">
          Transición Institucional {anioOrigen} → {anioDestino}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Auditoría de Cierre Escolar
        </h1>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Verificación automática de condiciones académicas y administrativas previas a la promoción masiva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALIDATION_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="p-5 rounded-2xl border-border/40 bg-card/80 space-y-4 hover:border-indigo-500/30 transition-all duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border transition-colors",
                  item.status === "complete"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-500",
                )}
              >
                {item.status === "complete" ? (
                  <IconCircleCheckFilled className="size-5" />
                ) : (
                  <IconAlertCircle className="size-5" />
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold rounded-full px-2.5 py-0.5",
                  item.status === "complete"
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                    : "border-amber-500/30 text-amber-600 bg-amber-500/5",
                )}
              >
                {item.status === "complete" ? "Validado" : "Revisión"}
              </Badge>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-foreground">
                {item.label}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground/70 pt-2 border-t border-border/30">
              {item.detail}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-2xl border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 via-indigo-950/20 to-transparent flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-md">
        <div className="space-y-1 text-center md:text-left relative z-10">
          <h2 className="text-base font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
            <IconShieldCheck className="size-5 text-indigo-500" />
            Condiciones Validadas para Iniciar Mapeo
          </h2>
          <p className="text-xs text-muted-foreground max-w-md">
            El ciclo {anioOrigen} se encuentra apto. Haz clic a continuación para mapear las secciones origen y destino.
          </p>
        </div>
        <Button
          onClick={onContinue}
          className="rounded-xl h-10 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all duration-200 text-xs gap-2 shrink-0 cursor-pointer"
        >
          <span>Iniciar Mapeo de Secciones</span>
          <IconArrowRight size={16} />
        </Button>
      </Card>
    </div>
  );
}

/* ── PASO 2: MAPEO Y SELECCIÓN NÓMINA ── */

function MappingStep({
  anioOrigen,
  anioDestino,
  onBack,
  niveles,
  selectedLevelId,
  onLevelChange,
  sourceSeccionId,
  onSourceChange,
  filteredSourceSecciones,
  targetSeccionId,
  onTargetChange,
  filteredTargetSecciones,
  isAutoSelectedTarget,
  sourceSeccionObj,
  targetSeccionObj,
  loadingStudents,
  filteredStudents,
  searchQuery,
  onSearchChange,
  selectedIds,
  onToggleStudent,
  onToggleAll,
  isPending,
  onPromote,
}: {
  anioOrigen: number;
  anioDestino: number;
  onBack: () => void;
  niveles: Array<{ id: string; nombre: string }>;
  selectedLevelId: string;
  onLevelChange: (val: string) => void;
  sourceSeccionId: string;
  onSourceChange: (val: string) => void;
  filteredSourceSecciones: SeccionPromocion[];
  targetSeccionId: string;
  onTargetChange: (val: string) => void;
  filteredTargetSecciones: SeccionPromocion[];
  isAutoSelectedTarget: boolean;
  sourceSeccionObj?: SeccionPromocion;
  targetSeccionObj?: SeccionPromocion;
  loadingStudents: boolean;
  filteredStudents: EstudiantePromocion[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedIds: string[];
  onToggleStudent: (id: string) => void;
  onToggleAll: () => void;
  isPending: boolean;
  onPromote: () => void;
}) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div className="space-y-5 animate-in fade-in animation-duration-">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/80 p-4 rounded-2xl border border-border/40 backdrop-blur-md shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 rounded-xl text-xs font-semibold cursor-pointer"
        >
          <IconArrowLeft size={14} />
          Volver a Auditoría
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Transferencia de Alumnos:
          </span>
          <Badge className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
            {anioOrigen} ➔ {anioDestino}
          </Badge>
        </div>
      </div>

      {/* ── BANNER DE CONTROL DE CONEXIÓN DE SECCIONES (FLOW BANNER) ── */}
      <Card className="p-4 rounded-2xl border-border/40 bg-card/80 backdrop-blur-md shadow-xs space-y-4">
        {/* Level Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <LevelSegmentedControl
            levels={niveles.map((n) => ({ id: n.id, label: n.nombre }))}
            value={selectedLevelId || (niveles[0]?.id ?? "")}
            onChange={onLevelChange}
            label="Nivel Educativo"
          />
        </div>

        {/* Dynamic Transfer Bridge */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Section Origen Box */}
          <div className="md:col-span-5 p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <IconSchool className="size-3.5" />
                1. Sección Origen ({anioOrigen})
              </span>
              {sourceSeccionObj && (
                <Badge variant="outline" className="text-[9px] font-bold bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-2 py-0.5 rounded-full">
                  {filteredStudents.length} Alumnos
                </Badge>
              )}
            </div>
            <Select value={sourceSeccionId} onValueChange={onSourceChange}>
              <SelectTrigger className="rounded-xl border-border/50 bg-background h-10 text-xs font-semibold">
                <SelectValue placeholder="Seleccionar aula de origen..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-background shadow-lg z-[80]">
                {filteredSourceSecciones.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                    {s.grado?.nombre} &quot;{s.seccion}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transfer Arrow Indicator */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-1">
            <div className="size-9 rounded-full bg-gradient-to-br from-indigo-600 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <IconArrowRight className="size-4.5 rotate-90 md:rotate-0" strokeWidth={2.5} />
            </div>
          </div>

          {/* Section Destino Box */}
          <div className="md:col-span-5 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <IconRocket className="size-3.5" />
                2. Sección Destino ({anioDestino})
              </span>
              {isAutoSelectedTarget && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-2 py-0.5 gap-1 rounded-full animate-pulse"
                >
                  <IconSparkles className="size-3" />
                  Correlativo
                </Badge>
              )}
            </div>
            <Select value={targetSeccionId} onValueChange={onTargetChange}>
              <SelectTrigger className="rounded-xl border-emerald-500/40 bg-emerald-500/10 h-10 text-xs font-bold text-foreground">
                <SelectValue placeholder="Seleccionar aula de destino..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 bg-background shadow-lg z-[80]">
                {filteredTargetSecciones.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs font-medium">
                    {s.grado?.nombre} &quot;{s.seccion}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* ── NÓMINA Y SELECCIÓN DE ALUMNOS ── */}
      <Card className="p-5 rounded-2xl border-border/40 bg-card/80 backdrop-blur-md space-y-4 shadow-md">
        {/* Header nómina */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <IconUserCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Nómina de Alumnos para Promoción
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {sourceSeccionObj
                  ? `Sección ${sourceSeccionObj.grado?.nombre} "${sourceSeccionObj.seccion}" (${anioOrigen})`
                  : "Selecciona una sección de origen para ver la lista"}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-bold rounded-full px-3 py-1 bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          >
            {selectedIds.length} de {filteredStudents.length} Seleccionados
          </Badge>
        </div>

        {/* Toolbar: Búsqueda y Marca Masiva */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por apellido o nombre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9.5 text-xs rounded-xl border-border/40 bg-background/80"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAll}
            disabled={filteredStudents.length === 0}
            className="h-9.5 text-xs font-semibold rounded-xl shrink-0 cursor-pointer border-border/50"
          >
            {selectedIds.length === filteredStudents.length
              ? "Desmarcar Todos"
              : "Seleccionar Todos"}
          </Button>
        </div>

        {/* Lista de Alumnos */}
        {!sourceSeccionId ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-2xl p-6 text-center gap-2 bg-muted/20">
            <IconSchool className="size-10 text-muted-foreground/30 mb-1" />
            <p className="text-xs font-bold text-foreground">
              Selecciona una Sección de Origen
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs">
              Usa el panel de arriba para seleccionar el aula del ciclo {anioOrigen}.
            </p>
          </div>
        ) : loadingStudents ? (
          <div className="flex flex-col items-center justify-center h-64 border border-border/30 rounded-2xl text-xs font-bold text-muted-foreground gap-2">
            <IconRefresh className="size-6 text-indigo-500 animate-spin" />
            <span>Cargando nómina de estudiantes...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-2xl text-xs font-semibold text-muted-foreground p-6 text-center">
            No se encontraron alumnos matriculados en esta sección.
          </div>
        ) : (
          <ScrollArea className="h-[360px] pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredStudents.map((st) => {
                const isSelected = selectedSet.has(st.id);
                return (
                  <div
                    key={st.id}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onClick={() => onToggleStudent(st.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onToggleStudent(st.id);
                      }
                    }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 outline-none",
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/40 shadow-xs"
                        : "bg-background/60 border-border/40 hover:bg-card hover:border-indigo-500/30",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleStudent(st.id)}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">
                          {st.apellidoPaterno} {st.apellidoMaterno}, {st.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          DNI: {st.dni || st.documentoIdentidad || "Sin registro"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shrink-0"
                    >
                      Apto 2027
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer Action Bar */}
        <div className="pt-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {sourceSeccionObj && targetSeccionObj ? (
              <span>
                Transición:{" "}
                <strong className="text-foreground font-semibold">
                  {sourceSeccionObj.grado?.nombre} &quot;{sourceSeccionObj.seccion}&quot;
                </strong>{" "}
                ➔{" "}
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {targetSeccionObj.grado?.nombre} &quot;{targetSeccionObj.seccion}&quot;
                </strong>
              </span>
            ) : (
              <span>Selecciona la sección de destino para activar el botón de promoción.</span>
            )}
          </div>

          <Button
            onClick={onPromote}
            disabled={selectedIds.length === 0 || !targetSeccionId || isPending}
            className="w-full sm:w-auto rounded-xl h-11 px-7 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-xs gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            <IconRocket className="size-4" />
            <span>Promover {selectedIds.length} Alumno(s)</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ── PASO 3: CONFIRMACIÓN Y CENTRO DE RESULTADOS ── */

function PromotionResultCard({
  isPending,
  selectedCount,
  sourceSeccionObj,
  targetSeccionObj,
  anioOrigen,
  anioDestino,
  onContinue,
  onGoToEnrollments,
}: {
  isPending: boolean;
  selectedCount: number;
  sourceSeccionObj?: SeccionPromocion;
  targetSeccionObj?: SeccionPromocion;
  anioOrigen: number;
  anioDestino: number;
  onContinue: () => void;
  onGoToEnrollments: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in zoom-in-95 animation-duration-">
      <Card className="p-8 rounded-3xl border-border/40 bg-card/80 backdrop-blur-md space-y-6 shadow-xl text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div
          className={cn(
            "size-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-colors relative z-10",
            isPending
              ? "bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-600 animate-pulse"
              : "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500 shadow-emerald-500/20",
          )}
        >
          {isPending ? (
            <IconRefresh className="size-9 animate-spin" />
          ) : (
            <IconCheck className="size-9" strokeWidth={3} />
          )}
        </div>

        <div className="space-y-2 relative z-10">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-1 text-xs font-bold">
            {isPending ? "Procesando..." : "Transición Formalizada Exitosamente"}
          </Badge>
          <h2 className="text-2xl font-bold text-foreground">
            {isPending
              ? "Generando Matrículas para el Nuevo Ciclo..."
              : "¡Promoción Masiva Registrada!"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            {isPending
              ? "Actualizando asignación de aulas, vacantes e historial académico en la base de datos."
              : `Se formalizó la inscripción de ${selectedCount} alumnos al ciclo académico ${anioDestino}.`}
          </p>
        </div>

        {/* Resumen de Transición */}
        {!isPending && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 text-left relative z-10">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Alumnos Promovidos
              </span>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {selectedCount} Estudiantes
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sección Origen ({anioOrigen})
              </span>
              <p className="text-xs font-bold text-foreground truncate">
                {sourceSeccionObj?.grado?.nombre} &quot;{sourceSeccionObj?.seccion}&quot;
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sección Destino ({anioDestino})
              </span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {targetSeccionObj?.grado?.nombre} &quot;{targetSeccionObj?.seccion}&quot;
              </p>
            </div>
          </div>
        )}

        {/* Botones de Acción Final */}
        {!isPending && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
            <Button
              onClick={onContinue}
              variant="outline"
              className="w-full sm:w-auto rounded-xl h-10 px-5 font-bold border-border/50 hover:bg-muted/60 text-xs cursor-pointer"
            >
              <IconRefresh className="size-4" />
              <span>Promover Otra Sección</span>
            </Button>

            <Button
              onClick={onGoToEnrollments}
              className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 text-xs gap-2 cursor-pointer"
            >
              <IconFileSpreadsheet className="size-4" />
              <span>Ver Registro de Matrículas {anioDestino}</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
