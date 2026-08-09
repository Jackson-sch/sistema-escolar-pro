"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconSchool,
  IconUserCheck,
  IconUsers,
  IconBook,
  IconClock,
  IconPencil,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { AssignCourseTeacherDialog } from "./assign-course-teacher-dialog";
import { SectionScheduleDialog } from "./section-schedule-dialog";
import { deleteCourseAction } from "@/actions/academic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/hooks/use-confirm";

interface Tutor {
  id: string;
  name: string;
  apellidoPaterno?: string | null;
  image?: string | null;
}

interface SeccionCurso {
  id: string;
  nombre: string;
  horasSemanales?: number;
  profesor?: Tutor | null;
}

interface Seccion {
  id: string;
  seccion: string;
  turno?: string | null;
  aulaAsignada?: string | null;
  anioAcademico?: string | number;
  capacidad?: number;
  tutor?: Tutor | null;
  students?: unknown[];
  cursos?: SeccionCurso[];
}

interface Grado {
  id: string;
  nombre: string;
}

interface Nivel {
  id: string;
  nombre: string;
}

interface SectionMasterDetailProps {
  seccion: Seccion | undefined;
  grado?: Grado | null;
  nivel?: Nivel | null;
  tutores: Tutor[];
  onEditSection: () => void;
  onDeleteSection: () => void;
  onAssignTutor: () => void;
  onAddCourse?: () => void;
}

