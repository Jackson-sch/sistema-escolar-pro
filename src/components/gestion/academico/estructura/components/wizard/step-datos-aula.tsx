"use client";

import { useMemo } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherSelector } from "@/components/common/teacher-selector";

interface StepDatosAulaProps {
  grados: any[];
  niveles: any[];
  selectedNivelId?: string;
  gradoId: string;
  onGradoChange: (id: string) => void;
  seccionNombre: string;
  onSeccionNombreChange: (v: string) => void;
  turno: string;
  onTurnoChange: (v: string) => void;
  capacidad: string;
  onCapacidadChange: (v: string) => void;
  aulaAsignada: string;
  onAulaAsignadaChange: (v: string) => void;
  tutores: any[];
  tutorId: string | null;
  onTutorChange: (id: string | null) => void;
  selectedTutor: any;
  onNext: () => void;
}

export function StepDatosAula({
  grados,
  niveles,
  selectedNivelId,
  gradoId,
  onGradoChange,
  seccionNombre,
  onSeccionNombreChange,
  turno,
  onTurnoChange,
  capacidad,
  onCapacidadChange,
  aulaAsignada,
  onAulaAsignadaChange,
  tutores,
  tutorId,
  onTutorChange,
  selectedTutor,
  onNext,
}: StepDatosAulaProps) {
  const filteredGrados = useMemo(() => {
    if (!selectedNivelId) return grados;
    const match = grados.filter((g) => g.nivelId === selectedNivelId);
    return match.length > 0 ? match : grados;
  }, [grados, selectedNivelId]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Grado Académico *</Label>
          <Select value={gradoId} onValueChange={onGradoChange}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl">
              <SelectValue placeholder="Selecciona grado..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-48 z-[80]">
              {filteredGrados.map((g) => {
                const nivelObj = niveles.find((n) => n.id === g.nivelId);
                const showPrefix =
                  !selectedNivelId || filteredGrados.length === grados.length;
                const label =
                  showPrefix && nivelObj?.nombre
                    ? `${nivelObj.nombre} - ${g.nombre}`
                    : g.nombre;
                return (
                  <SelectItem
                    key={g.id}
                    value={g.id}
                    className="text-xs font-medium"
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Letra / Sección *</Label>
          <Input
            value={seccionNombre}
            onChange={(e) => onSeccionNombreChange(e.target.value)}
            placeholder="Ej: A, B, Única..."
            className="h-9 text-xs rounded-xl uppercase font-bold"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Turno</Label>
          <Select value={turno} onValueChange={onTurnoChange}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[80]">
              <SelectItem value="MANANA" className="text-xs">
                Mañana
              </SelectItem>
              <SelectItem value="TARDE" className="text-xs">
                Tarde
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Capacidad Alumnos</Label>
          <Input
            type="number"
            value={capacidad}
            onChange={(e) => onCapacidadChange(e.target.value)}
            className="h-9 text-xs rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Aula Física</Label>
          <Input
            value={aulaAsignada}
            onChange={(e) => onAulaAsignadaChange(e.target.value)}
            placeholder="Aula 101"
            className="h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <Label className="text-xs font-bold flex items-center justify-between">
          <span>Tutor Responsable del Salón (Opcional)</span>
          {selectedTutor && (
            <Badge
              variant="outline"
              className="text-[10px] text-primary border-primary/30"
            >
              {selectedTutor.name} {selectedTutor.apellidoPaterno || ""}
            </Badge>
          )}
        </Label>
        <div className="p-3 rounded-2xl border border-border/40 bg-muted/20">
          <TeacherSelector
            teachers={tutores}
            onSelect={(id) => onTutorChange(id)}
            selectedTeacherId={tutorId}
            currentTeacher={selectedTutor}
            searchPlaceholder="Buscar tutor por nombre o apellido..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={onNext}
          disabled={!gradoId || !seccionNombre}
          className="rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-primary/10"
        >
          Siguiente: Malla y Cursos
          <IconChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
