import {
  IconBulb,
  IconCalendarEvent,
  IconBuildingCommunity,
  IconArrowRight,
  IconPin,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formats";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { Badge } from "@/components/ui/badge";

interface AnnouncementCardProps {
  anuncio: {
    id: string;
    titulo: string;
    contenido: string;
    fechaPublicacion: string;
    importante: boolean;
    urgente: boolean;
    fijado: boolean;
    imagen?: string | null;
    categoria?: string;
    autor: { name: string; apellidoPaterno: string; image?: string };
  };
  variant?: "pinned" | "standard";
}

export function AnnouncementCard({
  anuncio,
  variant = "standard",
}: AnnouncementCardProps) {
  const isPinned = variant === "pinned" || anuncio.fijado;

  if (isPinned) {
    return (
      <div className="group relative bg-card/80 border border-amber-500/30 rounded-2xl overflow-hidden shadow-md flex flex-col transition-shadow hover:shadow-xl">
        <div className="aspect-16/7 w-full overflow-hidden relative bg-muted/20">
          {anuncio.imagen ? (
            <Image
              src={anuncio.imagen}
              alt={anuncio.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-amber-500/10 via-indigo-500/5 to-muted/40">
              <IconBulb className="size-16 text-amber-500/30" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border-none">
              <IconPin className="size-3 fill-white" />
              Aviso Fijado
            </Badge>
            {anuncio.categoria && (
              <Badge variant="outline" className="bg-background/80 text-foreground font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-md border-border/40">
                {anuncio.categoria}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-5 md:p-6 flex flex-col gap-3 relative z-10 bg-card/90">
          <h3 className="text-xl font-bold text-foreground leading-snug">
            {anuncio.titulo}
          </h3>
          <div
            className="text-muted-foreground text-xs leading-relaxed max-w-3xl line-clamp-3 font-normal"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtmlContent(anuncio.contenido),
            }}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-2 border-t border-border/20">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <IconCalendarEvent className="text-indigo-500 size-4 shrink-0" />
                <span>{formatDate(anuncio.fechaPublicacion, "dd MMM yyyy • h:mm a")}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 font-medium">
                <IconBuildingCommunity className="text-indigo-500 size-4 shrink-0" />
                <span>Comunicado Oficial</span>
              </div>
            </div>
            <Link
              href={`/portal/comunicaciones/${anuncio.id}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors text-center inline-flex items-center gap-1.5"
            >
              <span>Leer Comunicado</span>
              <IconArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Card
  return (
    <div className="bg-card/80 rounded-2xl overflow-hidden shadow-xs border border-border/40 flex flex-col group h-full transition-[background-color,box-shadow,transform] hover:bg-card hover:shadow-md hover:-translate-y-0.5">
      <div className="aspect-16/10 w-full overflow-hidden relative bg-muted/20">
        {anuncio.imagen ? (
          <Image
            src={anuncio.imagen}
            alt={anuncio.titulo}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500/5 to-muted/40">
            <IconBulb className="size-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
            {anuncio.categoria || (anuncio.urgente ? "Urgente" : "Académico")}
          </Badge>
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatDate(anuncio.fechaPublicacion, "MMM d")}
          </span>
        </div>

        <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2">{anuncio.titulo}</h4>

        <div
          className="text-muted-foreground text-xs line-clamp-2 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: sanitizeHtmlContent(anuncio.contenido),
          }}
        />

        <div className="mt-auto pt-3 border-t border-border/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {anuncio.autor?.image ? (
              <div className="size-6 rounded-full border border-border/40 overflow-hidden shrink-0">
                <Image
                  src={anuncio.autor.image}
                  alt="autor"
                  width={24}
                  height={24}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-6 rounded-full border border-border/40 bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground uppercase shrink-0">
                {anuncio.autor?.name?.[0] || "A"}
              </div>
            )}
            <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
              {anuncio.autor?.name || "Dirección"}
            </span>
          </div>

          <Link
            href={`/portal/comunicaciones/${anuncio.id}`}
            className="text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1 hover:underline transition-colors"
          >
            Ver Detalle <IconArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
