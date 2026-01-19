import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconReceipt,
  IconCheck,
  IconFileDownload,
  IconUser,
  IconCalendar,
  IconHistory,
} from "@tabler/icons-react";
import { BoletaDownloadButton } from "@/components/portal/boleta-download-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BoletasPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener datos de la institución
  const institucion = await prisma.institucionEducativa.findFirst();

  // Obtener pagos aprobados de los hijos del padre
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        include: {
          nivelAcademico: {
            include: {
              grado: true,
              nivel: true,
            },
          },
          cronogramaPagos: {
            where: {
              pagado: true,
              pagos: {
                some: {
                  numeroBoleta: { not: null },
                },
              },
            },
            include: {
              concepto: true,
              pagos: {
                where: { numeroBoleta: { not: null } },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      },
    },
  });

  // Obtener comprobantes aprobados del padre
  const comprobantesAprobados = await prisma.comprobantePago.findMany({
    where: {
      padreId: session.user.id,
      estado: "APROBADO",
    },
    include: {
      cronograma: {
        include: {
          concepto: true,
          estudiante: {
            include: {
              nivelAcademico: {
                include: {
                  grado: true,
                  nivel: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { verificadoEn: "desc" },
  });

  // Combinar pagos de cronogramas pagados
  const boletasDisponibles = relaciones.flatMap((r) =>
    r.hijo.cronogramaPagos.map((c) => {
      const ultimoPago = c.pagos[0];
      return {
        id: c.id,
        numeroBoleta:
          ultimoPago?.numeroBoleta || `B-${c.id.slice(-8).toUpperCase()}`,
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
      };
    })
  );

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

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 @container/main animate-in fade-in duration-500">
      {/* Premium Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-green-500/20 bg-card/50 p-8">
        <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
          <Badge className="w-fit border-none bg-green-500/10 text-green-600">
            Documentos Oficiales
          </Badge>
          <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
            Mis{" "}
            <span className="bg-linear-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Boletas
            </span>
            <IconFileDownload className="size-8 sm:size-10 text-green-500" />
          </h1>
          <p className="max-w-xl text-balance text-lg text-muted-foreground">
            Descarga tus comprobantes de pago autorizados. Estos documentos
            tienen validez legal y sirven para tu control personal.
          </p>
        </div>

        {/* Abstract background elements */}
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-green-500/10 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-primary/5 blur-[100px]" />
        <IconHistory className="absolute -bottom-8 -right-8 size-56 -rotate-12 text-green-500/5 select-none" />
      </div>

      {/* Lista de boletas */}
      <div className="space-y-4">
        {boletasDisponibles.length === 0 &&
        comprobantesAprobados.length === 0 ? (
          <Card className="border-dashed py-16 text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
              <IconReceipt className="size-10" />
            </div>
            <h3 className="text-xl font-bold">No hay boletas disponibles</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
              Las boletas aparecerán aquí una vez que tus pagos sean procesados
              y aprobados por la administración.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {/* Boletas de cronogramas pagados */}
            {boletasDisponibles.map((boleta) => (
              <Card
                key={boleta.id}
                className="group transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-primary/5"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
                    <div className="flex items-center gap-5 flex-1 w-full">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-green-500/10 border-green-500/20 text-green-500 shadow-green-500/5 shadow-inner transition-transform group-hover:scale-110">
                        <IconCheck className="size-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight capitalize">
                            {boleta.concepto.toLowerCase()}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold text-green-600 bg-green-500/5 border-green-500/20"
                          >
                            {boleta.numeroBoleta}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <IconUser className="size-4" />
                            <span className="capitalize">
                              {boleta.estudiante.name.toLowerCase()}{" "}
                              {boleta.estudiante.apellidoPaterno.toLowerCase()}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IconCalendar className="size-4" />
                            Pagado: {formatDate(boleta.fechaPago)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <div className="flex-1 sm:text-right">
                        <span className="text-2xl font-black text-foreground">
                          {formatCurrency(Number(boleta.monto))}
                        </span>
                      </div>
                      <BoletaDownloadButton
                        pago={{
                          id: boleta.id,
                          numeroBoleta: boleta.numeroBoleta,
                          fechaPago: boleta.fechaPago,
                          monto: Number(boleta.monto),
                          concepto: boleta.concepto,
                          metodoPago: boleta.metodoPago,
                          referenciaPago: boleta.referenciaPago,
                        }}
                        estudiante={boleta.estudiante}
                        institucion={institucionData}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Comprobantes aprobados sin boleta generada formalmente en cronograma */}
            {comprobantesAprobados.map((comp) => (
              <Card
                key={comp.id}
                className="group transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden border-primary/5"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
                    <div className="flex items-center gap-5 flex-1 w-full">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5 shadow-inner transition-transform group-hover:scale-110">
                        <IconCheck className="size-8" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight capitalize">
                            {comp.cronograma.concepto.nombre.toLowerCase()}
                          </h3>
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/5 border-emerald-500/20"
                          >
                            PROCESADO
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <IconUser className="size-4" />
                            <span className="capitalize">
                              {(
                                comp.cronograma.estudiante.name || ""
                              ).toLowerCase()}{" "}
                              {(
                                comp.cronograma.estudiante.apellidoPaterno || ""
                              ).toLowerCase()}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <IconCalendar className="size-4" />
                            Aprobado: {formatDate(comp.verificadoEn!)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <div className="flex-1 sm:text-right">
                        <span className="text-2xl font-black text-foreground">
                          {formatCurrency(Number(comp.monto))}
                        </span>
                      </div>
                      <BoletaDownloadButton
                        pago={{
                          id: comp.id,
                          fechaPago: comp.verificadoEn!,
                          monto: Number(comp.monto),
                          concepto: comp.cronograma.concepto.nombre,
                        }}
                        estudiante={{
                          name: comp.cronograma.estudiante.name || "",
                          apellidoPaterno:
                            comp.cronograma.estudiante.apellidoPaterno || "",
                          apellidoMaterno:
                            comp.cronograma.estudiante.apellidoMaterno || "",
                          codigoEstudiante:
                            comp.cronograma.estudiante.codigoEstudiante ||
                            undefined,
                          nivelAcademico: comp.cronograma.estudiante
                            .nivelAcademico
                            ? {
                                seccion:
                                  comp.cronograma.estudiante.nivelAcademico
                                    .seccion,
                                grado: {
                                  nombre:
                                    comp.cronograma.estudiante.nivelAcademico
                                      .grado.nombre,
                                },
                                nivel: {
                                  nombre:
                                    comp.cronograma.estudiante.nivelAcademico
                                      .nivel.nombre,
                                },
                              }
                            : undefined,
                        }}
                        institucion={institucionData}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      {(boletasDisponibles.length > 0 || comprobantesAprobados.length > 0) && (
        <Card className="border-none bg-linear-to-r from-blue-500/10 to-transparent">
          <CardContent className="flex items-center gap-3 p-4">
            <IconFileDownload className="size-5 text-blue-500" />
            <p className="text-sm font-medium text-blue-700/80">
              Todas las boletas descargables son documentos válidos autorizados
              por la institución.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
