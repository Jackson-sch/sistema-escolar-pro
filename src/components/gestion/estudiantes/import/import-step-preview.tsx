"use client";

import { useState } from "react";
import {
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconSchool,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ParseResult } from "@/lib/excel";

interface ImportStepPreviewProps {
  parseResult: ParseResult;
  nivelesAcademicos?: any[];
  defaultSectionId: string;
  onDefaultSectionChange: (id: string) => void;
}

export function ImportStepPreview({
  parseResult,
  nivelesAcademicos = [],
  defaultSectionId,
  onDefaultSectionChange,
}: ImportStepPreviewProps) {
  const [filter, setFilter] = useState<"all" | "valid" | "warning" | "error">(
    "all",
  );

  const filteredRows = parseResult.rows.filter((r) => {
    if (filter === "valid") return r.status === "valid";
    if (filter === "warning") return r.status === "warning";
    if (filter === "error") return r.status === "error";
    return true;
  });

  return (
    <div className="space-y-4 py-1">
      {/* ── 1. Tarjetas de Diagnóstico ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === "all"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border/50 bg-card hover:bg-muted/40"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Filas
          </span>
          <p className="text-xl font-extrabold text-foreground mt-0.5">
            {parseResult.totalRows}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("valid")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === "valid"
              ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
              : "border-border/50 bg-card hover:bg-emerald-500/5"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <IconCheck className="size-3" /> Listos
          </span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {parseResult.validCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("warning")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === "warning"
              ? "border-amber-500 bg-amber-500/10 shadow-xs"
              : "border-border/50 bg-card hover:bg-amber-500/5"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <IconAlertTriangle className="size-3" /> Avisos
          </span>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {parseResult.warningCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("error")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            filter === "error"
              ? "border-rose-500 bg-rose-500/10 shadow-xs"
              : "border-border/50 bg-card hover:bg-rose-500/5"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <IconX className="size-3" /> Con Errores
          </span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
            {parseResult.errorCount}
          </p>
        </button>
      </div>

      {/* ── 2. Selector de Sección por Defecto (Fallback) ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border/50">
        <div className="flex items-center gap-2">
          <IconSchool className="size-4 text-primary shrink-0" />
          <span className="text-xs font-semibold text-foreground">
            Aula / Sección por Defecto:
          </span>
        </div>
        <Select
          value={defaultSectionId}
          onValueChange={onDefaultSectionChange}
        >
          <SelectTrigger className="w-full sm:w-64 h-8 text-xs font-medium bg-background rounded-xl">
            <SelectValue placeholder="Sin aula asignada" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="none" className="text-xs">
              Sin aula asignada (Solo crear expediente)
            </SelectItem>
            {nivelesAcademicos.map((s: any) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.grado?.nivel?.nombre} — {s.grado?.nombre} &quot;{s.seccion}&quot;
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── 3. Tabla Interactiva de Previsualización ── */}
      <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
        <ScrollArea className="h-[280px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/70 sticky top-0 z-10 border-b border-border/60 text-[10px] font-bold uppercase text-muted-foreground">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">Fila</th>
                <th className="py-2.5 px-3 w-24">Estado</th>
                <th className="py-2.5 px-3">DNI</th>
                <th className="py-2.5 px-3">Estudiante</th>
                <th className="py-2.5 px-3">Nivel / Grado</th>
                <th className="py-2.5 px-3">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredRows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={`hover:bg-muted/30 transition-colors ${
                    row.status === "error"
                      ? "bg-rose-500/5"
                      : row.status === "warning"
                        ? "bg-amber-500/5"
                        : ""
                  }`}
                >
                  <td className="py-2 px-3 text-center text-muted-foreground font-mono text-[11px]">
                    {row.rowNumber}
                  </td>
                  <td className="py-2 px-3">
                    {row.status === "valid" && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-none text-[10px] font-bold px-1.5 py-0.5">
                        Válido
                      </Badge>
                    )}
                    {row.status === "warning" && (
                      <Badge className="bg-amber-500/15 text-amber-600 border-none text-[10px] font-bold px-1.5 py-0.5">
                        Aviso
                      </Badge>
                    )}
                    {row.status === "error" && (
                      <Badge className="bg-rose-500/15 text-rose-600 border-none text-[10px] font-bold px-1.5 py-0.5">
                        Error
                      </Badge>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono font-medium">
                    {row.dni || "-"}
                  </td>
                  <td className="py-2 px-3 font-semibold text-foreground">
                    {row.apellidoPaterno} {row.apellidoMaterno}, {row.nombres}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    {row.nivel || row.grado ? (
                      `${row.nivel || ""} ${row.grado || ""} ${row.seccion || ""}`.trim()
                    ) : (
                      <span className="italic text-muted-foreground/60">
                        Defecto
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {row.messages.length > 0 ? (
                      <span
                        className={`text-[11px] font-medium ${
                          row.status === "error"
                            ? "text-rose-600"
                            : "text-amber-600"
                        }`}
                      >
                        {row.messages.join(" • ")}
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[11px]">
                        Listo para registrar
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>
  );
}
