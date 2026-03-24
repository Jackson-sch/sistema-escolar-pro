import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconClock,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";

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
  variant?: "full" | "compact";
}

export function EventCard({ evento, variant = "full" }: EventCardProps) {
  const date = new Date(evento.fechaInicio);

  if (variant === "compact") {
    return (
      <div className="group flex items-center gap-5 p-3 rounded-2xl transition-all duration-300 hover:bg-white/5 cursor-pointer">
        <div className="relative shrink-0 flex flex-col items-center justify-center size-14 rounded-xl bg-muted/20 border border-border/10 group-hover:border-primary/40 transition-colors">
          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors">
            {formatDate(date, "MMM")}
          </span>
          <span className="text-xl font-black tabular-nums tracking-tighter text-foreground">
            {formatDate(date, "dd")}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm font-black tracking-tight text-foreground/90 transition-colors line-clamp-1">
            {evento.titulo}
          </h4>
          <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            {evento.horaInicio && (
              <span className="flex items-center gap-1">
                {evento.horaInicio}
              </span>
            )}
            {evento.ubicacion && (
              <span className="flex items-center gap-1 truncate max-w-[120px]">
                • {evento.ubicacion}
              </span>
            )}
            {!evento.horaInicio && !evento.ubicacion && (
              <span>Todo el día</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 border-border/40 bg-card/40 backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* Enhanced Date Block */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center justify-center size-20 rounded-2xl bg-gradient-to-br from-background/50 to-muted/20 border border-border/40 shadow-sm group-hover:border-primary/50 transition-all duration-500">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 group-hover:text-primary transition-colors">
                {formatDate(date, "MMM")}
              </span>
              <span className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
                {formatDate(date, "dd")}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none px-2 py-0.5"
                >
                  {evento.tipo}
                </Badge>
                <div className="h-px flex-1 bg-border/20" />
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight text-foreground transition-colors duration-300">
                {evento.titulo}
              </h3>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {evento.horaInicio && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wide">
                  <IconClock className="size-3.5 text-primary/70" />
                  {evento.horaInicio}
                </div>
              )}
              {evento.ubicacion && (
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/60 font-bold uppercase tracking-wide">
                  <IconMapPin className="size-3.5 text-primary/70" />
                  <span className="max-w-[200px] truncate">
                    {evento.ubicacion}
                  </span>
                </div>
              )}
            </div>

            {evento.descripcion && (
              <p className="text-sm text-muted-foreground/70 leading-relaxed line-clamp-2 font-medium">
                {evento.descripcion}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
