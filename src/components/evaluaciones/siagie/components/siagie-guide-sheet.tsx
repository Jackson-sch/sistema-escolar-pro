"use client";

import * as React from "react";
import {
  IconInfoCircle,
  IconDatabase,
  IconChecklist,
  IconAlertTriangle,
  IconFileSpreadsheet,
  IconShieldCheck,
  IconId,
  IconBook2,
} from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface SiagieGuideSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiagieGuideSheet({ open, onOpenChange }: SiagieGuideSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col h-full bg-background border-l border-border/60 shadow-xl overflow-hidden"
      >
        <SheetHeader className="p-5 pb-4 border-b border-border/40 bg-card/60 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider"
            >
              Guía Oficial del Módulo
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] font-bold"
            >
              RVM 094-2020-MINEDU
            </Badge>
          </div>
          <SheetTitle className="text-base font-extrabold flex items-center gap-2">
            <IconInfoCircle className="size-5 text-primary" />
            ¿Cómo Funciona el Validador y Exportador SIAGIE?
          </SheetTitle>
          <SheetDescription className="text-xs">
            Manual interactivo de auditoría pedagógica, consistencia de notas y
            exportación oficial al MINEDU.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-5">
          <div className="space-y-5 pb-10">
            {/* 1. Propósito */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-primary font-bold text-xs">
                <IconShieldCheck className="size-4" />
                <span>1. Propósito y Función Principal</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Este módulo actúa como una <strong>auditoría preventiva institucional</strong> previa
                al cierre de periodo. Revisa en segundos que todas las aulas cuenten con sus notas
                completas, detecta inconsistencias pedagógicas y genera las plantillas oficiales en Excel
                listas para cargar o cotejar con la plataforma web del SIAGIE.
              </p>
            </div>

            {/* 2. Origen de Datos */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <IconDatabase className="size-4" />
                <span>2. Origen de los Datos (100% Oficial en Vivo)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Toda la información es <strong>en tiempo real</strong> extraída directamente de la base de datos
                institucional:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>
                  <strong>Matrículas Activas:</strong> Estudiantes formalmente inscritos en el ciclo escolar del periodo.
                </li>
                <li>
                  <strong>Cursos y Competencias CNEB:</strong> Estructura curricular oficial por grado y nivel.
                </li>
                <li>
                  <strong>Evaluaciones y Calificaciones:</strong> Notas literales (AD, A, B, C) y conclusiones descriptivas ingresadas por los profesores.
                </li>
                <li>
                  <strong>Asistencia:</strong> Consolidado de presentes, tardanzas y faltas justificadas del periodo.
                </li>
              </ul>
            </div>

            {/* 3. Código Estudiante vs Código SIAGIE */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                <IconId className="size-4" />
                <span>3. Código de Estudiante vs Código SIAGIE</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                  <p className="font-semibold text-foreground">Código de Matrícula Interno (ej. EST029)</p>
                  <p>
                    Generado automáticamente por el colegio al matricular. Identifica formalmente al alumno
                    y se usa como respaldo automático en la exportación si aún no se cuenta con el código ministerial.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1">
                  <p className="font-semibold text-foreground">Código SIAGIE Ministerial (14 dígitos)</p>
                  <p>
                    Código emitido por el MINEDU. Puede registrarse en la ficha del alumno una vez obtenida
                    la nómina oficial o dejarse en blanco mientras se utiliza el código de matrícula.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Semáforo de Auditoría */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <IconChecklist className="size-4" />
                <span>4. Semáforo de Estado de Aulas</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span className="font-extrabold mt-0.5">✓ LISTO (100%):</span>
                  <span>Todas las notas registradas y sin inconsistencias pedagógicas pendientes.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300">
                  <span className="font-extrabold mt-0.5">⚠️ OBSERVADO (≥80%):</span>
                  <span>Avance alto, pero con notas "C" sin conclusión o algunos alumnos rezagados.</span>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                  <span className="font-extrabold mt-0.5">❌ INCOMPLETO (&lt;80%):</span>
                  <span>Evaluaciones sin calificar o baja cobertura de registro docente.</span>
                </div>
              </div>
            </div>

            {/* 5. Normativa CNEB */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                <IconBook2 className="size-4" />
                <span>5. Regla Obligatoria para Calificación "C"</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Según la <strong>RVM N° 094-2020-MINEDU</strong>, toda calificación literal <strong>"C"</strong> en
                Inicial y Primaria exige obligatoriamente una <strong>Conclusión Descriptiva</strong> que señale los
                avances y dificultades del estudiante. El validador detecta automáticamente notas "C" huérfanas de
                conclusión para evitar observaciones de la UGEL.
              </p>
            </div>

            {/* 6. Formatos de Exportación */}
            <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <IconFileSpreadsheet className="size-4" />
                <span>6. Exportaciones Oficiales Disponibles</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                <li>
                  <strong>Excel por Aula:</strong> Descarga individual con encabezados institucionales oficiales, notas literales y conclusiones descriptivas por competencia.
                </li>
                <li>
                  <strong>Descarga Masiva de Calificaciones:</strong> Un solo libro consolidado en Excel con cada sección dividida en una pestaña independiente.
                </li>
                <li>
                  <strong>Consolidado de Asistencia:</strong> Reporte con días asistidos, tardanzas y faltas justificadas del periodo académico.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
