import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconPin,
  IconAlertTriangle,
  IconEye,
  IconCalendar,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";
import Image from "next/image";
import { FormModal } from "@/components/modals/form-modal";

interface ViewAnnouncementDialogProps {
  anuncio: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAnnouncementDialog({
  anuncio,
  open,
  onOpenChange,
}: ViewAnnouncementDialogProps) {
  if (!anuncio) return null;

  return (
    <FormModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title={anuncio.titulo}
      description={anuncio.resumen}
      className="sm:max-w-[700px]"
    >
      <div className="space-y-6">
        {anuncio.imagen && (
          <div className="w-full aspect-video relative overflow-hidden rounded-2xl border border-border/40 shadow-lg">
            <Image
              src={anuncio.imagen}
              alt={anuncio.titulo}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2 items-center flex-wrap">
              {anuncio.fijado && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                  <IconPin className="size-3.5 mr-1.5" /> Fijado
                </Badge>
              )}
              {anuncio.urgente && (
                <Badge
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                >
                  <IconAlertTriangle className="size-3.5 mr-1.5" /> Urgente
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] font-bold px-3 py-1 uppercase tracking-widest border-border/40 text-muted-foreground/60"
              >
                Dirigido a: {anuncio.dirigidoA}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <IconCalendar className="size-3.5 text-primary/60" />{" "}
                {formatDate(anuncio.fechaPublicacion, "dd 'de' MMMM, yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <IconEye className="size-3.5 text-primary/60" />{" "}
                {anuncio.vistas}
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-md text-foreground/90 font-medium leading-relaxed bg-muted/20 p-5 rounded-2xl border border-border/10 italic">
              {anuncio.resumen}
            </p>

            <div className="mt-8 text-sm text-foreground/80 text-pretty leading-relaxed font-normal">
              {anuncio.contenido}
            </div>
          </div>

          <div className="pt-6 border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-11 border-2 border-primary/20 shadow-md">
                <AvatarImage src={anuncio.autor?.image} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                  {anuncio.autor?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-wider text-foreground">
                  {anuncio.autor?.name} {anuncio.autor?.apellidoPaterno}
                </span>
                <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest leading-none mt-1">
                  Autor de la publicación
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
