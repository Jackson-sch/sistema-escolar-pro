"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconBook, IconUsers, IconClock } from "@tabler/icons-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteCourseAction } from "@/actions/academic";
import { ConfirmModal } from "@/components/modals/confirm-modal";

import { SectionDetailHeader } from "./section-detail-header";
import { SectionKpiSummary } from "./section-kpi-summary";
import { SectionCoursesTab } from "./section-courses-tab";
import { SectionStudentsTab } from "./section-students-tab";
import { SectionScheduleTab } from "./section-schedule-tab";
import { AssignCourseTeacherDialog } from "./assign-course-teacher-dialog";
import { SectionScheduleDialog } from "./section-schedule-dialog";

interface SectionMasterDetailProps {
  seccion: any;
  grado?: any;
  nivel?: any;
  tutores: any[];
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
  const [activeTab, setActiveTab] = useState<"courses" | "students" | "schedule">("courses");

  // Dialog states
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);
  const [selectedCursoForTeacher, setSelectedCursoForTeacher] = useState<any>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  if (!seccion) return null;

  const cursos = seccion.cursos || [];
  const enrollment = seccion._count?.matriculas ?? seccion._count?.students ?? 0;
  const capacity = seccion.capacidad || 30;
  const totalHours = cursos.reduce((acc: number, c: any) => acc + (c.horasSemanales || 2), 0);
  const assignedTeachersCount = cursos.filter((c: any) => !!c.profesorId || !!c.profesor).length;

  const handleOpenAssignTeacher = (curso: any) => {
    setSelectedCursoForTeacher(curso);
    setTeacherDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourseId) return;
    setIsDeletingCourse(true);
    try {
      const res = await deleteCourseAction(deletingCourseId);
      if (res.success) {
        toast.success(res.success);
        setDeletingCourseId(null);
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } finally {
      setIsDeletingCourse(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <SectionDetailHeader
        seccion={seccion}
        grado={grado}
        nivel={nivel}
        onEditSection={onEditSection}
        onDeleteSection={onDeleteSection}
      />

      {/* 2. KPI Summary Cards */}
      <SectionKpiSummary
        tutor={seccion.tutor}
        enrollment={enrollment}
        capacity={capacity}
        totalCourses={cursos.length}
        totalHours={totalHours}
        assignedTeachersCount={assignedTeachersCount}
        onAssignTutor={onAssignTutor}
        onSelectStudentsTab={() => setActiveTab("students")}
        onSelectScheduleTab={() => setActiveTab("schedule")}
      />

      {/* 3. Interactive Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full h-10 p-1 rounded-xl bg-muted/60 border border-border/40">
          <TabsTrigger
            value="courses"
            className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer"
          >
            <IconBook className="size-3.5 text-primary" />
            <span>Cursos ({cursos.length})</span>
          </TabsTrigger>

          <TabsTrigger
            value="students"
            className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer"
          >
            <IconUsers className="size-3.5 text-emerald-500" />
            <span>Nómina ({enrollment})</span>
          </TabsTrigger>

          <TabsTrigger
            value="schedule"
            className="rounded-lg text-xs font-bold gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs cursor-pointer"
          >
            <IconClock className="size-3.5 text-indigo-500" />
            <span>Horario Semanal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-0 focus-visible:outline-none">
          <SectionCoursesTab
            cursos={cursos}
            onAddCourse={onAddCourse}
            onAssignTeacher={handleOpenAssignTeacher}
            onDeleteCourse={(id) => setDeletingCourseId(id)}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-0 focus-visible:outline-none">
          <SectionStudentsTab
            seccionId={seccion.id}
            capacity={capacity}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-0 focus-visible:outline-none">
          <SectionScheduleTab
            seccionId={seccion.id}
            onOpenScheduleEditor={() => setScheduleDialogOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedCursoForTeacher && (
        <AssignCourseTeacherDialog
          open={teacherDialogOpen}
          onOpenChange={(open) => {
            setTeacherDialogOpen(open);
            if (!open) setSelectedCursoForTeacher(null);
          }}
          curso={selectedCursoForTeacher}
          tutores={tutores}
        />
      )}

      <SectionScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        seccion={seccion}
        grado={grado}
        nivel={nivel}
      />

      <ConfirmModal
        isOpen={!!deletingCourseId}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={handleDeleteCourse}
        loading={isDeletingCourse}
        title="Eliminar Asignatura"
        description="¿Estás seguro de eliminar este curso del aula? Se desvincularán los horarios y evaluaciones asociadas."
      />
    </div>
  );
}
