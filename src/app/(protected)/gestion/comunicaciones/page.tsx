import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { AlertsHubView } from "@/components/gestion/comunicaciones/alert-center/alerts-hub-view";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Centro de Alertas y WhatsApp para Familias | Sistema Escolar Pro",
  description: "Disparo de alertas automáticas de inasistencias, recordatorios de pensiones y comunicados oficiales.",
};

export default function CommunicationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      <PageHeader
        icon={<IconBrandWhatsapp size={20} className="text-emerald-600" />}
        title="Centro de Alertas & WhatsApp Institucional"
        badge="Comunicación Familiar"
        description="Avisos matutinos de inasistencias a las 08:15 AM, recordatorios preventivos de pensiones y comunicados multicanal"
        breadcrumbs={[
          { label: "Comunidad", href: "/comunicaciones" },
          { label: "Centro de Alertas" },
        ]}
      />

      <Suspense fallback={<AlertsSkeleton />}>
        <AlertsHubView />
      </Suspense>
    </div>
  );
}

function AlertsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-10 w-80 rounded-xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
