import {
  getAnunciosAction,
  getEventosAction,
} from "@/actions/communications";
import { AddAnnouncementButton } from "@/components/comunicaciones/anuncios/add-announcement-button";
import { AddEventButton } from "@/components/comunicaciones/eventos/add-event-button";
import { ComunicacionesView } from "@/components/comunicaciones/comunicaciones-view";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { IconSpeakerphone } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function ComunicacionesPage() {
  const session = await auth();
  const isProfessor = session?.user?.role === "profesor";
  const profesorId = session?.user?.id;

  const [{ success: anuncios = [] }, { success: eventos = [] }] =
    await Promise.all([getAnunciosAction(), getEventosAction()]);

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSpeakerphone size={14} />
            Canal Oficial
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Portal de Comunicaciones
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Mantén a la comunidad educativa informada con comunicados oficiales, avisos urgentes y calendario de eventos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddEventButton />
          <AddAnnouncementButton
            isProfessor={isProfessor}
            profesorId={profesorId}
          />
        </div>
      </div>

      <ComunicacionesView anuncios={anuncios as any} eventos={eventos as any} />
    </div>
  );
}
