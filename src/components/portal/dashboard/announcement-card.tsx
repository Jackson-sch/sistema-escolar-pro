import {
  IconBulb,
  IconCalendarEvent,
  IconBuildingCommunity,
  IconArrowRight,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/formats";

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
      <div className="group relative bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl flex flex-col">
        <div className="aspect-16/7 w-full overflow-hidden relative bg-muted/20">
          {anuncio.imagen ? (
            <Image
              src={anuncio.imagen}
              alt={anuncio.titulo}
              fill
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
              <IconBulb className="size-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute top-6 left-6 flex gap-2 z-10">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Aviso Importante
            </span>
            {anuncio.categoria && (
              <span className="bg-black/30 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                {anuncio.categoria}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-4 relative z-10 bg-card">
          <h3 className="text-xl font-bold text-foreground">
            {anuncio.titulo}
          </h3>
          <div
            className="text-muted-foreground text-sm leading-relaxed max-w-3xl font-medium"
            dangerouslySetInnerHTML={{ __html: anuncio.contenido }}
          />

          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 mt-4 border-t border-border/60">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground text-xs capitalize font-medium">
                <IconCalendarEvent className="text-primary size-5" />
                {formatDate(anuncio.fechaPublicacion, "EEEE, dd MMMM • h:mm a")}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <IconBuildingCommunity className="text-primary size-5" />
                Comunicado Oficial
              </div>
            </div>
            <Link
              href={`/portal/comunicaciones/${anuncio.id}`}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all text-center"
            >
              Leer Más
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Bento Card
  return (
    <div className="bg-card rounded-[2rem] overflow-hidden shadow-lg border border-border flex flex-col group h-full">
      <div className="aspect-16/10 w-full overflow-hidden relative bg-muted/20">
        {anuncio.imagen ? (
          <Image
            src={anuncio.imagen}
            alt={anuncio.titulo}
            fill
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 to-muted/50">
            <IconBulb className="size-12 text-muted-foreground/20" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
            {anuncio.categoria || (anuncio.urgente ? "Urgente" : "Académico")}
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {formatDate(anuncio.fechaPublicacion, "MMM d")}
          </span>
        </div>

        <h4 className="text-xl font-bold text-foreground">{anuncio.titulo}</h4>

        <div
          className="text-muted-foreground text-sm line-clamp-2 font-medium"
          dangerouslySetInnerHTML={{ __html: anuncio.contenido }}
        />

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {anuncio.autor?.image ? (
              <div className="size-7 rounded-full border-2 border-background bg-slate-300 overflow-hidden">
                <Image
                  src={anuncio.autor.image}
                  alt="autor"
                  width={28}
                  height={28}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="size-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                {anuncio.autor?.name?.[0]}
              </div>
            )}
          </div>
          <Link
            href={`/portal/comunicaciones/${anuncio.id}`}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline group-hover:gap-2 transition-all"
          >
            Leer Más <IconArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
