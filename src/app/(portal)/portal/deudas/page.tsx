import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDeudasPortalAction } from "@/actions/portal";
import { getBankAccountsAction } from "@/actions/bancos";
import { IconDeviceMobile, IconCreditCard } from "@tabler/icons-react";
import { DeudasListClient } from "@/components/portal/finance/deudas-list-client";
import { BankInfoSidebar } from "@/components/portal/finance/bank-info-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Estado de Cuenta | Portal de Familia",
  description: "Control de pensiones, declaración de vouchers y cuentas bancarias oficiales.",
};

export default async function DeudasPage({
  searchParams,
}: {
  searchParams: Promise<{ hijoId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [deudasRes, bancosRes] = await Promise.all([
    getDeudasPortalAction({ hijoId: params.hijoId }),
    getBankAccountsAction({ onlyActive: true }),
  ]);

  const {
    hijos = [],
    deudas = [],
    historial = [],
    selectedHijoId: hijoSeleccionado,
  } = deudasRes.success || {};

  const bancos = bancosRes.success || [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL ── */}
      <PageHeader
        icon={<IconCreditCard size={20} />}
        title="Estado de Cuenta & Pensiones"
        badge="Tesorería"
        description="Cronograma mensual de pagos, registro de comprobantes y cuentas oficiales para transferencias"
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: "Deudas y Pagos" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-12 px-1">
        {/* Contenido Principal: Resumen + Tabla */}
        <div className="lg:col-span-8 space-y-6">
          <DeudasListClient
            hijos={hijos}
            deudas={deudas}
            historial={historial}
            selectedHijoId={hijoSeleccionado}
          />
        </div>

        {/* Sidebar: Info Bancaria + Comprobante + Ayuda */}
        <div className="lg:col-span-4 space-y-6">
          {/* Información Bancaria */}
          <BankInfoSidebar bancos={bancos} />

          {/* Tarjeta de ayuda */}
          <Card className="border border-border/40 bg-card/80 p-5 shadow-sm rounded-2xl">
            <div className="relative z-10 flex items-center gap-4">
              <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <IconDeviceMobile className="size-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-foreground">
                  ¿Soporte Financiero?
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Contacta al área de cobranza si requieres atención personalizada.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-indigo-600 dark:text-indigo-400 font-bold text-xs underline underline-offset-4 mt-1"
                >
                  ENVIAR MENSAJE
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
