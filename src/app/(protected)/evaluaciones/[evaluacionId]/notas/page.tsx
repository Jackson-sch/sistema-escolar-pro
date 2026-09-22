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
import {
  getEvaluacionDetailAction,
  getNotasEvaluacionAction,
  getEstudiantesCursoAction,
} from "@/actions/evaluations";
import { NotasForm } from "@/components/evaluaciones/notas/notas-form";
import { PageHeader } from "@/components/common/page-header";

interface NotasPageProps {
  params: Promise<{ evaluacionId: string }>;
}

export default async function NotasPage({ params }: NotasPageProps) {
  const { evaluacionId } = await params;

  // Obtener la evaluación con todos sus datos relacionados
  const evaluacionRes = await getEvaluacionDetailAction({ evaluacionId });
  const evaluacion = evaluacionRes.success;

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
      acc: Record<string, { valor: number; valorLiteral?: string; comentario?: string }>,
      nota: any,
    ) => {
      acc[nota.estudianteId] = {
        valor: nota.valor,
        valorLiteral: nota.valorLiteral || undefined,
        comentario: nota.comentario || undefined,
      };
      return acc;
    },
    {},
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      {/* 1. Header Compacto Institucional */}
      <PageHeader
        icon={<IconClipboardList size={20} />}
        title={evaluacion.nombre}
        badge={evaluacion.tipoEvaluacion.nombre}
        description={`${evaluacion.curso.nombre} · ${evaluacion.curso.nivelAcademico?.grado.nombre} "${evaluacion.curso.nivelAcademico?.seccion}" · ${evaluacion.curso.areaCurricular.nombre}`}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/evaluaciones" },
          { label: "Evaluaciones", href: "/evaluaciones" },
          { label: "Registro de Calificaciones" },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-border/60 text-xs font-bold gap-1.5"
          >
            <Link href="/evaluaciones">
              <IconArrowLeft className="size-4" />
              Volver
            </Link>
          </Button>
        }
      />

      {/* 2. Tarjetas Bento de Metadatos de la Evaluación */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/50 shadow-2xs">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconCalendar className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Periodo
            </span>
            <span className="text-xs font-bold text-foreground truncate">
              {evaluacion.periodo.nombre}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/50 shadow-2xs">
          <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <IconScale className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Ponderación
            </span>
            <span className="text-xs font-bold text-foreground">
              {evaluacion.peso}% de la nota
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/50 shadow-2xs">
          <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <IconSchool className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Escala
            </span>
            <span className="text-xs font-bold text-foreground">
              {evaluacion.escalaCalificacion === "LITERAL"
                ? "CNEB (AD, A, B, C)"
                : "Vigesimal (0-20)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 backdrop-blur-xs border border-border/50 shadow-2xs">
          <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <IconUsers className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Padrón Aula
            </span>
            <span className="text-xs font-bold text-foreground">
              {estudiantes.length} Alumnos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Formulario de Notas */}
      <section className="relative">
        <NotasForm
          evaluacionId={evaluacionId}
          cursoId={evaluacion.cursoId}
          estudiantes={estudiantes as any}
          notasExistentes={notasMap}
          escala={evaluacion.escalaCalificacion}
          cursoNombre={evaluacion.curso.nombre}
          evaluacionNombre={evaluacion.nombre}
        />
      </section>
    </div>
  );
}
