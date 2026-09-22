"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { getStudentsInSeccionAction } from "@/actions/academic-structure";
import { promoteStudentsAction } from "@/actions/enrollments";
import { useQueryState, parseAsString } from "nuqs";
import {
  PromocionesViewProps,
  ActiveTab,
  EstudiantePromocion,
} from "./components/promociones-types";
import { PromotionGuideCard } from "./components/promotion-guide-card";
import { PromotionStepper } from "./components/promotion-stepper";
import { AuditoriaTab } from "./components/auditoria-tab";
import { MappingStep } from "./components/mapping-step";
import { PromotionResultCard } from "./components/promotion-result-card";

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
    parseAsString.withDefault("auditoria"),
  ) as [ActiveTab, (v: ActiveTab | null) => void];

  // States
  const [selectedLevelId, setSelectedLevelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault(""),
  );
  const [sourceSeccionId, setSourceSeccionId] = useQueryState(
    "sourceId",
    parseAsString.withDefault(""),
  );
  const [targetSeccionId, setTargetSeccionId] = useQueryState(
    "targetId",
    parseAsString.withDefault(""),
  );
  const [isAutoSelectedTarget, setIsAutoSelectedTarget] =
    useState<boolean>(false);
  const [students, setStudents] = useState<EstudiantePromocion[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
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
  }, [niveles, selectedLevelId, setSelectedLevelId]);

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
