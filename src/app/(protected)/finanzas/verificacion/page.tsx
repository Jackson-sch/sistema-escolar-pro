import { getPendingComprobantesAction } from "@/actions/comprobantes";
import { VerificacionTable } from "@/components/finanzas/verificacion/verificacion-table";

export default async function VerificacionPage() {
  const result = await getPendingComprobantesAction({});

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
          Verificación de Comprobantes
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisa y aprueba los comprobantes de pago enviados por los padres
        </p>
      </div>

      <VerificacionTable comprobantes={result.success || []} />
    </div>
  );
}
