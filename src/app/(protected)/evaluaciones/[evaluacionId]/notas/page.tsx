import { notFound } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconClipboardList,
  IconCalendar,
  IconScale,
  IconSchool,
  IconUsers,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getNotasEvaluacionAction,
  getEstudiantesCursoAction,
} from "@/actions/evaluations";
import prisma from "@/lib/prisma";
import { NotasForm } from "@/components/evaluaciones/notas/notas-form";

interface NotasPageProps {
  params: Promise<{ evaluacionId: string }>;
}

export default async function NotasPage({ params }: NotasPageProps) {
  const { evaluacionId } = await params;

  // Obtener la evaluación con todos sus datos relacionados
  const evaluacion = await prisma.evaluacion.findUnique({
    where: { id: evaluacionId },
    include: {
      tipoEvaluacion: true,
      curso: {
        include: {
          areaCurricular: true,
          nivelAcademico: {
            include: { grado: true },
          },
        },
      },
      periodo: true,
    },
  });

  if (!evaluacion) {
    notFound();
  }

  // Carga de datos paralela para mejor performance
  const [estudiantesReq, notasReq] = await Promise.all([
    getEstudiantesCursoAction(evaluacion.cursoId),
    getNotasEvaluacionAction(evaluacionId),
  ]);

  const estudiantes = estudiantesReq.data || [];
  const notasExistentes = notasReq.data || [];

  // Mapear notas existentes por estudiante para acceso rápido O(1)
  const notasMap = notasExistentes.reduce(
    (
      acc: Record<string, { valor: number; valorLiteral?: string }>,
      nota: any,
    ) => {
      acc[nota.estudianteId] = {
        valor: nota.valor,
        valorLiteral: nota.valorLiteral || undefined,
      };
      return acc;
    },
    {},
  );

  return (
    <div className="container mx-auto py-6 space-y-8 animate-in fade-in duration-500">
      {/* 1. Header de Navegación y Título */}
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="shrink-0 h-10 w-10 rounded-full border-dashed"
          >
            <Link href="/evaluaciones" title="Volver al listado">
              <IconArrowLeft className="size-5" />
            </Link>
          </Button>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <IconClipboardList className="size-7 text-primary hidden sm:block" />
                {evaluacion.nombre}
              </h1>
              <Badge
                variant="outline"
                className="text-xs font-medium uppercase tracking-wider py-1"
              >
                {evaluacion.tipoEvaluacion.nombre}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {evaluacion.curso.nombre}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {evaluacion.curso.nivelAcademico?.grado.nombre} "
                {evaluacion.curso.nivelAcademico?.seccion}"
              </span>
              <span>•</span>
              <span className="uppercase">
                {evaluacion.curso.areaCurricular.nombre}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Tarjeta de Metadatos (Resumen) */}
        <Card className="bg-muted/40 shadow-sm border-none">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Periodo */}
              <div className="flex flex-col gap-1.5 border-r last:border-0 border-border/50 pr-4">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconCalendar className="size-3.5" /> Periodo
                </span>
                <span className="font-semibold text-foreground">
                  {evaluacion.periodo.nombre}
                </span>
              </div>

              {/* Peso */}
              <div className="flex flex-col gap-1.5 border-r md:border-r last:border-0 border-border/50 pr-4">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconScale className="size-3.5" /> Peso
                </span>
                <span className="font-semibold text-foreground">
                  {evaluacion.peso}% de la nota final
                </span>
              </div>

              {/* Nota Minima (Conditional display styling) */}
              <div className="flex flex-col gap-1.5 border-r last:border-0 border-border/50 pr-4">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconSchool className="size-3.5" /> Nota Mín. Aprobatoria
                </span>
                <span className="font-semibold text-foreground">
                  {evaluacion.notaMinima ? (
                    <span className="text-orange-500/90 dark:text-orange-400 font-bold">
                      {evaluacion.notaMinima}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>

              {/* Cantidad Estudiantes */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconUsers className="size-3.5" /> Total Estudiantes
                </span>
                <span className="font-semibold text-foreground">
                  {estudiantes.length} Alumnos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 3. Formulario de Notas */}
      <section className="relative">
        <NotasForm
          evaluacionId={evaluacionId}
          cursoId={evaluacion.cursoId}
          estudiantes={estudiantes}
          notasExistentes={notasMap}
          escala={evaluacion.escalaCalificacion}
        />
      </section>
    </div>
  );
}
