import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBoletasPortalAction } from "@/actions/portal";
import { formatCurrency } from "@/lib/formats";
import { IconCheck, IconReceipt, IconCalendar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/common/stat-card";
import { cn } from "@/lib/utils";
import { BoletasTable } from "@/components/portal/finance/boletas-table";
import { BoletaColumnType } from "@/components/portal/finance/boletas-columns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconFileDownload } from "@tabler/icons-react";

export default async function BoletasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener datos vía server action
  const boletasRes = await getBoletasPortalAction(session.user.id);
  const {
    institucion,
    relaciones = [],
    comprobantesAprobados = [],
  } = boletasRes.data || {};

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

  // Combinar pagos de cronogramas pagados que tienen número de boleta oficial
  const allBoletas: BoletaColumnType[] = relaciones
    .flatMap((r: any) =>
      r.hijo.cronogramaPagos.map((c: any) => {
        const ultimoPago = c.pagos[0];
        return {
          id: c.id,
          numeroBoleta: ultimoPago.numeroBoleta, // Ya filtrado por el server action
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

  // Calcular métricas
  const totalPagado = allBoletas.reduce(
    (acc: number, b) => acc + Number(b.monto),
    0,
  );

  const stats = [
    {
      title: "TOTAL INVERTIDO",
      value: formatCurrency(totalPagado),
      icon: IconCheck,
      iconColor: "text-green-500",
      glowColor: "#22c55e",
      description: "Acumulado histórico de pagos",
    },
    {
      title: "DOCUMENTOS",
      value: allBoletas.length.toString(),
      icon: IconReceipt,
      iconColor: "text-blue-500",
      glowColor: "#3b82f6",
      description: "Comprobantes disponibles",
    },
    {
      title: "PRÓX. PAGO",
      value: "—",
      icon: IconCalendar,
      iconColor: "text-amber-500",
      glowColor: "#f59e0b",
      description: "Pendiente administrativo",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 md:gap-10 p-4 sm:p-6 md:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen max-w-full overflow-hidden">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Mis Boletas de Notas
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Descarga y revisa las boletas de calificaciones oficiales.
        </p>
      </div>

      {/* Grid de Métricas Premium */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-4",
              i === 2 && "sm:col-span-2 lg:col-span-1", // El tercer card ocupa dos columnas en tablets para balancear
            )}
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <StatCard
              {...stat}
              className="h-full border-primary/5 bg-card/40 backdrop-blur-md"
            />
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12 max-w-full overflow-hidden">
        {/* Tabla de Historial (Refactorización a DataTable) */}
        <div className="lg:col-span-12 w-full overflow-hidden">
          <BoletasTable data={allBoletas} />
        </div>
      </div>
    </div>
  );
}
