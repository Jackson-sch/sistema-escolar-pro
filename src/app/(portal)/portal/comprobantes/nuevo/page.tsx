import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ComprobanteForm } from "@/components/portal/comprobante-form";
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
    const cronograma = await prisma.cronogramaPago.findUnique({
      where: { id: params.cronogramaId },
      include: {
        concepto: true,
        estudiante: {
          include: {
            padresTutores: true,
          },
        },
      },
    });

    if (cronograma) {
      // Verificar que es padre del estudiante
      const esPadre = cronograma.estudiante.padresTutores.some(
        (r) => r.padreTutorId === session.user?.id
      );

      if (esPadre) {
        cronogramaPrecargado = {
          id: cronograma.id,
          concepto: cronograma.concepto.nombre,
          monto: cronograma.monto - cronograma.montoPagado,
          estudiante: `${cronograma.estudiante.name} ${cronograma.estudiante.apellidoPaterno}`,
        };
      }
    }
  }

  // Obtener todas las deudas de los hijos para el selector
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        include: {
          cronogramaPagos: {
            where: { pagado: false },
            include: { concepto: true },
          },
        },
      },
    },
  });

  const opcionesDeuda = relaciones.flatMap((r) =>
    r.hijo.cronogramaPagos.map((c) => ({
      id: c.id,
      label: `${c.concepto.nombre} - ${r.hijo.name} (${formatCurrency(
        c.monto - c.montoPagado
      )})`,
      monto: c.monto - c.montoPagado,
    }))
  );

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-500">
      {/* Premium Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-card/50 p-8">
        <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
          <Badge className="w-fit border-none bg-blue-500/10 text-blue-600">
            Confirmación de Pago
          </Badge>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            Subir{" "}
            <span className="bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Comprobante
            </span>
            <IconCloudUpload className="size-8 sm:size-10 text-blue-500" />
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Sube la imagen o el PDF de tu transferencia. Nuestro equipo
            administrativo validará el pago en un plazo máximo de 24-48 horas
            hábiles.
          </p>
        </div>

        {/* Abstract background elements */}
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-indigo-500/5 blur-[100px]" />
        <IconUpload className="absolute -bottom-8 -right-8 size-56 -rotate-12 text-blue-500/5 select-none" />
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
