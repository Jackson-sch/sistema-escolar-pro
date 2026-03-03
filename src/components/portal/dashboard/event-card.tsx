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
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Accent Indicator */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-500" />

      <CardContent className="p-6 relative z-10">
        <div className="flex gap-6 items-center">
          {/* Enhanced Date Block */}
          <div className="relative group/date shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/date:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-background to-muted/30 border border-border/50 shadow-sm group-hover/date:border-primary/30 transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 group-hover/date:text-primary transition-colors">
                {format(date, "MMM", { locale: es })}
              </span>
              <span className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
                {format(date, "dd")}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 px-2 py-0.5"
                >
                  {evento.tipo}
                </Badge>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight text-foreground group-hover:text-primary transition-colors duration-300">
                {evento.titulo}
              </h3>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {evento.horaInicio && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold uppercase tracking-wide">
                  <div className="size-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <IconClock className="size-3.5 text-primary" />
                  </div>
                  {evento.horaInicio}
                </div>
              )}
              {evento.ubicacion && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold uppercase tracking-wide">
                  <div className="size-6 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <IconMapPin className="size-3.5 text-primary" />
                  </div>
                  <span className="max-w-[200px] truncate">
                    {evento.ubicacion}
                  </span>
                </div>
              )}
            </div>

            {evento.descripcion && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 italic opacity-80">
                {evento.descripcion}
              </p>
            )}
          </div>

          {/* Action Indicator */}
          <div className="hidden @md:flex items-center pl-4 border-l border-border/40">
            <div className="size-11 rounded-full border border-border/60 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:scale-110 group-hover:rotate-[-45deg] shadow-sm">
              <IconArrowRight className="size-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
