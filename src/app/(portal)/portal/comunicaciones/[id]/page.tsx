import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAnuncioByIdAction } from "@/actions/communications";
import { formatDate } from "@/lib/formats";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconBuildingCommunity,
  IconPin,
  IconBulb,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Detalle del Comunicado | Portal de Familia",
  description: "Consulta de notificación oficial y aviso institucional.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalAnuncioDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const res = await getAnuncioByIdAction({ id });

  if (res.error || !res.success) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl h-9 px-3 border-border/40 font-semibold text-xs gap-1.5"
          >
            <Link href="/portal/comunicaciones">
              <IconArrowLeft className="size-4" />
              <span>Volver a Comunicaciones</span>
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
          <IconBulb className="mx-auto size-14 text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Comunicado No Encontrado
          </h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
            El comunicado seleccionado ya no se encuentra disponible o fue retirado de la cartelera oficial.
          </p>
        </Card>
      </div>
    );
  }

  const anuncio = res.success;

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER DE NAVEGACIÓN Y TÍTULO ── */}
      <div className="flex flex-col gap-4 px-2">
        <div className="flex items-center justify-between gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl h-9 px-3.5 border-border/40 font-semibold text-xs gap-2 cursor-pointer"
          >
            <Link href="/portal/comunicaciones">
              <IconArrowLeft className="size-4" />
              <span>Volver a Comunicaciones</span>
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {anuncio.fijado && (
              <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs border-none">
                <IconPin className="size-3 fill-white" />
                Fijado
              </Badge>
            )}
            {anuncio.urgente && (
              <Badge variant="destructive" className="font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                Urgente
              </Badge>
            )}
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
              {(anuncio as any).categoria || anuncio.dirigidoA || "Comunicado Oficial"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {anuncio.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5 font-medium">
              <IconCalendarEvent className="size-4 text-indigo-500" />
              <span>{formatDate(anuncio.fechaPublicacion, "EEEE, dd MMMM yyyy • h:mm a")}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <IconBuildingCommunity className="size-4 text-indigo-500" />
              <span>Emisión Institucional</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUERPO DEL COMUNICADO ── */}
      <div className="px-1">
        <div className="rounded-2xl border border-border/40 bg-card/80 shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
          {/* Imagen destacada */}
          {anuncio.imagen && (
            <div className="relative w-full aspect-16/8 md:aspect-21/9 rounded-xl overflow-hidden bg-muted/20 border border-border/30">
              <Image
                src={anuncio.imagen}
                alt={anuncio.titulo}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Contenido HTML formateado */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-base leading-relaxed space-y-4 font-normal"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtmlContent(anuncio.contenido),
            }}
          />

          {/* Tarjeta del Autor / Firmante */}
          <div className="pt-6 border-t border-border/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {anuncio.autor?.image ? (
                <div className="size-10 rounded-full border border-border/40 overflow-hidden shrink-0">
                  <Image
                    src={anuncio.autor.image}
                    alt={anuncio.autor.name || "Autor"}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-10 rounded-full border border-border/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {anuncio.autor?.name?.[0] || "A"}
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-foreground">
                  {anuncio.autor?.name} {anuncio.autor?.apellidoPaterno || ""}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">
                  {anuncio.autor?.role === "super_admin" || anuncio.autor?.role === "administrativo"
                    ? "Dirección General / Secretaría Académica"
                    : "Docente del Colegio"}
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl h-9 px-4 font-semibold text-xs border-border/40 shrink-0"
            >
              <Link href="/portal/comunicaciones">
                Cerrar Detalle
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
