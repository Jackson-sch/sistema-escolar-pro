"use client";

import {
  IconClipboardCheck,
  IconCheck,
  IconCalendarStats,
  IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { formatDate } from "@/lib/formats";
import { EvaluacionDocente } from "./teacher-types";

interface TeacherEvaluationsTrayProps {
  evaluationsToGrade: EvaluacionDocente[];
  upcomingEvaluations: EvaluacionDocente[];
}

export function TeacherEvaluationsTray({
  evaluationsToGrade,
  upcomingEvaluations,
}: TeacherEvaluationsTrayProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-md overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <IconClipboardCheck size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Bandeja de Evaluaciones
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Control y cronograma evaluativo
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer"
            asChild
          >
            <Link href="/evaluaciones">Ver todas</Link>
          </Button>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid grid-cols-2 bg-muted/50 p-1 h-8 rounded-xl">
            <TabsTrigger
              value="pending"
              className="text-[11px] font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs transition-colors cursor-pointer"
            >
              Por Calificar ({evaluationsToGrade.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="text-[11px] font-bold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs transition-colors cursor-pointer"
            >
              Próximas ({upcomingEvaluations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="pending"
            className="mt-3 focus-visible:outline-none"
          >
            {evaluationsToGrade.length === 0 ? (
              <div className="py-8 text-center bg-muted/10 rounded-2xl border border-dashed border-border/40 space-y-1.5 px-3">
                <div className="size-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <IconCheck size={18} />
                </div>
                <p className="text-xs font-bold text-foreground">¡Todo al día!</p>
                <p className="text-[11px] text-muted-foreground">
                  No tienes evaluaciones pendientes por ingresar.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {evaluationsToGrade.map((evalu) => (
                  <PendingGradeItem key={evalu.id} evalu={evalu} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="upcoming"
            className="mt-3 focus-visible:outline-none"
          >
            {upcomingEvaluations.length === 0 ? (
              <div className="py-8 text-center bg-muted/10 rounded-2xl border border-dashed border-border/40 space-y-1.5 px-3">
                <IconCalendarStats className="mx-auto size-8 text-muted-foreground/30" />
                <p className="text-xs font-bold text-foreground">
                  Sin evaluaciones próximas
                </p>
                <p className="text-[11px] text-muted-foreground">
                  No hay exámenes programados en los próximos 7 días.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingEvaluations.map((evalu) => (
                  <UpcomingEvaluationItem key={evalu.id} evaluacion={evalu} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PendingGradeItem({ evalu }: { evalu: EvaluacionDocente }) {
  return (
    <Link
      href={`/evaluaciones/${evalu.id}/notas`}
      className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 hover:border-amber-500/30 hover:bg-amber-500/5 transition-colors duration-200 text-xs group cursor-pointer"
    >
      <div className="min-w-0 pr-2 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-amber-500 inline-block animate-pulse" />
          <p className="font-bold text-foreground truncate uppercase text-xs group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {evalu.curso.nombre || evalu.curso.areaCurricular.nombre}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground font-medium pl-3.5">
          {evalu.curso.nivelAcademico.grado.nombre} &ldquo;
          {evalu.curso.nivelAcademico.seccion}&rdquo; •{" "}
          {evalu.tipoEvaluacion.nombre}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Badge
          variant="outline"
          className="text-[10px] font-mono font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5"
        >
          Calificar
        </Badge>
        <IconChevronRight
          size={14}
          className="text-muted-foreground group-hover:translate-x-0.5 transition-transform"
        />
      </div>
    </Link>
  );
}

function UpcomingEvaluationItem({
  evaluacion,
}: {
  evaluacion: EvaluacionDocente;
}) {
  return (
    <Link
      href={`/evaluaciones/${evaluacion.id}/notas`}
      className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/40 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-colors duration-200 text-xs group cursor-pointer"
    >
      <div className="min-w-0 pr-2 space-y-0.5">
        <p className="font-bold text-foreground truncate uppercase text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {evaluacion.curso.nombre || evaluacion.curso.areaCurricular.nombre}
        </p>
        <p className="text-[11px] text-muted-foreground font-medium">
          {evaluacion.curso.nivelAcademico.grado.nombre} &ldquo;
          {evaluacion.curso.nivelAcademico.seccion}&rdquo; •{" "}
          {evaluacion.tipoEvaluacion.nombre}
        </p>
      </div>

      <Badge
        variant="outline"
        className="text-[10px] font-mono font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 shrink-0"
      >
        {formatDate(evaluacion.fecha)}
      </Badge>
    </Link>
  );
}
