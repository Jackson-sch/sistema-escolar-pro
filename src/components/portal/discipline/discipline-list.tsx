"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendar,
  IconUser,
  IconFileText,
  IconNotes,
  IconChecklist,
  IconMessageCircle,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DisciplineRecord {
  id: string;
  fecha: Date;
  motivo?: string | null;
  descripcion: string;
  recomendaciones?: string | null;
  categoria: {
    nombre: string;
  };
  especialista: {
    name: string | null;
    apellidoPaterno: string | null;
  };
}

interface DisciplineListProps {
  records: DisciplineRecord[];
}

export function DisciplineList({ records }: DisciplineListProps) {
  if (records.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
          <IconChecklist className="size-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-bold">Sin registros compartidos</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
          No se han publicado registros psicopedagógicos o de conducta para el
          periodo seleccionado.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <Card
          key={record.id}
          className="overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm transition-colors hover:border-primary/30"
        >
          <div className="flex flex-col md:flex-row">
            {/* Left side: Date & Category */}
            <div className="flex flex-col justify-between border-b border-border/50 bg-muted/20 p-5 md:w-60 md:border-r md:border-b-0">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                >
                  {record.categoria.nombre}
                </Badge>
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <IconCalendar className="size-4" />
                    <span className="text-sm font-semibold">
                      {format(new Date(record.fecha), "PPP", { locale: es })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {format(new Date(record.fecha), "EEEE", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconUser className="size-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/70">
                    Registrado por
                  </p>
                  <p className="text-xs font-semibold capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                    {(record.especialista.name || "").toLowerCase()}{" "}
                    {(record.especialista.apellidoPaterno || "").toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Content */}
            <div className="flex-1 space-y-5 p-5">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <IconMessageCircle className="size-5 text-primary mt-1 shrink-0" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {record.motivo || "Registro de Seguimiento"}
                  </h3>
                </div>
                <div className="ml-8 rounded-xl border border-border/50 bg-muted/20 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {record.descripcion}
                  </p>
                </div>
              </div>

              {record.recomendaciones && (
                <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <IconFileText className="size-4" />
                    <h4 className="text-xs font-semibold">
                      Recomendaciones y Acuerdos
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground/90 italic pl-6 border-l-2 border-emerald-500/20">
                    &quot;{record.recomendaciones}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
