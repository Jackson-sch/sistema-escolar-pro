import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPortalCommunicationsAction } from "@/actions/portal";
import { CommunicationsBanner } from "@/components/portal/communications-banner";
import { AnnouncementCard } from "@/components/portal/announcement-card";
import { EventCard } from "@/components/portal/event-card";
import { NotasFilter } from "@/components/portal/notas-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { IconMessage2Off, IconCalendarOff } from "@tabler/icons-react";

interface ComunicacionesPageProps {
  searchParams: Promise<{ hijoId?: string }>;
}

export default async function PortalComunicacionesPage({
  searchParams,
}: ComunicacionesPageProps) {
  const session = await auth();
  const { hijoId } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Obtener hijos del padre
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
        },
      },
    },
  });

  const hijos = relaciones.map((r) => r.hijo);

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <CommunicationsBanner />
        <Card className="border-dashed p-12 text-center">
          <p className="text-lg font-bold">No tienes hijos vinculados</p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

  // 3. Obtener comunicaciones
  const commsRes = await getPortalCommunicationsAction(selectedHijoId);
  const { anuncios = [], eventos = [] } = commsRes.data || {};

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-700">
      <CommunicationsBanner />

      <NotasFilter
        hijos={hijos}
        periodos={[]}
        currentHijoId={selectedHijoId}
        currentPeriodoId=""
        showPeriodo={false}
      />

      <Tabs defaultValue="anuncios" className="w-full">
        <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-border/50 mb-8 overflow-x-auto overflow-y-hidden w-full sm:w-auto">
          <TabsTrigger
            value="anuncios"
            className="flex-1 sm:flex-none h-12 rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-lg"
          >
            Anuncios Centrales
          </TabsTrigger>
          <TabsTrigger
            value="eventos"
            className="flex-1 sm:flex-none h-12 rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-background data-[state=active]:shadow-lg"
          >
            Calendario Escolar
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="anuncios"
          className="space-y-6 animate-in slide-in-from-bottom-2 duration-500"
        >
          {anuncios.length === 0 ? (
            <Card className="border-dashed p-20 text-center bg-muted/20">
              <IconMessage2Off className="mx-auto size-16 text-muted-foreground/40 mb-4" />
              <p className="text-xl font-bold tracking-tight">
                Sin anuncios recientes
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Te avisaremos cuando haya noticias importantes para el grado de
                tu hijo.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {anuncios.map((anuncio: any) => (
                <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="eventos"
          className="space-y-6 animate-in slide-in-from-bottom-2 duration-500"
        >
          {eventos.length === 0 ? (
            <Card className="border-dashed p-20 text-center bg-muted/20">
              <IconCalendarOff className="mx-auto size-16 text-muted-foreground/40 mb-4" />
              <p className="text-xl font-bold tracking-tight">
                No hay eventos programados
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Busca de nuevo más tarde para ver actividades extracurriculares
                o reuniones.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {eventos.map((evento: any) => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="text-center py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/40">
          EduPeru Pro Communications System v2.0
        </p>
      </div>
    </div>
  );
}
