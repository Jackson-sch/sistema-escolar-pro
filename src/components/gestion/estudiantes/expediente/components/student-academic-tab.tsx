"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconSchool } from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";

export function StudentAcademicTab({ student }: { student: any }) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-2xs">
      <CardHeader className="p-4 sm:p-5">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <IconSchool className="size-4 text-primary" /> Historial de Matrículas
          Anuales
        </CardTitle>
        <CardDescription className="text-xs">
          Registro histórico de periodos cursados en la institución
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0">
        {student.matriculas?.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No hay registros de matrícula histórica.
          </p>
        ) : (
          <div className="divide-y divide-border/40">
            {student.matriculas?.map((m: any) => (
              <div
                key={m.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      Año Académico {m.anioAcademico}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold uppercase"
                    >
                      {m.estado || "Activo"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {m.nivelAcademico?.nivel?.nombre} ·{" "}
                    {m.nivelAcademico?.grado?.nombre} &quot;
                    {m.nivelAcademico?.seccion}&quot;
                    {m.nivelAcademico?.sede?.nombre &&
                      ` (${m.nivelAcademico.sede.nombre})`}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {m.fechaMatricula
                    ? formatDate(m.fechaMatricula)
                    : "Matriculado"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
