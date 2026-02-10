import {
  IconSchool,
  IconMapPin,
  IconCalendar,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { formatDate } from "@/lib/formats";
import { MagicCard } from "@/components/ui/magic-card";

interface StudentGeneralInfoProps {
  student: StudentTableType;
}

export function StudentGeneralInfo({ student }: StudentGeneralInfoProps) {
  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Formación Académica */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Formación Académica
          </h3>
        </div>

        <MagicCard
          gradientFrom={student.nivelAcademico ? "#3b82f6" : "#ef4444"}
          gradientTo={student.nivelAcademico ? "#60a5fa" : "#f87171"}
          gradientColor={student.nivelAcademico ? "#3b83f622" : "#f8717122"}
          className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-0"
        >
          <div className="p-0 flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-primary/10 bg-primary/5">
            {student.nivelAcademico ? (
              <>
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Grado y Sección
                  </span>
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconSchool className="size-4 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {student.nivelAcademico.grado.nombre} -{" "}
                      {student.nivelAcademico.seccion}
                    </p>
                  </div>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Nivel Académico
                  </span>
                  <Badge
                    variant="outline"
                    className="w-fit bg-primary/10 text-primary"
                  >
                    {student.nivelAcademico.nivel?.nombre || "N/A"}
                  </Badge>
                </div>
                {student.nivelAcademico.sede && (
                  <div className="p-3 flex-1 flex flex-col gap-2 border-l border-primary/10">
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Sede / Local
                    </span>
                    <Badge
                      variant="outline"
                      className="w-fit bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold"
                    >
                      {student.nivelAcademico.sede.nombre}
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 w-full flex items-center gap-4 bg-gradient-to-br from-destructive/5 to-transparent">
                <div className="size-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <IconAlertCircle className="size-5 text-destructive" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-bold text-destructive uppercase tracking-tight">
                    Sin Matrícula Activa
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Ciclo Académico 2026
                  </p>
                </div>
              </div>
            )}
          </div>
        </MagicCard>
      </section>

      {/* Localización */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Localización
          </h3>
        </div>

        <MagicCard
          gradientFrom="#3b82f6"
          gradientTo="#60a5fa"
          gradientColor="#3b83f622"
          className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-0"
        >
          <div className="p-3 flex flex-col gap-3 bg-primary/5">
            <div className="flex gap-3 items-start">
              <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                <IconMapPin className="size-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground/85 leading-relaxed">
                {student.direccion}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg border border-border/40">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Distrito
                </span>
                <span className="text-sm font-bold text-foreground">
                  {student.distrito}
                </span>
              </div>
              <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg border border-border/40">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Provincia
                </span>
                <span className="text-sm font-bold text-foreground">
                  {student.provincia}
                </span>
              </div>
            </div>
          </div>
        </MagicCard>
      </section>

      {/* Registro */}
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
            Registro
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Fecha Ingreso */}
          <MagicCard
            gradientFrom="#3b82f6"
            gradientTo="#60a5fa"
            gradientColor="#3b83f622"
            className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-0"
          >
            <div className="p-3 flex flex-col gap-3 bg-primary/5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Fecha Ingreso
              </span>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconCalendar className="size-4 text-primary" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  {student.createdAt
                    ? formatDate(student.createdAt, "PPP")
                    : "---"}
                </span>
              </div>
            </div>
          </MagicCard>

          {/* Nacionalidad */}
          <MagicCard
            gradientFrom="#3b82f6"
            gradientTo="#60a5fa"
            gradientColor="#3b83f622"
            className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-0"
          >
            <div className="p-3 flex flex-col gap-3 pb-5 bg-primary/5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Nacionalidad
              </span>
              <div className="flex items-center gap-2.5">
                <Badge variant="secondary" className="text-[11px]">
                  PE
                </Badge>
                <span className="text-sm font-bold text-foreground">
                  {student.nacionalidad}
                </span>
              </div>
            </div>
          </MagicCard>
        </div>
      </section>
    </div>
  );
}
