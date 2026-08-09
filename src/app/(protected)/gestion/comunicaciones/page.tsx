import { Suspense } from "react";
import { getCommunicationsStatsAction } from "@/actions/notifications";
import { CommunicationsDashboard } from "@/components/gestion/comunicaciones/communications-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSend } from "@tabler/icons-react";

export const metadata = {
  title: "Bandeja de Comunicaciones | Sistema Escolar Pro",
  description: "Envíe alertas masivas o personalizadas a los padres de familia por Correo, SMS y WhatsApp.",
};

const DEFAULT_STATS = {
  totalEsteMes: 0,
  tendencia: 0,
  tasaExito: 100,
  canales: { EMAIL: 0, SMS: 0, WHATSAPP: 0 },
  integrations: { resend: false, twilio: false },
};

export default async function CommunicationsPage() {
  const statsRes = await getCommunicationsStatsAction({});

  const stats = statsRes.success || DEFAULT_STATS;

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSend size={14} />
            Motor Multicanal
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Bandeja de Notificaciones
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Envía alertas instantáneas y comunicados dirigidos a tutores por Correo Electrónico, SMS y WhatsApp con monitoreo en tiempo real.
          </p>
        </div>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <CommunicationsDashboard stats={stats} />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl md:col-span-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 rounded-2xl space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-3">
            <Skeleton className="h-10 rounded-xl w-full" />
            <Skeleton className="h-20 rounded-xl w-full" />
            <Skeleton className="h-10 rounded-xl w-full" />
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6 rounded-2xl space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-8 rounded-xl w-full" />
            <Skeleton className="h-8 rounded-xl w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}
