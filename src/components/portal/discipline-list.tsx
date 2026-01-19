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
      <Card className="border-dashed p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
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
    <div className="space-y-6">
      {records.map((record, index) => (
        <Card
          key={record.id}
          className="overflow-hidden border-border/40 bg-card/50 transition-all hover:shadow-lg hover:shadow-primary/5 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left side: Date & Category */}
            <div className="md:w-64 bg-muted/20 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/40">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black tracking-widest px-3 py-1"
                >
                  {record.categoria.nombre}
                </Badge>
                <div>
                  <div className="flex items-center gap-2 text-primary">
                    <IconCalendar className="size-4" />
                    <span className="text-sm font-bold uppercase tracking-tighter">
                      {format(new Date(record.fecha), "PPP", { locale: es })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {format(new Date(record.fecha), "EEEE", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
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
            <div className="flex-1 p-6 space-y-6 bg-card/30">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <IconMessageCircle className="size-5 text-primary mt-1 shrink-0" />
                  <h3 className="text-xl font-bold tracking-tight text-foreground/90">
                    {record.motivo || "Registro de Seguimiento"}
                  </h3>
                </div>
                <div className="ml-8 p-4 bg-background/50 rounded-2xl border border-border/20">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {record.descripcion}
                  </p>
                </div>
              </div>

              {record.recomendaciones && (
                <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <IconFileText className="size-4" />
                    <h4 className="text-xs font-black uppercase tracking-widest">
                      Recomendaciones y Acuerdos
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground/90 italic pl-6 border-l-2 border-emerald-500/20">
                    "{record.recomendaciones}"
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
