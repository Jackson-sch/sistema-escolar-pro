"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconPin,
  IconAlertTriangle,
  IconClock,
  IconEye,
  IconPlus,
} from "@tabler/icons-react";
import { EditAnnouncementButton } from "./edit-announcement-button";
import { ViewAnnouncementDialog } from "./view-announcement-dialog";
import { useState } from "react";
import { formatDate } from "@/lib/formats";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { useTheme } from "next-themes";

interface AnnouncementCardProps {
  anuncio?: any;
  isCreateCard?: boolean;
  onCreateClick?: () => void;
}

export function AnnouncementCard({
  anuncio,
  isCreateCard,
  onCreateClick,
}: AnnouncementCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { theme } = useTheme();

  if (isCreateCard) {
    return (
      <article className="group relative bg-muted/10 dark:bg-card/40 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-muted flex items-center justify-center mb-4 transition-all group-hover:scale-110">
          <IconPlus className="size-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold font-display text-muted-foreground dark:text-muted-foreground">
          Crear Nuevo Anuncio
        </h3>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-2 max-w-[200px]">
          Comparte noticias importantes con tu comunidad hoy.
        </p>
        <Button
          onClick={onCreateClick}
          className="mt-6 px-6 py-2 rounded-full text-sm"
        >
          Empezar
        </Button>
      </article>
    );
  }

  const isImportant = anuncio.urgente || anuncio.importante;
  // Precise check for image existence
  const hasImage =
    typeof anuncio.imagen === "string" &&
    anuncio.imagen.trim().length > 0 &&
    anuncio.imagen !== "null";

  return (
    <>
      <article onClick={() => setShowDetail(true)}>
        <MagicCard className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm transition-all hover:-translate-y-1 cursor-pointer flex flex-col h-full">
          <div className="relative h-56 overflow-hidden bg-zinc-100 dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-primary">
            {hasImage ? (
              <>
                <Image
                  src={anuncio.imagen}
                  alt={anuncio.titulo}
                  fill
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out bg-zinc-800"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent pointer-events-none z-10" />
              </>
            ) : (
              <div className="w-full h-full p-5 font-mono text-[11px] text-zinc-400 leading-tight bg-zinc-900/50">
                <div className="flex gap-1.5 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60 shadow-sm shadow-destructive/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/60 shadow-sm shadow-warning/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-success/60 shadow-sm shadow-success/20"></div>
                </div>
                <p className="opacity-90">
                  <span className="text-violet-400 font-bold">import</span>{" "}
                  &#123; <span className="text-sky-300">Vacaciones</span> &#125;{" "}
                  <span className="text-violet-400">from</span>{" "}
                  <span className="text-emerald-400">'school-api'</span>;
                </p>
                <p className="mt-1.5 text-zinc-500 italic">
                  // Protocolo de actualización trimestral
                </p>
                <p className="mt-1">
                  <span className="text-violet-400 font-bold">const</span>{" "}
                  <span className="text-amber-200">config</span> = &#123;
                </p>
                <p className="pl-4">
                  version: <span className="text-emerald-400">'2.0.4'</span>,
                </p>
                <p className="pl-4">
                  status: <span className="text-emerald-400">'STABLE'</span>,
                </p>
                <p className="pl-4">
                  priority: <span className="text-rose-400">true</span>
                </p>
                <p>&#125;;</p>
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none z-10" />
              </div>
            )}

            {/* Overlay Content */}
            <div className="absolute inset-0 p-4 z-20 flex flex-col justify-end pointer-events-none">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex gap-2">
                  {anuncio.fijado && (
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary text-white shadow-lg flex items-center gap-1.5 border border-primary/20">
                      <IconPin className="size-3" /> FIJADO
                    </span>
                  )}
                  {isImportant && (
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-destructive text-white shadow-lg flex items-center gap-1.5 border border-destructive/20">
                      <IconAlertTriangle className="size-3" /> URGENTE
                    </span>
                  )}
                </div>
                <span className="text-white text-[10px] font-bold flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                  <IconClock className="size-3 text-info" />{" "}
                  {formatDate(anuncio.fechaPublicacion, "dd MMM")}
                </span>
              </div>
            </div>

            <div
              className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 focus-within:opacity-100 focus-within:scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <EditAnnouncementButton anuncio={anuncio} />
            </div>
          </div>

          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">
                {anuncio.dirigidoA || "TODOS"}
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <h3 className="text-xl font-bold font-display text-foreground mb-3 transition-colors line-clamp-2">
              {anuncio.titulo}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2">
              {anuncio.resumen || anuncio.contenido.substring(0, 150) + "..."}
            </p>

            <div className="mt-auto pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-md">
                    <AvatarImage src={anuncio.autor?.image} />
                    <AvatarFallback className="bg-primary text-white text-[10px] font-bold">
                      {anuncio.autor?.name?.[0]?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-[3px] border-background rounded-full shadow-sm" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-foreground leading-none">
                    {(anuncio.autor?.name || "SISTEMA").toUpperCase()}{" "}
                    {(anuncio.autor?.apellidoPaterno || "").toUpperCase()}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1.5">
                    {anuncio.categoria || "ADMINISTRACIÓN"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold tabular-nums opacity-60">
                <IconEye className="size-4" />
                <span>{(anuncio.vistas || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </MagicCard>
      </article>

      <ViewAnnouncementDialog
        anuncio={anuncio}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
