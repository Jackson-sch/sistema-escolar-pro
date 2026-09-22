import { getPendingComprobantesAction } from "@/actions/comprobantes";
import { VerificacionTable } from "@/components/finanzas/verificacion/verificacion-table";
import { PageHeader } from "@/components/common/page-header";
import { IconChecklist, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Verificación de Comprobantes | Sistema Escolar Pro",
  description:
    "Revisión, auditoría y aprobación de pagos y transferencias bancarias de padres de familia.",
};

export default async function VerificacionPage() {
  const result = await getPendingComprobantesAction({});
  const comprobantes = (result.success || []) as any[];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      {/* ── HEADER COMPACTO FINANCIERO ── */}
      <PageHeader
        icon={<IconChecklist size={20} className="text-primary" />}
        title="Verificación de Comprobantes"
        badge={`${comprobantes.length} pendientes`}
        description="Auditoría y conciliación de transferencias y depósitos bancarios reportados por los padres"
        breadcrumbs={[
          { label: "Finanzas", href: "/finanzas" },
          { label: "Verificación de Pagos" },
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

      <VerificacionTable comprobantes={comprobantes} />
    </div>
  );
}
