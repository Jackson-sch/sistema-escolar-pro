import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDeudasPortalAction } from "@/actions/portal";
import { getBankAccountsAction } from "@/actions/bancos";
import {
  IconDeviceMobile,
} from "@tabler/icons-react";
import { DeudasListClient } from "@/components/portal/finance/deudas-list-client";
import {
  Card,
} from "@/components/ui/card";
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
    getDeudasPortalAction(session.user.id, params.hijoId),
    getBankAccountsAction({ onlyActive: true }),
  ]);

  const {
    hijos = [],
    deudas = [],
    selectedHijoId: hijoSeleccionado,
  } = deudasRes.data || {};

  const bancos = (bancosRes as any).success || [];

  return (
    <div className="flex flex-1 flex-col gap-10 p-6 sm:p-10 pt-0 @container/main animate-in fade-in duration-700 bg-[#0a0c14] min-h-screen text-white">
      {/* Sección de Encabezado */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-white">
          Estado de Cuentas
        </h1>
        <p className="text-muted-foreground/80 font-medium">
          Gestiona las pensiones escolares y revisa el historial de pagos de{" "}
          <span className="text-white font-bold">
            Benjamin Franklin Academy
          </span>
          .
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Contenido Principal: Resumen + Tabla */}
        <div className="lg:col-span-8 space-y-10">
          <DeudasListClient
            hijos={hijos}
            deudas={deudas}
            selectedHijoId={hijoSeleccionado}
            bancos={bancos}
          />
        </div>

        {/* Sidebar: Info Bancaria + Comprobante + Ayuda */}
        <div className="lg:col-span-4 space-y-8">
          {/* Tarjeta de ayuda */}
          <Card className="border-none bg-orange-600 rounded-[1.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-orange-600/20">
            <div className="relative z-10 flex items-center gap-5">
              <div className="size-12 rounded-full bg-white/20 flex items-center justify-center">
                <IconDeviceMobile size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black tracking-tight">
                  ¿Necesitas ayuda?
                </h4>
                <p className="text-xs font-bold text-white/80 leading-snug">
                  Contacta directamente con el departamento de finanzas.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-white font-black text-[10px] uppercase tracking-widest underline decoration-2 underline-offset-4 hover:decoration-white transition-all mt-2"
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