export function SectionMasterDetail({
  seccion,
  grado,
  nivel,
  tutores,
  onEditSection,
  onDeleteSection,
  onAssignTutor,
  onAddCourse,
}: SectionMasterDetailProps) {
  const router = useRouter();
  const [courseTeacherModal, setCourseTeacherModal] = useState<{
    open: boolean;
    curso?: SeccionCurso;
  }>({ open: false });
  const [scheduleModal, setScheduleModal] = useState(false);
  const [ConfirmDeleteModal, confirmDelete] = useConfirm(
    "Eliminar Curso de la Sección",
    "¿Estás seguro de eliminar este curso de la sección? Se perderán las notas y horarios asociados a este curso en el aula.",
  );

  if (!seccion) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <IconSchool size={40} className="text-muted-foreground/30" />
        <p className="text-sm font-bold text-muted-foreground">
          Selecciona una sección en el árbol para ver el detalle unificado
        </p>
      </div>
    );
  }

  const handleDeleteCourse = async (cursoId: string) => {
    const ok = await confirmDelete();
    if (!ok) return;

    try {
      const res = await deleteCourseAction(cursoId);
      if (res.success) {
        toast.success("Curso eliminado de la sección");
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al eliminar el curso");
    }
  };

  const tutor = seccion.tutor;
  const estudiantesCount = seccion.students?.length || 0;
  const capacidad = seccion.capacidad || 30;
  const vacantesDisponibles = Math.max(0, capacidad - estudiantesCount);
  const cursos = seccion.cursos || [];

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      <ConfirmDeleteModal />

      {/* ── Encabezado Unificado de la Sección ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-linear-to-br from-primary/10 via-card to-card border border-primary/20 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-xl shadow-md shrink-0">
            {seccion.seccion}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                {grado?.nombre} — Sección &quot;{seccion.seccion}&quot;
              </h2>
              <Badge className="bg-primary/20 text-primary border-none font-bold text-xs">
                {nivel?.nombre || "Académico"}
              </Badge>
              {seccion.turno && (
                <Badge variant="outline" className="font-semibold text-xs border-border/60">
                  Turno: {seccion.turno}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-3">
              <span>Aula: <strong>{seccion.aulaAsignada || "Sin Aula Asignada"}</strong></span>
              <span>•</span>
              <span>Año Lectivo: <strong>{seccion.anioAcademico}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditSection}
            className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          >
            <IconPencil size={14} />
            Editar Sección
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteSection}
            className="rounded-xl h-9 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
          >
            <IconTrash size={14} />
          </Button>
        </div>
      </div>

      {/* ── KPIs Rápidos de Ocupación y Tutor ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Tutor Ficha */}
        <Card className="p-4 rounded-2xl border border-border/50 bg-card/80 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-11 rounded-xl border border-primary/20 shrink-0">
              <AvatarImage src={tutor?.image || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                {tutor ? `${tutor.name?.[0] || ""}${tutor.apellidoPaterno?.[0] || ""}` : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                Tutor / Responsable
              </p>
              <p className="text-sm font-bold truncate">
                {tutor ? `${tutor.name} ${tutor.apellidoPaterno || ""}` : "Sin Tutor Asignado"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAssignTutor}
            className="rounded-xl h-8 px-2.5 text-xs font-bold shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          >
            <IconUserCheck size={14} className="mr-1" />
            {tutor ? "Cambiar" : "Asignar"}
          </Button>
        </Card>

        {/* Vacantes y Ocupación */}
        <Card className="p-4 rounded-2xl border border-border/50 bg-card/80 shadow-sm flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold shrink-0">
            <IconUsers size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
              Estudiantes & Vacantes
            </p>

            <p className="text-sm font-bold">
              {estudiantesCount} Alumnos <span className="text-xs text-emerald-600 font-semibold">({vacantesDisponibles} vacantes libres)</span>
            </p>
          </div>
        </Card>

        {/* Accesos Rápidos Horario / Malla */}
        <Card className="p-4 rounded-2xl border border-border/50 bg-card/80 shadow-sm flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 font-bold shrink-0">
              <IconClock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                Horario Semanal
              </p>
              <p className="text-xs font-bold text-foreground">
                Configuración de horas
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScheduleModal(true)}
            className="rounded-xl h-8 px-3 text-xs font-bold border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 cursor-pointer"
          >
            Ver Horario
          </Button>
        </Card>
      </div>

      {/* ── Cursos y Profesores Impartidos ── */}
      <Card className="p-6 rounded-2xl border border-border/50 bg-card/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <IconBook className="size-5 text-primary" />
            <h3 className="text-base font-bold tracking-tight">
              Cursos y Carga Horaria de la Sección ({cursos.length})
            </h3>
          </div>
          <Button
            size="sm"
            onClick={onAddCourse}
            className="rounded-xl text-xs font-bold h-8 gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
          >
            <IconPlus size={14} />
            Asignar Cursos
          </Button>
        </div>

        {cursos.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground/60 text-xs font-medium italic">
            No se han registrado cursos asignados específicamente a esta sección.
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/30 bg-muted/50 gap-3 transition-colors hover:bg-muted/80 group/course min-w-0"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold uppercase truncate text-foreground">
                      {curso.nombre}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold shrink-0">
                      {curso.horasSemanales || 2} hrs/sem
                    </Badge>
                  </div>

                  {/* Botón Asignación de Docente */}
                  <div className="flex items-center gap-2 pt-0.5 min-w-0">
                    <span className="text-xs text-muted-foreground font-semibold shrink-0">
                      Docente:
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCourseTeacherModal({ open: true, curso })}
                      className="h-7 px-2 text-xs font-semibold rounded-xl border-border/50 bg-background/60 hover:bg-primary/10 hover:text-primary gap-2 transition-colors cursor-pointer min-w-0"
                    >
                      <Avatar className="size-4 border border-primary/20 shrink-0">
                        <AvatarImage src={curso.profesor?.image || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-bold">
                          {curso.profesor ? `${curso.profesor.name?.[0] || ""}${curso.profesor.apellidoPaterno?.[0] || ""}` : "—"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[150px]">
                        {curso.profesor ? `${curso.profesor.name} ${curso.profesor.apellidoPaterno || ""}` : "Sin Docente"}
                      </span>
                      <IconPencil size={11} className="text-muted-foreground/60 shrink-0" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCourse(curso.id)}
                    title="Eliminar Curso de esta sección"
                    className="size-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 transition-colors text-muted-foreground"
                  >
                    <IconTrash size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Dialog para Asignar Docente al Curso (Mismo estilo que Tutor) ── */}
      <AssignCourseTeacherDialog
        open={courseTeacherModal.open}
        onOpenChange={(open) => setCourseTeacherModal({ open })}
        curso={courseTeacherModal.curso}
        tutores={tutores}
      />

      {/* ── Dialog para Ver y Asignar Horario Semanal Inline ── */}
      <SectionScheduleDialog
        open={scheduleModal}
        onOpenChange={setScheduleModal}
        seccion={seccion}
        grado={grado}
        nivel={nivel}
      />
    </div>
  );
}
