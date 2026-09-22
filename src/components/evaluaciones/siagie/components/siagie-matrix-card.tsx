"use client";

import * as React from "react";
import { IconSchool, IconSearch } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SectionAuditSummary } from "@/actions/siagie-audit";
import { SiagieSectionRow } from "./siagie-section-row";

interface SiagieMatrixCardProps {
  filteredSecciones: SectionAuditSummary[];
  totalSeccionesCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedEstado: string;
  onEstadoChange: (estado: string) => void;
  onOpenDetail: (seccionId: string) => void;
  onDownloadExcel: (seccionId: string) => void;
  downloadingSectionId: string | null;
  onDownloadAttendanceExcel: (seccionId: string) => void;
  downloadingAttendanceId: string | null;
}

export function SiagieMatrixCard({
  filteredSecciones,
  totalSeccionesCount,
  searchQuery,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  onOpenDetail,
  onDownloadExcel,
  downloadingSectionId,
  onDownloadAttendanceExcel,
  downloadingAttendanceId,
}: SiagieMatrixCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-extrabold flex items-center gap-2">
            <IconSchool className="size-5 text-primary" /> Matriz de Auditoría y Exportación por Sección
          </CardTitle>
          <CardDescription className="text-xs">
            Verifica la consistencia pedagógica antes de generar el archivo oficial de notas
          </CardDescription>
        </div>

        {/* Búsqueda rápida y Filtro de Estado */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar aula o tutor..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8.5 w-44 sm:w-52 rounded-xl text-xs bg-background/50 border-border/60"
            />
          </div>

          <Select value={selectedEstado} onValueChange={onEstadoChange}>
            <SelectTrigger className="w-36 h-8.5 rounded-xl text-xs font-bold border-border/60">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="TODOS" className="text-xs">
                Todos los Estados
              </SelectItem>
              <SelectItem value="LISTO" className="text-xs">
                ✓ Listos
              </SelectItem>
              <SelectItem value="OBSERVADO" className="text-xs">
                ⚠️ Observados
              </SelectItem>
              <SelectItem value="INCOMPLETO" className="text-xs">
                ❌ Incompletos
              </SelectItem>
            </SelectContent>
          </Select>

          <span className="text-[11px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
            {filteredSecciones.length} de {totalSeccionesCount}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0">
        <div className="divide-y divide-border/40">
          {filteredSecciones.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No se encontraron aulas con los filtros seleccionados.
            </p>
          ) : (
            filteredSecciones.map((s) => (
              <SiagieSectionRow
                key={s.id}
                section={s}
                onOpenDetail={onOpenDetail}
                onDownloadExcel={onDownloadExcel}
                isDownloading={downloadingSectionId === s.id}
                onDownloadAttendanceExcel={onDownloadAttendanceExcel}
                isDownloadingAttendance={downloadingAttendanceId === s.id}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
