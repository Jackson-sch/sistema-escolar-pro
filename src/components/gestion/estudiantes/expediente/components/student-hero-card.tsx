"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  IconId,
  IconCopy,
  IconCalendarCheck,
  IconReceipt,
  IconSchool,
} from "@tabler/icons-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface StudentHeroCardProps {
  student: any;
  fullName: string;
  initials: string;
  asistenciaPorcentaje: number;
  pagosVencidos: any[];
  totalDeuda: number;
}

function StudentIdentitySection({
  student,
  fullName,
  initials,
  onCopy,
}: {
  student: any;
  fullName: string;
  initials: string;
  onCopy: (text: string, message: string) => void;
}) {
  const academicText = student.nivelAcademico ? (
    <>
      {student.nivelAcademico.nivel?.nombre} · {student.nivelAcademico.grado?.nombre} &quot;
      {student.nivelAcademico.seccion}&quot;
      {student.nivelAcademico.sede?.nombre && ` (${student.nivelAcademico.sede.nombre})`}
    </>
  ) : (
    "Sin sección académica asignada"
  );

  return (
    <div className="lg:col-span-5 flex items-center gap-4">
      <Avatar className="size-18 rounded-2xl border-2 border-border/60 shadow-2xs shrink-0">
        <AvatarImage src={student.image || ""} alt={fullName} className="object-cover" />
        <AvatarFallback className="rounded-2xl text-lg font-black bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground truncate">{fullName}</h2>
          <Badge
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0"
            style={{
              backgroundColor: `${student.estado?.color || "#4F46E5"}20`,
              color: student.estado?.color || "#4F46E5",
            }}
          >
            {student.estado?.nombre || "Activo"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{academicText}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
          <button
            type="button"
            onClick={() => onCopy(student.dni || "", "DNI copiado")}
            className="flex items-center gap-1 font-mono hover:text-foreground cursor-pointer"
            title="Copiar DNI"
          >
            <IconId size={13} className="text-primary" />
            <span>DNI: {student.dni || "S/D"}</span>
            <IconCopy size={11} className="opacity-40" />
          </button>
          {student.codigoSiagie && (
            <span className="font-mono text-[11px]">SIAGIE: {student.codigoSiagie}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentKpiTesoreria({
  pagosVencidos,
  totalDeuda,
}: {
  pagosVencidos: any[];
  totalDeuda: number;
}) {
  const isUpToDate = pagosVencidos.length === 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 p-3 rounded-xl border",
        isUpToDate ? "bg-emerald-500/5 border-emerald-500/25" : "bg-rose-500/5 border-rose-500/25"
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <IconReceipt size={13} className="text-primary" /> Tesorería
      </span>
      <span
        className={cn(
          "text-base font-bold font-mono",
          isUpToDate
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-rose-700 dark:text-rose-400"
        )}
      >
        {isUpToDate ? "Al día" : `S/ ${totalDeuda.toFixed(2)}`}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {isUpToDate ? "0 deudas" : `${pagosVencidos.length} cuota(s) vencidas`}
      </span>
    </div>
  );
}

function StudentKpiTutor({ tutor }: { tutor: any }) {
  const tutorName = tutor
    ? `${tutor.name} ${tutor.apellidoPaterno || ""}`
    : "No asignado";

  return (
    <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-muted/20 border border-border/40 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <IconSchool size={13} className="text-primary" /> Tutor de Aula
      </span>
      <span className="text-xs font-bold text-foreground truncate">{tutorName}</span>
      <span className="text-[10px] text-muted-foreground truncate">
        {tutor?.telefono || "Sin teléfono"}
      </span>
    </div>
  );
}

export function StudentHeroCard({
  student,
  fullName,
  initials,
  asistenciaPorcentaje,
  pagosVencidos,
  totalDeuda,
}: StudentHeroCardProps) {
  const { copy } = useCopyToClipboard();

  return (
    <Card className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 rounded-2xl bg-card border border-border/60 shadow-xs">
      <StudentIdentitySection
        student={student}
        fullName={fullName}
        initials={initials}
        onCopy={copy}
      />

      <div className="lg:col-span-7 grid grid-cols-3 gap-2.5 items-center border-t lg:border-t-0 lg:border-l border-border/40 pt-4 lg:pt-0 lg:pl-5">
        <div className="flex flex-col gap-0.5 p-3 rounded-xl bg-muted/20 border border-border/40">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <IconCalendarCheck size={13} className="text-primary" /> Asistencia
          </span>
          <span className="text-base font-bold font-mono text-foreground">
            {asistenciaPorcentaje}%
          </span>
          <span className="text-[10px] text-muted-foreground">Récord en aula</span>
        </div>

        <StudentKpiTesoreria pagosVencidos={pagosVencidos} totalDeuda={totalDeuda} />

        <StudentKpiTutor tutor={student.nivelAcademico?.tutor} />
      </div>
    </Card>
  );
}
