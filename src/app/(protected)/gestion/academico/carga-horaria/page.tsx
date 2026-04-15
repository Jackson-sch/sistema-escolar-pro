import { IconClock } from "@tabler/icons-react";
import { getCoursesAction, getCurricularAreasAction } from "@/actions/academic";
import { getNivelesAcademicosAction } from "@/actions/students";
import { getStaffAction } from "@/actions/staff";
import { getNivelesAction } from "@/actions/academic-structure";
import { getInstitucionAction } from "@/actions/institucion";
import { columns } from "@/components/gestion/academico/cursos/components/course-table-columns";
import { CourseTable } from "@/components/gestion/academico/cursos/course-table";
import { AddCourseButton } from "@/components/gestion/academico/cursos/add-course-button";

interface CargaHorariaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CargaHorariaPage({ searchParams }: CargaHorariaPageProps) {
  const params = await searchParams;
  const nivelId = typeof params.nivelId === "string" ? params.nivelId : undefined;

  const { data: institucion } = await getInstitucionAction();
  const currentAnio = institucion?.cicloEscolarActual || new Date().getFullYear();

  // Carga paralela de dependencias independientes (solo niveles y staff)
  const [
    { data: niveles = [] },
    { data: staff = [] },
  ] = await Promise.all([
    getNivelesAction(),
    getStaffAction(),
  ]);

  // Filtrar solo los profesores para el selector
  const profesores = staff.filter((s: any) => s.role === "profesor");

  let courses: any[] = [];
  let areas: any[] = [];
  let nivelesAcademicos: any[] = [];

  // 1. Si hay Nivel seleccionado, cargar los datos pesados
  if (nivelId) {
    const [fetchedCourses, fetchedAreas, fetchedNivelesAcademicos] = await Promise.all([
      getCoursesAction({ nivelId, anioAcademico: currentAnio }),
      getCurricularAreasAction(nivelId),
      getNivelesAcademicosAction(currentAnio, nivelId),
    ]);
    courses = fetchedCourses.data || [];
    areas = fetchedAreas.data || [];
    nivelesAcademicos = fetchedNivelesAcademicos.data || [];
  }

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define las materias y profesores para cada curso...
        </p>
        <AddCourseButton
          areas={areas as any}
          nivelesAcademicos={nivelesAcademicos as any}
          profesores={profesores}
          currentAnio={currentAnio}
        />
      </div>

      <CourseTable
        columns={columns}
        data={courses}
        meta={{
          areas,
          nivelesAcademicos,
          profesores,
          niveles,
          currentAnio,
          institucion,
        }}
      />
    </div>
  );
}
