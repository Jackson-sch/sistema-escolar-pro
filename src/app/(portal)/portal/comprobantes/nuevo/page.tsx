import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getCronogramaDetailAction,
  getAllPendingDeudasAction,
} from "@/actions/portal";
import { ComprobanteForm } from "@/components/portal/finance/comprobante-form";
import { formatCurrency } from "@/lib/formats";
import { Badge } from "@/components/ui/badge";
import { IconUpload, IconCloudUpload } from "@tabler/icons-react";

export default async function NuevoComprobantePage({
  searchParams,
}: {
  searchParams: Promise<{ cronogramaId?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener el cronograma si viene en la URL
  let cronogramaPrecargado = null;

  if (params.cronogramaId) {
    const cronoRes = await getCronogramaDetailAction({
      cronogramaId: params.cronogramaId,
      padreId: session.user.id,
    });
    const cronograma = cronoRes.success;

    if (cronograma) {
      cronogramaPrecargado = {
        id: cronograma.id,
        concepto: cronograma.concepto.nombre,
        monto: cronograma.monto - cronograma.montoPagado,
        estudiante: `${cronograma.estudiante.name} ${cronograma.estudiante.apellidoPaterno}`,
      };
    }
  }

  // Obtener todas las deudas de los hijos para el selector
  const deudasRes = await getAllPendingDeudasAction({ padreId: session.user.id });
  const relaciones = deudasRes.success || [];

  const opcionesDeuda = relaciones.flatMap((r: any) =>
    r.hijo.cronogramaPagos.map((c: any) => ({
      id: c.id,
      label: `${c.concepto.nombre} - ${r.hijo.name} (${formatCurrency(
        c.monto - c.montoPagado,
      )})`,
      monto: c.monto - c.montoPagado,
    })),
  );

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0 animate-in fade-in duration-500">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Mis Comprobantes
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Historial de pagos realizados y descarga de facturas/recibos.
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <ComprobanteForm
          opcionesDeuda={opcionesDeuda}
          cronogramaPrecargado={cronogramaPrecargado}
        />
      </div>
    </div>
  );
}
