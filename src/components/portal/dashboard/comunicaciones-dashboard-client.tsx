"use client";

import { useState } from "react";
import { AnnouncementCard } from "@/components/portal/dashboard/announcement-card";
import { EventCard } from "@/components/portal/dashboard/event-card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Card } from "@/components/ui/card";
import { IconMessage2Off, IconCalendarOff } from "@tabler/icons-react";

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
      <section className="flex-1 space-y-8 min-w-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 mb-8 gap-4">
            <h2 className="text-xl font-bold text-foreground">
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
              <Card className="border-dashed p-24 text-center bg-muted/10 rounded-3xl">
                <IconMessage2Off className="mx-auto size-20 text-muted-foreground/20 mb-6" />
                <p className="text-2xl font-black tracking-tight text-foreground/80">
                  Sin actividad reciente
                </p>
                <p className="text-sm font-medium text-muted-foreground/60 mt-2 max-w-sm mx-auto">
                  Te avisaremos cuando haya noticias o eventos importantes para
                  el grado de tu hijo.
                </p>
              </Card>
            ) : (
              <div className="grid gap-8">
                {pinnedAnnouncement && (
                  <AnnouncementCard
                    anuncio={pinnedAnnouncement}
                    variant="pinned"
                  />
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Card className="border-dashed p-24 text-center bg-muted/10 rounded-3xl">
                <IconMessage2Off className="mx-auto size-20 text-muted-foreground/20 mb-6" />
                <p className="text-2xl font-black tracking-tight text-foreground/80">
                  Sin anuncios académicos
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {anuncios
                  .filter((a: any) => a.categoria !== "Evento")
                  .map((anuncio: any) => (
                    <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="eventos" className="mt-0 outline-none w-full">
            {eventos.length === 0 &&
            anuncios.filter((a: any) => a.categoria === "Evento").length ===
              0 ? (
              <Card className="border-dashed p-24 text-center bg-muted/10 rounded-3xl">
                <IconCalendarOff className="mx-auto size-20 text-muted-foreground/20 mb-6" />
                <p className="text-2xl font-black tracking-tight text-foreground/80">
                  Sin eventos programados
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {eventos.map((evento: any) => (
                  <EventCard key={evento.id} evento={evento} />
                ))}
                {anuncios
                  .filter((a: any) => a.categoria === "Evento")
                  .map((anuncio: any) => (
                    <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Sidebar Derecho (Upcoming Events & Help) */}
      <aside className="hidden xl:flex flex-col w-72 shrink-0 gap-8">
        <div className="sticky top-24 space-y-8">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <h4 className="font-bold mb-4 flex items-center justify-between">
              Próximos Eventos
              <span className="text-muted-foreground cursor-pointer tracking-widest leading-none">
                •••
              </span>
            </h4>
            <div className="space-y-4">
              {eventos.length === 0 ? (
                <div className="p-4 text-center bg-muted/10 rounded-xl">
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
                          "es-ES",
                          {
                            month: "short",
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
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
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
              className="w-full mt-6 py-2 text-primary font-bold text-xs border border-primary/20 hover:bg-primary/5 rounded-lg transition-all flex items-center justify-center"
            >
              Ver Todos Los Eventos
            </button>
          </div>

          <div className="bg-linear-to-br from-primary to-blue-700/80 rounded-2xl p-6 shadow-lg shadow-primary/20 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2 text-white">
                ¿Necesitas Ayuda?
              </h4>
              <p className="text-sm text-white/80 mb-4 leading-relaxed font-medium">
                Nuestro equipo de soporte está disponible para problemas
                técnicos o consultas escolares.
              </p>
              <button className="w-full bg-white text-primary font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-white/90 transition-colors">
                Abrir Chat de Soporte
              </button>
            </div>
            {/* Decal de fondo */}
            <div className="absolute -bottom-6 -right-6 text-9xl text-white/10 rotate-12 font-black select-none">
              ?
            </div>
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
