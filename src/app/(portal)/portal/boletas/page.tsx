import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBoletasPortalAction } from "@/actions/portal";
import { formatCurrency } from "@/lib/formats";
import { IconCheck, IconReceipt, IconFileText } from "@tabler/icons-react";
import { BoletasTable } from "@/components/portal/finance/boletas-table";
import { BoletaColumnType } from "@/components/portal/finance/boletas-columns";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Boletas de Pago | Portal de Familia",
  description: "Historial de comprobantes de pago, descargas en PDF e impresiones electrónicas.",
};

export default async function BoletasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const boletasRes = await getBoletasPortalAction({});
  const {
    institucion,
    relaciones = [],
  } = boletasRes.success || {};

  const institucionData = institucion
    ? {
        nombre:
          institucion.nombreInstitucion ||
          institucion.nombreComercial ||
          "Institución Educativa",
        direccion: institucion.direccion || undefined,
        telefono: institucion.telefono || undefined,
        ruc: undefined,
      }
    : undefined;

  const allBoletas: BoletaColumnType[] = relaciones
    .flatMap((r: any) =>
      r.hijo.cronogramaPagos.map((c: any) => {
        const ultimoPago = c.pagos[0];
        return {
          id: c.id,
          numeroBoleta: ultimoPago.numeroBoleta,
          concepto: c.concepto.nombre,
          monto: ultimoPago?.monto || c.monto,
          fechaPago: ultimoPago?.fechaPago || c.updatedAt,
          metodoPago: ultimoPago?.metodoPago || "Transferencia",
          referenciaPago: ultimoPago?.referenciaPago || undefined,
          estudiante: {
            name: r.hijo.name || "",
            apellidoPaterno: r.hijo.apellidoPaterno || "",
            apellidoMaterno: r.hijo.apellidoMaterno || "",
            codigoEstudiante: r.hijo.codigoEstudiante || undefined,
            nivelAcademico: r.hijo.nivelAcademico
              ? {
                  seccion: r.hijo.nivelAcademico.seccion,
                  grado: { nombre: r.hijo.nivelAcademico.grado.nombre },
                  nivel: { nombre: r.hijo.nivelAcademico.nivel.nombre },
                }
              : undefined,
          },
          institucionData,
        };
      }),
    )
    .sort(
      (a: BoletaColumnType, b: BoletaColumnType) =>
        new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime(),
    );

  const totalPagado = allBoletas.reduce(
    (acc: number, b) => acc + Number(b.monto),
    0,
  );

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconFileText size={14} />
            Comprobantes Electrónicos
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Boletas de Pago
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Consulta e impresión de comprobantes oficiales generados tras la verificación de pagos.
          </p>
        </div>
      </div>

      {/* ── BENTO KPIS FINANCIEROS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-1">
        {/* KPI 1: Invertido */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Invertido Acumulado</span>
            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{formatCurrency(totalPagado)}</h3>
            <p className="text-[11px] text-muted-foreground/80 mt-1">Histórico de pensiones abonadas</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <IconCheck className="size-5" />
          </div>
        </div>

        {/* KPI 2: Boletas Emitidas */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Documentos Emitidos</span>
            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">{allBoletas.length}</h3>
            <p className="text-[11px] text-muted-foreground/80 mt-1">Comprobantes listos para descarga</p>
          </div>
          <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <IconReceipt className="size-5" />
          </div>
        </div>
      </div>

      {/* ── TABLA DE BOLETAS ── */}
      <div className="px-1">
        <BoletasTable data={allBoletas} />
      </div>
    </div>
  );
}
