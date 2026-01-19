"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconPin, IconAlertTriangle, IconClock, IconEye } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { EditAnnouncementButton } from "./edit-announcement-button"
import { ViewAnnouncementDialog } from "./view-announcement-dialog"
import { useState } from "react"
import { formatDate } from "@/lib/formats"
import Image from "next/image"

interface AnnouncementCardProps {
  anuncio: any
}

export function AnnouncementCard({ anuncio }: AnnouncementCardProps) {
  const [showDetail, setShowDetail] = useState(false)
  const isImportant = anuncio.importante || anuncio.urgente

  return (
    <>
      <Card
        onClick={() => setShowDetail(true)}
        className={cn(
          "overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-violet-500/10 border-border/40 bg-background/95 backdrop-blur-xl group relative h-full flex flex-col cursor-pointer hover:border-violet-500/30",
          anuncio.fijado && "border-violet-500/30 shadow-violet-500/5",
          isImportant && "border-amber-500/30 shadow-amber-500/5"
        )}
      >
        {anuncio.imagen && (
          <div className="aspect-video w-full overflow-hidden relative">
            <Image
              src={anuncio.imagen}
              alt={anuncio.titulo}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:rotate-1"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-40" />

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10" onClick={(e) => e.stopPropagation()}>
              <div className="bg-background/80 backdrop-blur-md rounded-full p-0.5 border border-white/10 shadow-lg">
                <EditAnnouncementButton anuncio={anuncio} />
              </div>
            </div>
          </div>
        )}

        {!anuncio.imagen && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10" onClick={(e) => e.stopPropagation()}>
            <EditAnnouncementButton anuncio={anuncio} />
          </div>
        )}

        <CardHeader className="p-5 pb-2 space-y-3 relative">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1.5 items-center flex-wrap">
              {anuncio.fijado && (
                <Badge variant="outline" className="bg-violet-500/15 text-violet-400 border-violet-500/20 text-[9px] font-black uppercase tracking-[0.1em] h-5 shadow-sm">
                  <IconPin className="size-3 mr-1 fill-current" /> Fijado
                </Badge>
              )}
              {anuncio.urgente && (
                <Badge variant="outline" className="bg-red-500/15 text-red-400 border-red-500/20 text-[9px] font-black uppercase tracking-[0.1em] h-5 shadow-sm">
                  <IconAlertTriangle className="size-3 mr-1 fill-current" /> Urgente
                </Badge>
              )}
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest h-5 border-border/40 text-muted-foreground/60 bg-muted/5">
                {anuncio.dirigidoA}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/60 font-bold flex items-center gap-1.5 bg-muted/5 px-2 py-0.5 rounded-full border border-border/20">
                <IconClock className="size-3" /> {formatDate(anuncio.fechaPublicacion, "dd MMM")}
              </span>
            </div>
          </div>
          <h3 className="text-base font-black leading-tight group-hover:text-violet-400 transition-all duration-300 line-clamp-2 uppercase tracking-tight">
            {anuncio.titulo}
          </h3>
        </CardHeader>

        <CardContent className="p-5 pt-0 flex-1">
          <p className="text-[13px] text-muted-foreground/70 leading-relaxed line-clamp-3 font-medium">
            {anuncio.resumen || anuncio.contenido.substring(0, 150) + "..."}
          </p>
        </CardContent>

        <CardFooter className="p-5 pt-0 border-t border-border/5 bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-3 pt-4">
            <div className="relative">
              <Avatar className="size-7 border-2 border-background shadow-xl">
                <AvatarImage src={anuncio.autor?.image} />
                <AvatarFallback className="text-[10px] bg-violet-600 text-white font-bold">
                  {anuncio.autor?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-emerald-500 border-2 border-background rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-foreground tracking-tight uppercase">
                {anuncio.autor?.name} {anuncio.autor?.apellidoPaterno}
              </span>
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">ADMINISTRACIÓN</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-4 text-[10px] font-black text-muted-foreground/40 group-hover:text-violet-500/50 transition-colors">
            <IconEye className="size-3.5" /> {anuncio.vistas}
          </div>
        </CardFooter>
      </Card>

      <ViewAnnouncementDialog
        anuncio={anuncio}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  )
}
