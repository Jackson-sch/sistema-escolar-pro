import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconAlertTriangle,
  IconCalendar,
  IconReceipt,
  IconUpload,
  IconCreditCard,
  IconArrowRight,
  IconInfoCircle,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyText } from "@/components/portal/copy-text";

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

  // Obtener hijos del padre
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        include: {
          nivelAcademico: {
            include: { grado: true, nivel: true },
          },
        },
      },
    },
  });

  const hijos = relaciones.map((r) => r.hijo);
  const hijoSeleccionado = params.hijoId || hijos[0]?.id;

  // Obtener deudas del hijo seleccionado
  const deudas = hijoSeleccionado
    ? await prisma.cronogramaPago.findMany({
        where: {
          estudianteId: hijoSeleccionado,
          pagado: false,
        },
        include: {
          concepto: true,
          estudiante: true,
        },
        orderBy: { fechaVencimiento: "asc" },
      })
    : [];

  // Datos bancarios (Idealmente vendrían de la DB de Institución)
  const datosBancarios = {
    banco: "Banco de Crédito del Perú",
    titular: "Institución Educativa EduPeru",
    cuenta: "193-12345678-0-12",
    cci: "002-193-12345678-0-12-45",
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 @container/main animate-in fade-in duration-500">
      {/* Premium Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-card/50 p-8">
        <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
          <Badge className="w-fit border-none bg-amber-500/10 text-amber-600">
            Pagos Pendientes
          </Badge>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            Estado de{" "}
            <span className="bg-linear-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              Cuentas
            </span>
            <IconReceipt className="size-8 sm:size-10 text-amber-500" />
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Revisa las cuotas pendientes, utiliza los datos de transferencia y
            sube tu comprobante para procesar el pago.
          </p>
        </div>

        {/* Abstract background elements */}
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/5 blur-[100px]" />
        <IconCreditCard className="absolute -bottom-8 -right-8 size-56 -rotate-12 text-amber-500/5 select-none" />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Lado Izquierdo: Selector y Deudas */}
        <div className="lg:col-span-8 space-y-6">
          {/* Selector de hijos tipo Tabs */}
          {hijos.length > 1 && (
            <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 rounded-2xl border border-border/50 w-fit">
              {hijos.map((hijo) => (
                <Link
                  key={hijo.id}
                  href={`/portal/deudas?hijoId=${hijo.id}`}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    hijoSeleccionado === hijo.id
                      ? "bg-card text-primary shadow-sm ring-1 ring-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span className="capitalize">
                    {(hijo.name || "").toLowerCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* Lista de deudas */}
          <div className="space-y-4">
            {deudas.length === 0 ? (
              <Card className="border-dashed py-16 text-center">
                <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <IconCheck className="size-10" />
                </div>
                <h3 className="text-xl font-bold">¡Todo al día!</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  No hay cuotas pendientes de pago para el estudiante
                  seleccionado.
                </p>
              </Card>
            ) : (
              deudas.map((deuda) => {
                const pendiente = deuda.monto - Number(deuda.montoPagado);
                const vencida = new Date(deuda.fechaVencimiento) < new Date();

                return (
                  <Card
                    key={deuda.id}
                    className={`group transition-all hover:shadow-lg ${
                      vencida ? "border-l-red-500 bg-red-500/5" : "bg-card"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
                        <div className="flex items-center gap-5 flex-1">
                          <div
                            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-110 ${
                              vencida
                                ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-red-500/5 shadow-inner"
                                : "bg-primary/10 border-primary/20 text-primary shadow-primary/5 shadow-inner"
                            }`}
                          >
                            {vencida ? (
                              <IconAlertTriangle className="size-8" />
                            ) : (
                              <IconReceipt className="size-8" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-black tracking-tight">
                                {deuda.concepto.nombre}
                              </h3>
                              {vencida && (
                                <Badge
                                  variant="destructive"
                                  className="px-1.5 py-0 text-[10px] uppercase font-black animate-pulse"
                                >
                                  Vencida
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                              <span className="flex items-center gap-1.5">
                                <IconCalendar className="size-4" />
                                Vence: {formatDate(deuda.fechaVencimiento)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <IconInfoCircle className="size-4 text-blue-400" />
                                Estudiante:{" "}
                                <span className="capitalize">
                                  {`${deuda.estudiante.name || ""} ${
                                    deuda.estudiante.apellidoPaterno || ""
                                  } ${deuda.estudiante.apellidoMaterno || ""}`
                                    .trim()
                                    .toLowerCase()}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto">
                          <div className="text-center sm:text-right">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                              Monto Pendiente
                            </p>
                            <p
                              className={`text-3xl font-black ${
                                vencida ? "text-red-500" : "text-foreground"
                              }`}
                            >
                              {formatCurrency(pendiente)}
                            </p>
                          </div>
                          <Button
                            asChild
                            size="lg"
                            className={`w-full sm:w-auto font-bold rounded-2xl shadow-xl shadow-primary/10 ${
                              vencida ? "bg-red-600 hover:bg-red-700" : ""
                            }`}
                          >
                            <Link
                              href={`/portal/comprobantes/nuevo?cronogramaId=${deuda.id}`}
                            >
                              <IconUpload className="mr-2 size-5" />
                              Pagar Ahora
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Lado Derecho: Datos Bancarios */}
        <div className="lg:col-span-4">
          <Card className="sticky top-6 border-primary/10 bg-linear-to-b from-card to-muted/20 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <IconCreditCard size={120} />
            </div>
            <CardHeader className="border-b bg-muted/30 pb-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <IconCreditCard className="text-primary" />
                DATOS BANCARIOS
              </CardTitle>
              <CardDescription className="text-xs font-semibold uppercase tracking-widest text-primary/60">
                Pagar vía transferencia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-5">
                <BankDataField label="Banco" value={datosBancarios.banco} />
                <BankDataField
                  label="Titular de la Cuenta"
                  value={datosBancarios.titular}
                />
                <BankDataField
                  label="Número de Cuenta"
                  value={datosBancarios.cuenta}
                  mono
                />
                <BankDataField
                  label="CCI (Interbancario)"
                  value={datosBancarios.cci}
                  mono
                />
              </div>

              <div className="rounded-2xl bg-primary/10 p-5 mt-6 border border-primary/10 relative overflow-hidden group">
                <div className="relative z-10 flex gap-4">
                  <div className="bg-primary/20 rounded-xl p-2 h-fit shrink-0">
                    <IconInfoCircle className="text-primary size-5" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-primary">
                      Instrucciones
                    </p>
                    <p className="text-[13px] leading-relaxed text-muted-foreground">
                      Realiza la transferencia por el monto exacto y no olvides{" "}
                      <strong>subir la captura del comprobante</strong> para que
                      validemos tu pago.
                    </p>
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-0 group-hover:opacity-10 transition-opacity translate-x-4 translate-y-4">
                  <IconReceipt size={100} className="-rotate-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BankDataField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="group space-y-1.5 relative">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-xl border border-transparent transition-all group-hover:border-primary/20 group-hover:bg-muted/60">
        <p
          className={`font-bold transition-colors group-hover:text-foreground ${
            mono ? "font-mono text-sm" : "text-sm text-muted-foreground"
          }`}
        >
          {value}
        </p>
        <CopyText text={value} />
      </div>
    </div>
  );
}
