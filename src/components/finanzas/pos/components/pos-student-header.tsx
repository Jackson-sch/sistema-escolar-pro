"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { StudentCobroData } from "./pos-types";

interface POSStudentHeaderProps {
  studentData: StudentCobroData;
}

export function POSStudentHeader({ studentData }: POSStudentHeaderProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <Avatar className="size-14 rounded-2xl border border-border/60 shrink-0">
          <AvatarImage src={studentData.student.image || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
            {studentData.student.name?.[0]}
            {studentData.student.apellidoPaterno?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-foreground truncate">
            {studentData.student.name} {studentData.student.apellidoPaterno}{" "}
            {studentData.student.apellidoMaterno || ""}
          </h3>
          <p className="text-xs text-muted-foreground">
            {studentData.student.nivelAcademico?.nivel?.nombre} ·{" "}
            {studentData.student.nivelAcademico?.grado?.nombre} &quot;
            {studentData.student.nivelAcademico?.seccion}&quot;
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            DNI: {studentData.student.dni || "S/D"} · Apoderado:{" "}
            {studentData.primaryGuardian?.name || "No registrado"}
          </p>
        </div>
      </div>

      {/* Semáforo Rápido */}
      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40 shrink-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground">
          Deuda Vencida:
        </span>
        <span
          className={cn(
            "text-sm font-extrabold font-mono",
            studentData.resumen.totalDeudaVencida > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {studentData.resumen.totalDeudaVencida > 0
            ? `S/ ${studentData.resumen.totalDeudaVencida.toFixed(2)}`
            : "Al día"}
        </span>
      </div>
    </div>
  );
}
