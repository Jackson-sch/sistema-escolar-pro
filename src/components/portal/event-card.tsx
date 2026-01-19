"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconCalendarEvent,
  IconMapPin,
  IconClock,
  IconArrowRight,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventCardProps {
  evento: {
    id: string;
    titulo: string;
    descripcion: string | null;
    fechaInicio: string;
    horaInicio: string | null;
    ubicacion: string | null;
    tipo: string;
  };
}

export function EventCard({ evento }: EventCardProps) {
  const date = new Date(evento.fechaInicio);

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 border-border/50 bg-card/50">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40 group-hover:bg-primary transition-colors" />

      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Fecha destacada */}
          <div className="flex flex-col items-center justify-center size-20 rounded-2xl bg-muted/50 border border-border/50 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {format(date, "MMM", { locale: es })}
            </span>
            <span className="text-3xl font-black tabular-nums tracking-tighter">
              {format(date, "dd")}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <div className="space-y-1">
              <Badge
                variant="outline"
                className="text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border-primary/10"
              >
                {evento.tipo}
              </Badge>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                {evento.titulo}
              </h3>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {evento.horaInicio && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <IconClock className="size-3.5 text-primary" />
                  {evento.horaInicio}
                </div>
              )}
              {evento.ubicacion && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <IconMapPin className="size-3.5 text-primary" />
                  <span className="max-w-[150px] truncate">
                    {evento.ubicacion}
                  </span>
                </div>
              )}
            </div>

            {evento.descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {evento.descripcion}
              </p>
            )}
          </div>

          <div className="flex items-center">
            <div className="size-10 rounded-full border border-border/50 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white group-hover:border-primary">
              <IconArrowRight className="size-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
