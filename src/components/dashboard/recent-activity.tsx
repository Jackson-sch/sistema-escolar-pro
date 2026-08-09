"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  IconCircleCheck,
  IconCreditCard,
  IconBell,
  IconUserPlus,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  user: string;
}


interface RecentActivityProps {
  activities: ActivityItem[];
  className?: string;
}

function getActivityIcon(type: string) {
  switch (type) {
    case "matricula":
      return <IconUserPlus className="size-4 text-emerald-500" />;
    case "pago":
      return <IconCreditCard className="size-4 text-blue-500" />;
    case "anuncio":
      return <IconBell className="size-4 text-amber-500" />;
    default:
      return <IconCircleCheck className="size-4 text-muted-foreground" />;
  }
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm",
      )}
    >
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-lg font-black tracking-tight">
          Actividad Reciente
        </CardTitle>
        <CardDescription className="text-xs font-medium">
          Últimos eventos registrados en el sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pb-0 relative z-10">
        <ScrollArea className="h-full pr-4 pb-6">
          <div className="relative space-y-5 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-px before:bg-border/70">
            {activities.length > 0 ? (
              activities.map((activity, idx) => (
                <div
                  key={activity.id + idx}
                  className="relative flex items-start gap-4 transition-transform duration-300 hover:translate-x-1"
                >
                  <div className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card shadow-sm">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-bold truncate leading-tight">
                      {activity.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {activity.description}
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {activity.user}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70 font-medium italic">
                        {formatDistanceToNow(new Date(activity.date), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground italic text-sm">
                No hay actividad reciente registrada.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
