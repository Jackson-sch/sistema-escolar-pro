"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconArrowUpRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface AcademicRiskTableProps {
  students: any[];
}

export function AcademicRiskTable({ students = [] }: AcademicRiskTableProps) {
  const handleOpenWhatsapp = (phone: string, studentName: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Estimado(a) padre/madre de familia, nos comunicamos de la Dirección Académica para coordinar apoyo y reforzamiento pedagógico para el estudiante ${studentName}.`,
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs overflow-hidden">
      <CardHeader className="py-3.5 px-4 sm:px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <IconAlertTriangle className="size-4 text-rose-500" />
            Alerta Temprana Pedagógica
          </CardTitle>
          <CardDescription className="text-xs">
            Estudiantes que requieren reforzamiento académico inmediato
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold text-primary gap-1 cursor-pointer"
          asChild
        >
          <Link href="/evaluaciones">
            Ver todas <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No se registran calificaciones en riesgo actualmente. ¡Excelente desempeño general!
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {students.map((item, idx) => {
              const student = item.estudiante;
              const fullName = `${student?.name || ""} ${student?.apellidoPaterno || ""}`.trim();
              const guardian = student?.padresTutores?.[0]?.padreTutor;
              const phone = guardian?.telefono;

              return (
                <div
                  key={`${student?.id}-${item.curso?.nombre}-${idx}`}
                  className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {fullName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-border/60 text-muted-foreground"
                      >
                        {student?.nivelAcademico?.grado?.nombre || "N/A"}{" "}
                        {student?.nivelAcademico?.seccion || ""}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Curso:{" "}
                      <span className="font-semibold text-foreground">
                        {item.curso?.nombre || "Curso"}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono font-bold text-xs px-2 py-0.5">
                      Nota: {item.valor}
                    </Badge>

                    {phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenWhatsapp(phone, fullName)}
                        className="h-8 px-2.5 text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
                        title={`Coordinar con apoderado ${guardian.name || ""}`}
                      >
                        <IconBrandWhatsapp className="size-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
