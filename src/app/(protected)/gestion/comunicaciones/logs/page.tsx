import { Suspense } from "react";
import { getNotificationLogsAction } from "@/actions/communications";
import { LogsView } from "@/components/gestion/comunicaciones/logs/logs-view";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Logs de Comunicaciones | Sistema Escolar",
  description: "Auditoría de envíos de correos electrónicos y SMS.",
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Logs de Comunicaciones</h2>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de notificaciones enviadas por Email y SMS.
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
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[200px] rounded-xl" />
        <Skeleton className="h-10 w-[200px] rounded-xl" />
      </div>
      <Card className="p-0 border-border/40 overflow-hidden rounded-[2rem]">
        <div className="p-8 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
