import {
  IconMessage2,
  IconCalendar,
  IconSpeakerphone,
  IconPlus,
} from "@tabler/icons-react";
import { getAnunciosAction, getEventosAction } from "@/actions/communications";
import { AnnouncementList } from "@/components/comunicaciones/anuncios/announcement-list";
import { EventCalendar } from "@/components/comunicaciones/eventos/event-calendar";
import { AddAnnouncementButton } from "@/components/comunicaciones/anuncios/add-announcement-button";
import { AddEventButton } from "@/components/comunicaciones/eventos/add-event-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function ComunicacionesPage() {
  const [{ data: anuncios = [] }, { data: eventos = [] }] = await Promise.all([
    getAnunciosAction(),
    getEventosAction(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            Portal de Comunicaciones
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Mantén a la comunidad educativa informada con anuncios y eventos.
          </p>
        </div>
        <div className="flex gap-2">
          <AddEventButton />
          <AddAnnouncementButton />
        </div>
      </div>

      <Tabs defaultValue="anuncios" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-auto shadow-inner border border-border/40 mb-6 rounded-full">
          <TabsTrigger
            value="anuncios"
            className="px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 font-bold text-xs rounded-full"
          >
            <IconSpeakerphone className="size-4" /> Anuncios
          </TabsTrigger>
          <TabsTrigger
            value="eventos"
            className="px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 font-bold text-xs rounded-full"
          >
            <IconCalendar className="size-4" /> Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anuncios" className="mt-0 outline-none">
          <AnnouncementList initialAnuncios={anuncios as any} />
        </TabsContent>

        <TabsContent value="eventos" className="mt-0 outline-none">
          <EventCalendar initialEventos={eventos as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
