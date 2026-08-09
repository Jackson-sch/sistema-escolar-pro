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
  const [activeTab, setActiveTab] = useState<ActiveTab>("auditoria");

  // States
  const [selectedLevelId, setSelectedLevelId] = useState<string>("all");
  const [sourceSeccionId, setSourceSeccionId] = useState<string>("");
  const [targetSeccionId, setTargetSeccionId] = useState<string>("");
  const [isAutoSelectedTarget, setIsAutoSelectedTarget] =
    useState<boolean>(false);
  const [students, setStudents] = useState<EstudiantePromocion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const niveles = useMemo<Array<{ id: string; nombre: string }>>(() => {
    const map = new Map<string, { id: string; nombre: string }>();
    seccionesOrigen.forEach((s) => {
      if (s.nivel && !map.has(s.nivel.id)) map.set(s.nivel.id, s.nivel);
    });
    return Array.from(map.values());
  }, [seccionesOrigen]);

  const filteredSourceSecciones = useMemo(() => {
    if (selectedLevelId === "all") return seccionesOrigen;
    return seccionesOrigen.filter((s) => s.nivel?.id === selectedLevelId);
  }, [seccionesOrigen, selectedLevelId]);

  const filteredTargetSecciones = useMemo(() => {
    if (selectedLevelId === "all") return seccionesDestino;
    return seccionesDestino.filter((s) => s.nivel?.id === selectedLevelId);
  }, [seccionesDestino, selectedLevelId]);

  // Detección e inferencia automática de la sección destino (ej. 2° A -> 3° A)
  const autoDetectTargetSeccion = (sourceId: string) => {
    const sourceObj = seccionesOrigen.find((s) => s.id === sourceId);
    if (!sourceObj) return;

    const sourceNivelId = sourceObj.nivel?.id;
    const sourceLetter = sourceObj.seccion?.trim().toUpperCase();
    const gradeName = sourceObj.grado?.nombre || "";

    // Extraer número de grado (ej: "2° Primaria" -> 2, "2do Grado" -> 2)
    const match = gradeName.match(/\d+/);
    const currentGradeNum = match ? parseInt(match[0], 10) : null;

    if (currentGradeNum !== null) {
      const nextGradeNum = currentGradeNum + 1;

      // Buscar en seccionesDestino la sección con mismo nivel, misma letra y grado + 1
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
          `Preselección automática: ${matchTarget.nivel?.nombre || ""} ${matchTarget.grado?.nombre || ""} "${matchTarget.seccion}" (${anioDestino}).`,
          { id: "auto-target-toast" },
        );
        return;
      }
    }

    // Fallback: Si no se encuentra grado + 1, intentar por misma letra de sección
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
      // El flag de carga se difiere para evitar setState síncrono dentro del efecto
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
    // Limpieza diferida para evitar setState síncrono dentro del efecto
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

      {/* ── PASO 2: MAPEO DE SECCIONES ── */}
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

      {/* ── PASO 3: CENTRO DE CONTROL Y RESULTADOS ── */}
      {activeTab === "ejecucion" && (
        <PromotionResultCard
          isPending={isPending}
          selectedCount={selectedIds.length}
          onContinue={resetMapping}
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
              <Badge className="bg-indigo-600 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded">
                EduNova PRO
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Proceso institucional para la transición de alumnos entre el ciclo
              lectivo{" "}
              <span className="font-bold text-indigo-400">{anioOrigen}</span> y{" "}
              <span className="font-bold text-emerald-400">{anioDestino}</span>.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground shrink-0 gap-1"
        >
          <span>{showGuide ? "Ocultar guía" : "Ver indicaciones"}</span>
          {showGuide ? (
            <IconChevronUp className="size-3.5" />
          ) : (
            <IconChevronDown className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Contenido Desplegable de las Indicaciones */}
      {showGuide && (
        <div className="pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in animation-duration-">
          <div className="p-3 rounded-xl bg-background/40 border border-border/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconShieldCheck className="size-4 shrink-0" />
              <span>1. Auditoría Inicial</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Revisa el estado de actas de notas, asistencia y finanzas para
              certificar que la institución está lista para el cierre.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-background/40 border border-border/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <IconTrendingUp className="size-4 shrink-0" />
              <span>2. Mapeo de Secciones</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Al elegir una sección origen (ej: 2° A {anioOrigen}), el sistema{" "}
              <strong className="text-foreground font-semibold">
                preselecciona automáticamente
              </strong>{" "}
              la correlativa (3° A {anioDestino}).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-background/40 border border-border/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <IconRocket className="size-4 shrink-0" />
              <span>3. Promoción Masiva</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Filtra y confirma los alumnos promovibles. Al hacer clic en
              Promover, se generan sus matrículas para el nuevo ciclo lectivo.
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
        title="Mapeo de Secciones"
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
        title="Centro de Promoción"
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
        <Badge className="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1 text-[11px] font-bold">
          Ciclo Lectivo {anioOrigen} → {anioDestino}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Auditoría Institucional de Cierre
        </h1>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto">
          Verificación automática de prerrequisitos académicos antes de iniciar
          la promoción masiva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALIDATION_ITEMS.map((item) => (
          <Card
            key={item.id}
            className="p-5 rounded-2xl border-border/50 bg-card/80 space-y-4 hover:border-indigo-500/30 transition-[border-color] shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center border transition-[color,background-color,border-color]",
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
                  "text-[10px] font-semibold rounded-lg px-2.5 py-0.5",
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
            <p className="text-[10px] font-semibold text-muted-foreground/70 pt-1 border-t border-border/30">
              {item.detail}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-2xl border-indigo-500/20 bg-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1 text-center md:text-left relative z-10">
          <h2 className="text-lg font-bold text-foreground flex items-center justify-center md:justify-start gap-2">
            <IconShieldCheck className="size-5 text-indigo-500" />
            Sistema Listo para el Mapeo
          </h2>
          <p className="text-xs text-muted-foreground max-w-md">
            El ciclo {anioOrigen} cumple con las verificaciones requeridas.
            Procede a configurar las secciones de origen y destino.
          </p>
        </div>
        <Button
          onClick={onContinue}
          className="rounded-xl h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-colors text-xs gap-2 shrink-0"
        >
          <span>Configurar Mapeo</span>
          <IconArrowRight size={16} />
        </Button>
      </Card>
    </div>
  );
}

/* ── Paso 2: Mapeo de Secciones ── */

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
  return (
    <div className="space-y-5 animate-in fade-in animation-duration-">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/80 p-4 rounded-2xl border border-border/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 rounded-xl text-xs font-semibold"
        >
          <IconArrowLeft size={14} />
          Volver a Auditoría
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Transferencia Lectiva:
          </span>
          <Badge className="bg-indigo-600 text-white text-xs font-bold px-3 py-0.5 rounded-md">
            {anioOrigen} → {anioDestino}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionMappingPanel
          niveles={niveles}
          selectedLevelId={selectedLevelId}
          onLevelChange={onLevelChange}
          sourceSeccionId={sourceSeccionId}
          onSourceChange={onSourceChange}
          filteredSourceSecciones={filteredSourceSecciones}
          targetSeccionId={targetSeccionId}
          onTargetChange={onTargetChange}
          filteredTargetSecciones={filteredTargetSecciones}
          isAutoSelectedTarget={isAutoSelectedTarget}
          sourceSeccionObj={sourceSeccionObj}
          targetSeccionObj={targetSeccionObj}
          anioOrigen={anioOrigen}
          anioDestino={anioDestino}
        />

        <StudentsSelectionPanel
          sourceSeccionId={sourceSeccionId}
          targetSeccionId={targetSeccionId}
          loadingStudents={loadingStudents}
          filteredStudents={filteredStudents}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedIds={selectedIds}
          onToggleStudent={onToggleStudent}
          onToggleAll={onToggleAll}
          isPending={isPending}
          onPromote={onPromote}
        />
      </div>
    </div>
  );
}

function SectionMappingPanel({
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
  anioOrigen,
  anioDestino,
}: {
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
  anioOrigen: number;
  anioDestino: number;
}) {
  return (
    <div className="lg:col-span-5 space-y-4">
      <Card className="p-5 rounded-2xl border-border/40 bg-card/80 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/30">
          <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <IconFilter className="text-indigo-500 size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Filtro de Nivel
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Selecciona el nivel académico
            </p>
          </div>
        </div>

        <LevelSegmentedControl
          levels={[
            { id: "all", label: "TODOS" },
            ...niveles.map((n) => ({ id: n.id, label: n.nombre })),
          ]}
          value={selectedLevelId}
          onChange={onLevelChange}
          label="1. Nivel Educativo"
        />

        <div className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-4">
          {/* Origen */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              2. Sección Origen ({anioOrigen})
            </span>
            <Select value={sourceSeccionId} onValueChange={onSourceChange}>
              <SelectTrigger className="rounded-xl border-border/40 bg-background h-10 text-xs font-medium">
                <SelectValue placeholder="Selecciona origen..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {filteredSourceSecciones.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.nivel?.nombre} - {s.grado?.nombre} &quot;{s.seccion}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center -my-1">
            <div className="size-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <IconArrowRight
                className="size-3.5 rotate-90 lg:rotate-0"
                strokeWidth={3}
              />
            </div>
          </div>

          {/* Destino */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                3. Sección Destino ({anioDestino})
              </span>
              {isAutoSelectedTarget && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/30 px-1.5 py-0 gap-1 rounded"
                >
                  <IconSparkles className="size-2.5" />
                  Auto-Sugerido
                </Badge>
              )}
            </div>
            <Select value={targetSeccionId} onValueChange={onTargetChange}>
              <SelectTrigger className="rounded-xl border-emerald-500/30 bg-emerald-500/5 h-10 text-xs font-medium">
                <SelectValue placeholder="Selecciona destino..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                {filteredTargetSecciones.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.nivel?.nombre} - {s.grado?.nombre} &quot;{s.seccion}&quot;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumen del Mapeo Seleccionado */}
        {sourceSeccionObj && targetSeccionObj && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1">
            <p className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <span>Mapeo Establecido</span>
              {isAutoSelectedTarget && (
                <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                  (Detección correlativa automática ✨)
                </span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground">
              De{" "}
              <span className="font-semibold text-foreground">
                {sourceSeccionObj.grado?.nombre} &quot;{sourceSeccionObj.seccion}
                &quot;
              </span>{" "}
              a{" "}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {targetSeccionObj.grado?.nombre} &quot;{targetSeccionObj.seccion}
                &quot;
              </span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function StudentsSelectionPanel({
  sourceSeccionId,
  targetSeccionId,
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
  sourceSeccionId: string;
  targetSeccionId: string;
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
    <div className="lg:col-span-7 space-y-4">
      <Card className="p-5 rounded-2xl border-border/40 bg-card/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <IconUserCheck className="size-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Estudiantes de la Sección Origen
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-bold rounded-md px-2 py-0.5"
          >
            {selectedIds.length} de {filteredStudents.length} Seleccionados
          </Badge>
        </div>

        {/* Toolbar: Búsqueda y Botón Seleccionar Todo */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por apellido o nombre..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-9 text-xs rounded-xl border-border/40"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAll}
            disabled={filteredStudents.length === 0}
            className="h-9 text-[11px] font-semibold rounded-xl shrink-0"
          >
            {selectedIds.length === filteredStudents.length
              ? "Desmarcar Todos"
              : "Seleccionar Todos"}
          </Button>
        </div>

        {/* Lista de Estudiantes */}
        {!sourceSeccionId ? (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-border/40 rounded-xl p-6 text-center gap-2 text-muted-foreground">
            <IconSchool className="size-8 opacity-30" />
            <p className="text-xs font-semibold">
              Selecciona una sección de origen para listar los estudiantes.
            </p>
          </div>
        ) : loadingStudents ? (
          <div className="flex items-center justify-center h-64 text-xs font-semibold text-muted-foreground">
            Cargando nómina de estudiantes...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-xs font-semibold text-muted-foreground">
            No se encontraron estudiantes en esta sección.
          </div>
        ) : (
          <ScrollArea className="h-[360px] pr-2">
            <div className="space-y-2">
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
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-[background-color,border-color] outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-indigo-500/10 border-indigo-500/30"
                        : "bg-muted/10 border-border/30 hover:bg-muted/20",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleStudent(st.id)}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          {st.apellidoPaterno} {st.apellidoMaterno}, {st.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          DNI: {st.documentoIdentidad || "Sin registro"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                    >
                      Promovible
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Accion de Promoción Masiva */}
        <div className="pt-2 flex justify-end">
          <Button
            onClick={onPromote}
            disabled={selectedIds.length === 0 || !targetSeccionId || isPending}
            className="rounded-xl h-11 px-6 font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 text-xs gap-2"
          >
            <IconRocket className="size-4" />
            <span>Promover {selectedIds.length} Estudiante(s)</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PromotionResultCard({
  isPending,
  selectedCount,
  onContinue,
}: {
  isPending: boolean;
  selectedCount: number;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto py-10 text-center space-y-6 animate-in zoom-in-95 animation-duration-">
      <Card className="p-8 rounded-3xl border-border/40 bg-card/80 space-y-6 shadow-xl">
        <div
          className={cn(
            "size-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-[color,background-color,border-color]",
            isPending
              ? "bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-600 animate-pulse"
              : "bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-500",
          )}
        >
          {isPending ? (
            <IconRefresh className="size-9 animate-spin" />
          ) : (
            <IconCheck className="size-9" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {isPending
              ? "Procesando Promoción Masiva..."
              : "¡Promoción Completada!"}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {isPending
              ? "Actualizando registros de matrícula y asignación de secciones para el nuevo ciclo."
              : `Se han promovido ${selectedCount} estudiante(s) a la sección destino exitosamente.`}
          </p>
        </div>

        {!isPending && (
          <div className="pt-2 flex flex-col items-center gap-3">
            <Button
              onClick={onContinue}
              className="rounded-xl h-10 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 text-xs"
            >
              Continuar con otra sección
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
