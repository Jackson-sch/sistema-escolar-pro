import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDeudasPortalAction } from "@/actions/portal";
import { getBankAccountsAction } from "@/actions/bancos";
import { IconDeviceMobile } from "@tabler/icons-react";
import { DeudasListClient } from "@/components/portal/finance/deudas-list-client";
import { BankInfoSidebar } from "@/components/portal/finance/bank-info-sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  // Obtener datos vía server action
  const [deudasRes, bancosRes] = await Promise.all([
    getDeudasPortalAction({ hijoId: params.hijoId }),
    getBankAccountsAction({ onlyActive: true }),
  ]);

  const {
    hijos = [],
    deudas = [],
    historial = [],
    selectedHijoId: hijoSeleccionado,
  } = (deudasRes.success as any) || {};

  const bancos = (bancosRes as any).success || [];

  return (
    <div className="flex flex-1 flex-col gap-8 md:gap-10 p-4 sm:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Estado de Cuentas
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Gestiona las pensiones escolares y revisa el historial de pagos.
        </p>
      </div>

      <div className="grid gap-8 md:gap-10 lg:grid-cols-12">
        {/* Contenido Principal: Resumen + Tabla */}
        <div className="lg:col-span-8 space-y-8 md:space-y-10">
          <DeudasListClient
            hijos={hijos}
            deudas={deudas}
            historial={historial}
            selectedHijoId={hijoSeleccionado}
          />
        </div>

        {/* Sidebar: Info Bancaria + Comprobante + Ayuda */}
        <div className="lg:col-span-4 space-y-8 md:space-y-12">
          {/* Información Bancaria */}
          <BankInfoSidebar bancos={bancos} />

          {/* Tarjeta de ayuda */}
          <Card className="border-none bg-primary rounded-[1.25rem] p-6 md:p-8 text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/20">
            <div className="relative z-10 flex items-center gap-4 md:gap-5">
              <div className="size-10 md:size-12 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <IconDeviceMobile size={20} className="md:size-24" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold tracking-tight">
                  ¿Necesitas ayuda?
                </h4>
                <p className="text-xs font-bold text-primary-foreground/80 leading-snug">
                  Contacta directamente con el departamento de finanzas.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-primary-foreground font-bold text-xxs uppercase tracking-widest underline decoration-2 underline-offset-4 hover:decoration-primary-foreground transition-all mt-2"
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
