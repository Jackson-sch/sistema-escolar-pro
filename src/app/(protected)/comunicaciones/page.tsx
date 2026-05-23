import {
  getAnunciosAction,
  getEventosAction,
} from "@/actions/communications";
import { AddAnnouncementButton } from "@/components/comunicaciones/anuncios/add-announcement-button";
import { AddEventButton } from "@/components/comunicaciones/eventos/add-event-button";
import { ComunicacionesView } from "@/components/comunicaciones/comunicaciones-view";

import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ComunicacionesPage() {
  const session = await auth();
  const isProfessor = session?.user?.role === "profesor";
  const profesorId = session?.user?.id;

  const [{ success: anuncios = [] }, { success: eventos = [] }] =
    await Promise.all([getAnunciosAction(), getEventosAction()]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">
            Portal de Comunicaciones
          </h1>
          <p className="text-xxs sm:text-sm text-muted-foreground font-medium">
            Mantén a la comunidad educativa informada con anuncios y eventos.
          </p>
        </div>
        <div className="flex gap-2">
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
