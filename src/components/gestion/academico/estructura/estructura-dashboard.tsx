"use client";

import { useState, useMemo } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { NivelList } from "./components/nivel-list";
import { DashboardHeader } from "./components/dashboard-header";
import { GradesTimeline } from "./components/grades-timeline";
import { EstructuraTableView } from "./components/estructura-table-view";
import { SectionDetailSheet } from "./components/section-detail-sheet";
import { StructureFormModals } from "./components/structure-form-modals";
import { useEstructuraModals } from "./components/use-estructura-modals";

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
  const [selectedNivelId, setSelectedNivelId] = useQueryState(
    "nivelId",
    parseAsString.withDefault(initialNiveles[0]?.id || ""),
  );
  const [selectedSeccionId, setSelectedSeccionId] = useQueryState(
    "seccionId",
    parseAsString,
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [viewMode, setViewMode] = useQueryState(
    "view",
    parseAsString.withDefault("cards"),
  );
  const [selectedSedeId, setSelectedSedeId] = useQueryState(
    "sedeId",
    parseAsString.withDefault("all"),
  );
  const [mobileView, setMobileView] = useState<"niveles" | "grados">("niveles");

  const modals = useEstructuraModals(selectedYear, institucionId);

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

  const seccionesFiltradas = useMemo(() => {
    if (!selectedSedeId || selectedSedeId === "all") {
      return initialSecciones;
    }
    return initialSecciones.filter((s) => s.sedeId === selectedSedeId);
  }, [initialSecciones, selectedSedeId]);

  const getSectionsForGrade = (gradeId: string) =>
    seccionesFiltradas.filter((s) => s.gradoId === gradeId);

  const handleYearChange = (year: string) =>
    router.push(`/gestion/academico/estructura?anio=${year}`);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)] overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <modals.ConfirmDialog />
      <modals.CloneConfirmDialog />

      {/* ── Sidebar: Niveles ── */}
      <div
        className={cn(
          "w-full lg:w-72 flex flex-col gap-3 overflow-hidden h-full shrink-0 p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs",
          mobileView === "niveles" ? "flex" : "hidden lg:flex",
        )}
      >
        <NivelList
          niveles={initialNiveles}
          grados={initialGrados}
          secciones={seccionesFiltradas}
          selectedNivelId={selectedNivelId}
          onSelectNivel={(id) => {
            setSelectedNivelId(id);
            setSelectedSeccionId(null);
            setMobileView("grados");
          }}
          onAddNivel={() => modals.setNivelModal({ open: true })}
          onEditNivel={modals.handleEditNivel}
          onDeleteNivel={modals.handleDeleteNivel}
        />
      </div>

      {/* ── Main panel: Grados & Secciones ── */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden h-full min-h-0 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs",
          mobileView === "grados" ? "flex" : "hidden lg:flex",
        )}
      >
        <DashboardHeader
          selectedNivel={selectedNivel}
          selectedYear={selectedYear}
          clonando={modals.clonando}
          searchQuery={searchQuery}
          viewMode={viewMode as "cards" | "table"}
          sedes={sedes}
          selectedSedeId={selectedSedeId}
          onSedeChange={setSelectedSedeId}
          onViewModeChange={(m) => setViewMode(m)}
          onSearchChange={setSearchQuery}
          onBack={() => setMobileView("niveles")}
          onYearChange={handleYearChange}
          onClone={modals.handleClone}
          onNewGrado={() => modals.setGradoModal({ open: true })}
          onNewSalon={() => modals.setWizardModal({ open: true })}
        />

        {/* View Switch: Cards vs Table */}
        {viewMode === "table" ? (
          <EstructuraTableView
            grados={filteredGrados}
            secciones={seccionesFiltradas}
            onSelectSection={(seccion) => setSelectedSeccionId(seccion.id)}
            onEditSection={(seccion) =>
              modals.setSeccionModal({ open: true, data: seccion })
            }
            onDeleteSection={modals.handleDeleteSection}
            onAssignTutor={(seccion) =>
              modals.setTutorModal({ open: true, seccion })
            }
            onAddSection={(gradeId) =>
              modals.setWizardModal({ open: true, gradeId })
            }
          />
        ) : (
          <GradesTimeline
            grados={filteredGrados}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
            getSectionsForGrade={getSectionsForGrade}
            onAddSection={(gradeId) =>
              modals.setWizardModal({ open: true, gradeId })
            }
            onSelectSection={(seccion) => setSelectedSeccionId(seccion.id)}
            onEditSection={(seccion) =>
              modals.setSeccionModal({ open: true, data: seccion })
            }
            onDeleteSection={modals.handleDeleteSection}
            onAssignTutor={(seccion) =>
              modals.setTutorModal({ open: true, seccion })
            }
            onEditGrade={(grado) =>
              modals.setGradoModal({ open: true, data: grado })
            }
            onDeleteGrade={(gradeId) => modals.handleDeleteGrade(gradeId)}
          />
        )}

        <SectionDetailSheet
          selectedSeccionId={selectedSeccionId}
          secciones={seccionesFiltradas}
          grados={initialGrados}
          nivel={selectedNivel}
          tutores={tutores}
          onClose={() => setSelectedSeccionId(null)}
          onEditSection={(seccion) =>
            modals.setSeccionModal({ open: true, data: seccion })
          }
          onDeleteSection={(id) => modals.handleDeleteSection(id)}
          onAssignTutor={(seccion) =>
            modals.setTutorModal({ open: true, seccion })
          }
          onAddCourse={(seccion) =>
            modals.setCourseModal({ open: true, seccion })
          }
        />
      </div>

      {/* ── Modals ── */}
      <StructureFormModals
        institucionId={institucionId}
        selectedYear={selectedYear}
        selectedNivelId={selectedNivelId}
        initialNiveles={initialNiveles}
        initialGrados={initialGrados}
        initialSecciones={initialSecciones}
        tutores={tutores}
        sedes={sedes}
        nivelModal={modals.nivelModal}
        setNivelModal={modals.setNivelModal}
        gradoModal={modals.gradoModal}
        setGradoModal={modals.setGradoModal}
        seccionModal={modals.seccionModal}
        setSeccionModal={modals.setSeccionModal}
        tutorModal={modals.tutorModal}
        setTutorModal={modals.setTutorModal}
        courseModal={modals.courseModal}
        setCourseModal={modals.setCourseModal}
        wizardModal={modals.wizardModal}
        setWizardModal={modals.setWizardModal}
        getSectionsForGrade={getSectionsForGrade}
      />
    </div>
  );
}
