"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCircleCheck,
  IconCreditCard,
  IconBell,
  IconUserPlus,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
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
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-200/50 before:to-transparent">
          {activities.length > 0 ? (
            activities.map((activity, idx) => (
              <div
                key={activity.id + idx}
                className="relative flex items-start gap-4 pb-2"
              >
                <div className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm">
                  {getIcon(activity.type)}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">
                    {activity.title}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {activity.description}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground font-medium">
                      {activity.user}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
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
            <div className="text-center py-6 text-muted-foreground italic text-sm">
              No hay actividad reciente registrada.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
