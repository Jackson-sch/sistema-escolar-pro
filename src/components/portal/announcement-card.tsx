"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBulb,
  IconCalendar,
  IconPin,
  IconAlertTriangle,
  IconClock,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AnnouncementCardProps {
  anuncio: {
    id: string;
    titulo: string;
    contenido: string;
    fechaPublicacion: string;
    importante: boolean;
    urgente: boolean;
    fijado: boolean;
    autor: { name: string; apellidoPaterno: string; image?: string };
  };
}

export function AnnouncementCard({ anuncio }: AnnouncementCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 border-border/50 bg-card/50",
        anuncio.urgente && "border-destructive/30 bg-destructive/5",
        anuncio.importante && "border-warning/30 bg-warning/5",
      )}
    >
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                {anuncio.fijado && (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-2 py-0"
                  >
                    <IconPin className="size-2.5 mr-1" /> Fijado
                  </Badge>
                )}
                {anuncio.urgente && (
                  <Badge
                    variant="outline"
                    className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-black uppercase px-2 py-0"
                  >
                    <IconAlertTriangle className="size-2.5 mr-1" /> Urgente
                  </Badge>
                )}
                {anuncio.importante && (
                  <Badge
                    variant="outline"
                    className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase px-2 py-0"
                  >
                    <IconBulb className="size-2.5 mr-1" /> Importante
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                {anuncio.titulo}
              </h3>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                <IconClock className="size-3" />
                {format(new Date(anuncio.fechaPublicacion), "dd MMM, yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </div>

          <div
            className="text-sm text-balance text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500"
            dangerouslySetInnerHTML={{ __html: anuncio.contenido }}
          />

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {anuncio.autor?.name?.[0] || "A"}
              </div>
              <div>
                <p className="text-xs font-bold leading-none capitalize">
                  {anuncio.autor?.name?.toLowerCase() || "Admin"}{" "}
                  {anuncio.autor?.apellidoPaterno?.toLowerCase() || ""}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Autor institucional
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] font-medium border-border/50 opacity-60"
            >
              ID: {anuncio.id.slice(-6)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
