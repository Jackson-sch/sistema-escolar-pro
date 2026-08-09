"use client";

import { useState } from "react";
import { AnnouncementCard } from "@/components/portal/dashboard/announcement-card";
import { EventCard } from "@/components/portal/dashboard/event-card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconMessage2Off, IconCalendarOff, IconHelpCircle, IconMessage2 } from "@tabler/icons-react";

interface ComunicacionesDashboardClientProps {
  anuncios: any[];
  eventos: any[];
}

export function ComunicacionesDashboardClient({
  anuncios,
  eventos,
}: ComunicacionesDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("todo");

  const pinnedAnnouncement = anuncios.find((a: any) => a.fijado);
  const otherAnnouncements = anuncios.filter((a: any) => !a.fijado);

  const tabs = [
    { id: "todo", label: "Todo" },
    { id: "academico", label: "Académico" },
    { id: "eventos", label: "Eventos" },
  ];

  return (
    <>
      {/* Contenido Principal (Feed) */}
      <section className="flex-1 space-y-6 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-6 gap-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Comunicaciones
            </h2>
            <AnimatedTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <TabsContent value="todo" className="mt-0 outline-none w-full">
            {anuncios.length === 0 && eventos.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
                <IconMessage2Off className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                <p className="text-lg font-bold tracking-tight text-foreground/80">
                  Sin actividad reciente
                </p>
                <p className="text-sm font-medium text-muted-foreground/60 mt-2 max-w-sm mx-auto">
                  Te avisaremos cuando haya noticias o eventos importantes para
                  el grado de tu hijo.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {pinnedAnnouncement && (
                  <AnnouncementCard
                    anuncio={pinnedAnnouncement}
                    variant="pinned"
                  />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {otherAnnouncements.map((anuncio: any) => (
                    <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="academico" className="mt-0 outline-none w-full">
            {anuncios.filter((a: any) => a.categoria !== "Evento").length ===
            0 ? (
              <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
                <IconMessage2Off className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                <p className="text-lg font-bold tracking-tight text-foreground/80">
                  Sin anuncios académicos
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {anuncios.flatMap((anuncio: any) =>
                  anuncio.categoria !== "Evento" ? [
                    <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
                  ] : []
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="eventos" className="mt-0 outline-none w-full">
            {eventos.length === 0 &&
            anuncios.filter((a: any) => a.categoria === "Evento").length ===
              0 ? (
              <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
                <IconCalendarOff className="mx-auto size-12 text-muted-foreground/20 mb-4" />
                <p className="text-lg font-bold tracking-tight text-foreground/80">
                  Sin eventos programados
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {eventos.map((evento: any) => (
                  <EventCard key={evento.id} evento={evento} />
                ))}
                {anuncios.flatMap((anuncio: any) =>
                  anuncio.categoria === "Evento" ? [
                    <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
                  ] : []
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Sidebar Derecho (Upcoming Events & Help) */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 gap-6">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm">
            <h4 className="font-bold mb-4 flex items-center justify-between">
              Próximos Eventos
              <span className="text-muted-foreground cursor-pointer tracking-widest leading-none">
                •••
              </span>
            </h4>
            <div className="space-y-4">
              {eventos.length === 0 ? (
                <div className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-xs font-bold text-muted-foreground">
                    No hay eventos próximos
                  </p>
                </div>
              ) : (
                eventos.slice(0, 3).map((evento: any) => (
                  <div key={evento.id} className="flex gap-4 items-start">
                    <div className="size-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-primary leading-none uppercase">
                        {new Date(evento.fechaInicio).toLocaleDateString(
                          "es-PE",
                          {
                            month: "short",
                            timeZone: "America/Lima",
                          },
                        )}
                      </span>
                      <span className="text-lg font-bold text-primary leading-none">
                        {new Date(evento.fechaInicio).getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">
                        {evento.titulo}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {evento.ubicacion || "Virtual"} •{" "}
                        {new Date(evento.fechaInicio).toLocaleTimeString(
                          "es-PE",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "America/Lima",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setActiveTab("eventos")}
              className="w-full mt-6 py-2 text-primary font-bold text-xs border border-primary/20 hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center"
            >
              Ver Todos Los Eventos
            </button>
          </div>

          {/* Tarjeta de Soporte Adaptable a Dark/Light */}
          <div className="p-5 rounded-2xl border border-indigo-500/20 bg-card/80 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <IconHelpCircle className="size-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  ¿Necesitas Ayuda?
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Soporte técnico y orientación
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nuestro equipo de atención está disponible para solucionar problemas con la plataforma o consultas del colegio.
            </p>
            <Button
              className="w-full rounded-xl h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
            >
              <IconMessage2 className="size-4" />
              <span>Abrir Chat de Soporte</span>
            </Button>
          </div>

          {/* <div className="px-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Línea Escolar</span>
              <span className="font-bold text-foreground">555-0199</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Alertas de Emergencia</span>
              <span className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>
          </div> */}
        </div>
      </aside>
    </>
  );
}
