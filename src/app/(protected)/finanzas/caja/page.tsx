import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";
import { CajaRapidaPOS } from "@/components/finanzas/pos/caja-rapida-pos";
import { IconBolt, IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Caja Rápida (POS Escolar) | Sistema Escolar Pro",
  description: "Cobranza de ventanilla en 1 clic para pensiones y cuotas escolares.",
};

export default function CajaRapidaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      <PageHeader
        icon={<IconBolt size={20} className="text-amber-500" />}
        title="Caja Rápida de Ventanilla (POS Escolar)"
        badge="Cobro Express"
        description="Búsqueda instantánea de alumnos, liquidación de cuotas múltiples y emisión de comprobantes en segundos"
        breadcrumbs={[
          { label: "Finanzas", href: "/finanzas" },
          { label: "Caja Rápida" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl h-9 text-xs font-bold gap-1.5 border-border/60 bg-card cursor-pointer shadow-2xs"
          >
            <Link href="/finanzas">
              <IconArrowLeft className="size-4" />
              <span>Ver Panel de Finanzas</span>
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <IconLoader2 className="size-8 animate-spin text-primary" />
            <span className="text-xs font-medium">Iniciando terminal de cobranza...</span>
          </div>
        }
      >
        <CajaRapidaPOS />
      </Suspense>
    </div>
  );
}
