"use client";

import { UseFormReturn } from "react-hook-form";
import {
  IconSchool,
  IconBuildingCommunity,
  IconBabyCarriage,
  IconCertificate,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnrollmentValues } from "@/lib/schemas/enrollment";
import { getAnioLectivoOptions } from "@/lib/constants";
import { AcademicLevelSelector } from "../academic-level-selector";
import { EnrollmentSectionHeader } from "./enrollment-section-header";

export interface NivelAcademicoOpcion {
  id: string;
  nivel: { nombre: string };
}

interface AcademicAssignmentSectionProps {
  form: UseFormReturn<EnrollmentValues>;
  allNiveles: NivelAcademicoOpcion[];
  filteredByLevel: NivelAcademicoOpcion[];
  selectedLevel: string | null;
  onSelectLevel: (level: string | null) => void;
  isLoading: boolean;
  anio: number;
}

export function AcademicAssignmentSection({
  form,
  allNiveles,
  filteredByLevel,
  selectedLevel,
  onSelectLevel,
  isLoading,
  anio,
}: AcademicAssignmentSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <EnrollmentSectionHeader
        icon={IconSchool}
        iconClassName="bg-blue-500/10 border-blue-500/20 text-blue-500"
        title="2. Asignación Académica"
        description="Seleccione el nivel educativo, periodo lectivo y sección correspondiente."
      />

      <div className="space-y-4">
        {/* Selector de Nivel Educativo */}
        <div className="space-y-2">
          <FormLabel className="text-xs font-medium text-foreground/80">
            Nivel Educativo
          </FormLabel>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/20 rounded-2xl border border-border/30">
            {[
              { id: "INICIAL", icon: IconBabyCarriage },
              { id: "PRIMARIA", icon: IconSchool },
              { id: "SECUNDARIA", icon: IconCertificate },
            ].map((level) => {
              const isActive = selectedLevel === level.id;
              const Icon = level.icon;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => onSelectLevel(isActive ? null : level.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-[color,background-color,border-color,box-shadow] text-xs font-semibold border cursor-pointer",
                    isActive
                      ? "text-white bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20"
                      : "text-muted-foreground bg-background hover:bg-muted/40 border-border/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="uppercase tracking-wider">{level.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Periodo y Aula/Sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="anioAcademico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Periodo Lectivo
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 w-full rounded-xl border-border/40 bg-background font-medium text-xs">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 rounded-xl">
                    {getAnioLectivoOptions().map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs font-medium"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <AcademicLevelSelector
            form={form}
            name="nivelAcademicoId"
            allNiveles={allNiveles}
            filteredByLevel={filteredByLevel}
            selectedLevel={selectedLevel}
            isLoading={isLoading}
            anio={anio}
          />
        </div>

        <FormField
          control={form.control}
          name="procedencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Institución de Procedencia
              </FormLabel>
              <FormControl>
                <div className="relative group/input">
                  <IconBuildingCommunity className="absolute left-3.5 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    className="h-9 bg-background border-border/40 pl-10 text-xs rounded-xl"
                    placeholder="Nombre del colegio anterior (Opcional)"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
