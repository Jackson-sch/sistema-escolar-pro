"use client";

import { Badge } from "@/components/ui/badge";
import { BriefingCards } from "./components/briefing-cards";
import { QuickAccessGrid } from "./components/quick-access-grid";

interface QuickSummaryHeroProps {
  studentId?: string;
  studentName: string;
  studentGrade?: string;
  asistenciaHoy?: {
    presente: boolean;
    tardanza: boolean;
    horaLlegada?: string | null;
    justificada?: boolean;
  } | null;
  payments?: {
    overdue: any[];
    upcoming: any[];
    totalDeuda: number;
  };
  attendancePercentage?: number;
}

export function QuickSummaryHero({
  studentId = "",
  studentName,
  studentGrade,
  asistenciaHoy,
  payments,
  attendancePercentage = 95,
}: QuickSummaryHeroProps) {
  const firstName = studentName?.split(" ")[0] || "Tu hijo(a)";

  return (
    <div className="space-y-4">
      {/* ── 1. "EL PARTE DEL DÍA" (DAILY BRIEFING CARD) ── */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>El Parte de Hoy para {firstName}</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {studentGrade ? `${studentGrade} · ` : ""}Información institucional en tiempo real
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit text-[11px] font-semibold border-primary/30 text-primary bg-primary/5"
          >
            Actualizado hoy
          </Badge>
        </div>

        {/* 3 Preguntas Clave para el Apoderado */}
        <BriefingCards
          asistenciaHoy={asistenciaHoy}
          payments={payments}
          attendancePercentage={attendancePercentage}
        />
      </div>

      {/* ── 2. ACCESOS DIRECTOS MOBILE-FIRST (6 BOTONES TÁCTILES) ── */}
      <QuickAccessGrid studentId={studentId} />
    </div>
  );
}
