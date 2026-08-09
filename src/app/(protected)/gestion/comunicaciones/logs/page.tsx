import { Suspense } from "react";
import { getNotificationLogsAction } from "@/actions/communications";
import { LogsView } from "@/components/gestion/comunicaciones/logs/logs-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconHistory, IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Logs de Auditoría de Comunicaciones | Sistema Escolar Pro",
  description: "Auditoría en tiempo real de envíos por Correo, SMS y WhatsApp.",
};

export default async function CommunicationLogsPage(props: {
  searchParams: Promise<{ tipo?: string; estado?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const tipo = (searchParams.tipo as any) || "ALL";
  const estado = searchParams.estado || "ALL";

  const logsRes = await getNotificationLogsAction({
    page,
    pageSize: 50,
    tipo,
    estado,
  });

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="rounded-xl size-9 border-border/40 bg-background/80"
            >
              <Link href="/gestion/comunicaciones">
                <IconArrowLeft className="size-4" />
              </Link>
            </Button>
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border-none px-3.5 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-1.5">
              <IconHistory size={14} />
              Auditoría de Envíos
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Historial de Notificaciones
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Supervisa el estado técnico, logs de errores y confirmaciones de entrega de mensajes multicanal.
          </p>
        </div>
      </div>

      <Suspense fallback={<LogsSkeleton />}>
        <LogsView 
          initialData={logsRes.success} 
          currentPage={page}
          currentTipo={tipo}
          currentEstado={estado}
        />
      </Suspense>
    </div>
  );
}

function LogsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-[180px] rounded-xl" />
        <Skeleton className="h-9 w-[180px] rounded-xl" />
      </div>
      <Card className="p-0 border-border/40 overflow-hidden rounded-2xl">
        <div className="p-6 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
