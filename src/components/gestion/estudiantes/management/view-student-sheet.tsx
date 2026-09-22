import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@tabler/icons-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { FamilyManagementTab } from "@/components/gestion/estudiantes/features/familia/family-management-tab";
import { HealthManagementTab } from "@/components/gestion/estudiantes/features/salud/health-management-tab";
import { DisciplineTab } from "@/components/gestion/estudiantes/features/disciplina/discipline-tab";
import { AchievementsTab } from "@/components/gestion/estudiantes/features/logros/achievements-tab";
import { StudentProfileHeader } from "@/components/gestion/estudiantes/components/student-profile-header";
import { StudentGeneralInfo } from "@/components/gestion/estudiantes/components/student-general-info";
import { StudentActionsFooter } from "@/components/gestion/estudiantes/components/student-actions-footer";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";

interface ViewStudentSheetProps {
  student: StudentTableType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isProfessor: boolean;
  onEdit: () => void;
  metaData?: any;
}

const STUDENT_SHEET_TABS = [
  { id: "general", label: "General" },
  { id: "familia", label: "Familia" },
  { id: "salud", label: "Salud" },
  { id: "disciplina", label: "Disciplina" },
  { id: "asistencia", label: "Logros" },
];

export function ViewStudentSheet({
  student,
  isOpen,
  onOpenChange,
  isProfessor,
  onEdit,
  metaData,
}: ViewStudentSheetProps) {
  const [activeTab, setActiveTab] = useState("general");


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 border-l border-border/40 bg-background/95 flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle>Expediente: {student.name}</SheetTitle>
          <SheetDescription>Detalles completos del estudiante</SheetDescription>
        </SheetHeader>

        {/* Header del Perfil - Premium Aesthetic */}
        <StudentProfileHeader student={student} />

        <div className="flex-1 flex flex-col min-h-0 bg-card">
          <div className="px-4 py-2.5 bg-muted/20 border-b border-border/40 flex items-center justify-between gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full h-8.5 rounded-xl font-bold text-xs bg-background border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors shadow-2xs gap-1.5 cursor-pointer"
            >
              <Link href={`/gestion/estudiantes/${student.id}`}>
                <IconExternalLink className="size-3.5" />
                <span>Abrir Expediente 360° Completo</span>
              </Link>
            </Button>
          </div>

          <div className="px-6 shrink-0 bg-background/50 p-2.5">
            <AnimatedTabs
              tabs={STUDENT_SHEET_TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <LazyMotion features={domAnimation}>
                  <m.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "general" && (
                      <StudentGeneralInfo student={student} />
                    )}

                    {activeTab === "familia" && (
                      <FamilyManagementTab
                        studentId={student.id}
                        familyRelations={(student as any).padresTutores || []}
                      />
                    )}

                    {activeTab === "disciplina" && (
                      <DisciplineTab studentId={student.id} />
                    )}

                    {activeTab === "asistencia" && (
                      <AchievementsTab studentId={student.id} />
                    )}

                    {activeTab === "salud" && (
                      <HealthManagementTab student={student} />
                    )}
                  </m.div>
                </LazyMotion>
              </AnimatePresence>
            </div>
          </ScrollArea>

          <StudentActionsFooter
            student={student}
            isProfessor={isProfessor}
            onEdit={onEdit}
            metaData={metaData}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
