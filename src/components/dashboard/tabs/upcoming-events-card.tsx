"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCalendarEvent, IconMapPin, IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/formats";

interface UpcomingEventsCardProps {
  events: any[];
}

export function UpcomingEventsCard({ events = [] }: UpcomingEventsCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border-border/50 bg-card/80 p-0 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 py-3.5 px-4 sm:px-5">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <IconCalendarEvent className="size-4 text-primary" />
            Agenda & Próximos Hitos
          </CardTitle>
          <CardDescription className="text-xs">
            Eventos programados y actividades escolares
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold text-primary gap-1 cursor-pointer"
          asChild
        >
          <Link href="/comunicaciones">
            Ver agenda <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-3">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No hay eventos programados para los próximos días.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex flex-col items-center justify-center size-11 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                      {new Date(ev.fechaInicio).toLocaleDateString("es-PE", {
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-bold font-mono leading-none mt-0.5">
                      {new Date(ev.fechaInicio).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {ev.titulo}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {ev.descripcion || "Actividad institucional programada"}
                    </p>
                    {ev.aula && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-1">
                        <IconMapPin size={11} /> {ev.aula}
                      </span>
                    )}
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 border-border/60"
                >
                  {ev.tipo || "General"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
