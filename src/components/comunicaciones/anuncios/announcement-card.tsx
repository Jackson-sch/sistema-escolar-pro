"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconPin,
  IconAlertTriangle,
  IconClock,
  IconEye,
  IconPlus,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { EditAnnouncementButton } from "./edit-announcement-button";
import { ViewAnnouncementDialog } from "./view-announcement-dialog";
import { useState } from "react";
import { formatDate } from "@/lib/formats";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";

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

  if (isCreateCard) {
    return (
      <article className="group relative bg-background/40 hover:bg-background/80 rounded-2xl overflow-hidden border-2 border-dashed border-border/50 flex flex-col items-center justify-center p-8 text-center min-h-[380px] transition-colors">
        <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 text-indigo-500">
          <IconPlus className="size-7" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          Crear Nuevo Anuncio
        </h3>
        <p className="text-muted-foreground text-xs mt-1.5 max-w-[200px]">
          Comparte noticias importantes con tu comunidad hoy.
        </p>
        <Button
          onClick={onCreateClick}
          className="mt-5 px-5 h-9 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
        >
          Empezar
        </Button>
      </article>
    );
  }

  const isImportant = anuncio.urgente || anuncio.importante;
  const hasImage =
    typeof anuncio.imagen === "string" &&
    anuncio.imagen.trim().length > 0 &&
    anuncio.imagen !== "null";

  return (
    <>
      <article className="h-full">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowDetail(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowDetail(true);
            }
          }}
          className="w-full text-left bg-transparent p-0 border-0 cursor-pointer flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
        >
          <MagicCard className="group relative bg-card rounded-2xl overflow-hidden border border-border/40 shadow-xs transition-transform hover:-translate-y-1 cursor-pointer flex flex-col h-full w-full">
          <div className="relative h-48 overflow-hidden bg-muted/20">
            {hasImage ? (
              <>
                <Image
                  src={anuncio.imagen}
                  alt={anuncio.titulo}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900/80 via-indigo-600/40 to-slate-900 p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                  <IconSpeakerphone className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                    {anuncio.categoria || "COMUNICADO OFICIAL"}
                  </span>
                  <p className="text-white text-xs font-bold truncate mt-0.5">
                    {anuncio.titulo}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
              </div>
            )}

            {/* Overlay Badges */}
            <div className="absolute inset-0 p-3 z-20 flex flex-col justify-end pointer-events-none">
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex gap-1.5">
                  {anuncio.fijado && (
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                      <IconPin className="size-3" /> FIJADO
                    </span>
                  )}
                  {isImportant && (
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs flex items-center gap-1">
                      <IconAlertTriangle className="size-3" /> URGENTE
                    </span>
                  )}
                </div>
                <span className="text-white text-[10px] font-medium flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-white/10">
                  <IconClock className="size-3 text-indigo-300" />{" "}
                  {formatDate(anuncio.fechaPublicacion, "dd MMM")}
                </span>
              </div>
            </div>

            <div
              className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <EditAnnouncementButton anuncio={anuncio} />
            </div>
          </div>

          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {anuncio.dirigidoA || "TODOS"}
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <h3 className="text-base font-bold text-foreground mb-2 leading-snug line-clamp-2">
              {anuncio.titulo}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">
              {anuncio.resumen || anuncio.contenido?.substring(0, 140) + "..."}
            </p>

            <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar className="size-8 border border-border/40">
                  <AvatarImage src={anuncio.autor?.image} />
                  <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                    {anuncio.autor?.name?.[0]?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold text-foreground leading-none capitalize">
                    {anuncio.autor?.name || "Sistema"}{" "}
                    {anuncio.autor?.apellidoPaterno || ""}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                    {anuncio.autor?.role === "profesor"
                      ? "Docente"
                      : anuncio.autor?.role === "administrativo"
                        ? "Administración"
                        : "Institucional"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs font-medium tabular-nums">
                <IconEye className="size-3.5" />
                <span>{(anuncio.vistas || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </MagicCard>
        </div>
      </article>

      <ViewAnnouncementDialog
        anuncio={anuncio}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
