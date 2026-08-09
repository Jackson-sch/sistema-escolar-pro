"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  IconPin,
  IconAlertTriangle,
  IconEye,
  IconCalendar,
  IconTrash,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";
import Image from "next/image";
import { FormModal } from "@/components/modals/form-modal";
import { useState } from "react";
import { deleteAnuncioAction } from "@/actions/communications";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/modals/confirm-modal";

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!anuncio) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteAnuncioAction({ id: anuncio.id });
      if (res.success) {
        toast.success(res.success);
        setShowConfirmDelete(false);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex gap-2 items-center flex-wrap">
                {anuncio.fijado && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <IconPin className="size-3.5 mr-1" /> Fijado
                  </Badge>
                )}
                {anuncio.urgente && (
                  <Badge
                    variant="outline"
                    className="bg-rose-500/10 text-rose-600 border-rose-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                  >
                    <IconAlertTriangle className="size-3.5 mr-1" /> Urgente
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium px-3 py-1 uppercase tracking-wider border-border/40 text-muted-foreground"
                >
                  Dirigido a: {anuncio.dirigidoA}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <IconCalendar className="size-3.5 text-indigo-500" />{" "}
                  {formatDate(anuncio.fechaPublicacion, "dd 'de' MMMM, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <IconEye className="size-3.5 text-indigo-500" />{" "}
                  {anuncio.vistas}
                </span>
              </div>
            </div>

            <div className="prose max-w-none dark:prose-invert">
              {anuncio.resumen && (
                <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/20 p-4 rounded-2xl border border-border/30 italic">
                  {anuncio.resumen}
                </p>
              )}

              <div className="mt-4 text-sm text-foreground/90 leading-relaxed font-normal whitespace-pre-wrap">
                {anuncio.contenido}
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border/40">
                  <AvatarImage src={anuncio.autor?.image} />
                  <AvatarFallback className="bg-indigo-600 text-white font-bold uppercase text-xs">
                    {anuncio.autor?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {anuncio.autor?.name} {anuncio.autor?.apellidoPaterno}
                  </span>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground mt-0.5">
                    {anuncio.autor?.role === "profesor"
                      ? "Docente"
                      : anuncio.autor?.role === "administrativo"
                        ? "Administración"
                        : "Autor"}
                  </span>
                </div>
              </div>

              {/* Botón de Eliminar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmDelete(true)}
                className="rounded-xl px-3.5 h-9 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <IconTrash className="size-3.5" />
                <span>Eliminar Anuncio</span>
              </Button>
            </div>
          </div>
        </div>
      </FormModal>

      {/* Modal de Confirmación Estilo Sistema (Con ShineBorder) */}
      <ConfirmModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        title="¿Eliminar anuncio institucional?"
        description={`Esta acción eliminará de forma permanente el anuncio "${anuncio.titulo}".`}
        loading={loading}
        variant="danger"
      />
    </>
  );
}
