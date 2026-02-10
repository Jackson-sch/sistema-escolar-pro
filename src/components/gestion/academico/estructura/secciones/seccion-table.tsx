"use client";

import * as React from "react";
import { useQueryState, parseAsString } from "nuqs";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { deleteSeccionAction } from "@/actions/academic-structure";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useState, useTransition, useEffect, useMemo } from "react";
import { FormModal } from "@/components/modals/form-modal";
import { SeccionForm } from "./seccion-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// New modular components
import { getSeccionColumns } from "./components/table-columns";

export type SeccionTableType = {
  id: string;
  seccion: string;
  capacidad: number;
  aulaAsignada: string | null;
  anioAcademico: number;
  turno: string;
  gradoId: string;
  institucionId: string;
  nivel: { nombre: string };
  grado: { nombre: string; codigo: string };
  tutor: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;
  sedeId: string | null;
  sede: { nombre: string } | null;
  _count: { students: number; matriculas: number };
};

interface SeccionTableProps {
  data: SeccionTableType[];
  meta: {
    grados: any[];
    tutores: any[];
    sedes: any[];
    institucionId: string;
  };
}

// Internal Toolbar Component
interface SeccionTableToolbarProps {
  grados: any[];
  sedes: any[];
  nivelFilter: string;
  setNivelFilter: (val: string) => void;
  gradoFilter: string;
  setGradoFilter: (val: string) => void;
  turnoFilter: string;
  setTurnoFilter: (val: string) => void;
  sedeFilter: string;
  setSedeFilter: (val: string) => void;
}

