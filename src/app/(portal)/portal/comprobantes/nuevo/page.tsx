import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getCronogramaDetailAction,
  getAllPendingDeudasAction,
} from "@/actions/portal";
import { ComprobanteForm } from "@/components/portal/finance/comprobante-form";
import { formatCurrency } from "@/lib/formats";

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
  const deudasRes = await getAllPendingDeudasAction({
    padreId: session.user.id,
  });
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
    <div className="@container/main mx-auto flex min-h-full w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 pb-6 pt-0 animate-in fade-in animation-duration- sm:px-6">
      {/* Sección de Encabezado */}
      <div className="space-y-1 pt-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Registrar comprobante
        </h1>
        <p className="text-xs font-medium leading-relaxed text-muted-foreground sm:text-sm">
          Adjunta el comprobante de tu transferencia para su validación.
        </p>
      </div>

      <div className="max-w-2xl w-full">
        <ComprobanteForm
          opcionesDeuda={opcionesDeuda}
          cronogramaPrecargado={cronogramaPrecargado}
        />
      </div>
    </div>
  );
}