function SeccionTableToolbar({
  grados,
  sedes,
  nivelFilter,
  setNivelFilter,
  gradoFilter,
  setGradoFilter,
  turnoFilter,
  setTurnoFilter,
  sedeFilter,
  setSedeFilter,
}: SeccionTableToolbarProps) {
  const niveles = Array.from(new Set(grados.map((g) => g.nivel.nombre)));
  const isLevelSelected = nivelFilter !== "ALL";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Nivel Filter */}
      <Select
        value={nivelFilter}
        onValueChange={(val) => {
          setNivelFilter(val);
          setGradoFilter("ALL");
        }}
      >
        <SelectTrigger className="w-[130px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Nivel" />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todos los niveles
          </SelectItem>
          {niveles.map((n) => (
            <SelectItem
              key={n}
              value={n}
              className="text-[11px] font-medium uppercase"
            >
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Grado Filter */}
      <Select
        value={gradoFilter}
        onValueChange={setGradoFilter}
        disabled={!isLevelSelected}
      >
        <SelectTrigger
          className={cn(
            "w-[130px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full",
            !isLevelSelected && "opacity-50 cursor-not-allowed",
          )}
        >
          <SelectValue
            placeholder={isLevelSelected ? "Grado" : "Seleccione nivel"}
          />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            {isLevelSelected ? "Todos los grados" : "Primero elija nivel"}
          </SelectItem>
          {grados
            .filter(
              (g) => nivelFilter === "ALL" || g.nivel.nombre === nivelFilter,
            )
            .map((g) => (
              <SelectItem
                key={g.id}
                value={g.nombre}
                className="text-[11px] font-medium"
              >
                {g.nombre}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Turno Filter */}
      <Select value={turnoFilter} onValueChange={setTurnoFilter}>
        <SelectTrigger className="w-[120px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Turno" />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todos los turnos
          </SelectItem>
          <SelectItem value="MANANA" className="text-[11px] font-medium">
            Mañana
          </SelectItem>
          <SelectItem value="TARDE" className="text-[11px] font-medium">
            Tarde
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Sede Filter */}
      <Select value={sedeFilter} onValueChange={setSedeFilter}>
        <SelectTrigger className="w-[140px] h-9 bg-muted/5 border-border/40 text-[11px] font-medium transition-all focus:ring-primary/20 rounded-full">
          <SelectValue placeholder="Sede" />
        </SelectTrigger>
        <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
          <SelectItem value="ALL" className="text-[11px] font-medium">
            Todas las sedes
          </SelectItem>
          {sedes.map((s) => (
            <SelectItem
              key={s.id}
              value={s.nombre}
              className="text-[11px] font-medium"
            >
              {s.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SeccionTable({ data, meta }: SeccionTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSeccion, setSelectedSeccion] =
    useState<SeccionTableType | null>(null);
  const [isDeleting, startTransition] = useTransition();

  // URL State with nuqs
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [nivelFilter, setNivelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("ALL"),
  );
  const [gradoFilter, setGradoFilter] = useQueryState(
    "grado",
    parseAsString.withDefault("ALL"),
  );
  const [turnoFilter, setTurnoFilter] = useQueryState(
    "turno",
    parseAsString.withDefault("ALL"),
  );
  const [sedeFilter, setSedeFilter] = useQueryState(
    "sede",
    parseAsString.withDefault("ALL"),
  );

  const hasActiveFilters =
    searchQuery !== "" ||
    nivelFilter !== "ALL" ||
    gradoFilter !== "ALL" ||
    turnoFilter !== "ALL" ||
    sedeFilter !== "ALL";

  const onClearFilters = () => {
    setSearchQuery("");
    setNivelFilter("ALL");
    setGradoFilter("ALL");
    setTurnoFilter("ALL");
    setSedeFilter("ALL");
  };

  const onEdit = (seccion: SeccionTableType) => {
    setSelectedSeccion(seccion);
    setShowEditDialog(true);
  };

  const onDelete = (seccion: SeccionTableType) => {
    setSelectedSeccion(seccion);
    setShowDeleteModal(true);
  };

  // Columns definition memoized
  const columns = useMemo(() => getSeccionColumns({ onEdit, onDelete }), []);

  const onConfirmDelete = () => {
    if (!selectedSeccion) return;
    startTransition(async () => {
      const res = await deleteSeccionAction(selectedSeccion.id);
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedSeccion(null);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="seccion"
        searchPlaceholder="Buscar sección..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        initialState={{
          columnVisibility: {
            nivel: false,
            grado: false,
          },
        }}
      >
        {(table) => {
          // Sync URL filters with table column filters
          useEffect(() => {
            table
              .getColumn("nivel")
              ?.setFilterValue(nivelFilter === "ALL" ? "" : nivelFilter);
          }, [nivelFilter, table]);

          useEffect(() => {
            table
              .getColumn("grado")
              ?.setFilterValue(gradoFilter === "ALL" ? "" : gradoFilter);
          }, [gradoFilter, table]);

          useEffect(() => {
            table
              .getColumn("turno")
              ?.setFilterValue(turnoFilter === "ALL" ? "" : turnoFilter);
          }, [turnoFilter, table]);

          useEffect(() => {
            table
              .getColumn("sede")
              ?.setFilterValue(sedeFilter === "ALL" ? "" : sedeFilter);
          }, [sedeFilter, table]);

          return (
            <SeccionTableToolbar
              grados={meta.grados}
              sedes={meta.sedes}
              nivelFilter={nivelFilter}
              setNivelFilter={setNivelFilter}
              gradoFilter={gradoFilter}
              setGradoFilter={setGradoFilter}
              turnoFilter={turnoFilter}
              setTurnoFilter={setTurnoFilter}
              sedeFilter={sedeFilter}
              setSedeFilter={setSedeFilter}
            />
          );
        }}
      </DataTable>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="¿Eliminar Sección?"
        description={`¿Estás seguro de eliminar la sección "${selectedSeccion?.grado.nombre} ${selectedSeccion?.seccion}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />

      <FormModal
        title="Editar Sección"
        description="Modifica los datos de la sección seleccionada."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-md"
      >
        <SeccionForm
          initialData={selectedSeccion}
          grados={meta.grados}
          tutores={meta.tutores}
          sedes={meta.sedes}
          institucionId={meta.institucionId}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedSeccion(null);
          }}
        />
      </FormModal>
    </>
  );
}
