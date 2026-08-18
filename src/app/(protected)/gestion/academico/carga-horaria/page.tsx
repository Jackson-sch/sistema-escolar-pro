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
  const rawNivelId = typeof params.nivelId === "string" ? params.nivelId : undefined;

  const { data: institucion } = await getInstitucionAction();
  const currentAnio = institucion?.cicloEscolarActual || new Date().getFullYear();

  // Carga paralela de niveles y staff
  const [
    { data: niveles = [] },
    { data: staff = [] },
  ] = await Promise.all([
    getNivelesAction(),
    getStaffAction(),
  ]);

  // Filtrar solo los profesores para el selector
  const profesores = staff.filter((s: any) => s.role === "profesor");

  // Auto-seleccionar el primer nivel activo si no viene nivelId en la URL
  const activeNivelId = rawNivelId || (niveles.length > 0 ? niveles[0].id : undefined);

  let courses: any[] = [];
  let areas: any[] = [];
  let nivelesAcademicos: any[] = [];

  if (activeNivelId) {
    const [fetchedCourses, fetchedAreas, fetchedNivelesAcademicos] = await Promise.all([
      getCoursesAction({ nivelId: activeNivelId, anioAcademico: currentAnio }),
      getCurricularAreasAction(activeNivelId),
      getNivelesAcademicosAction(currentAnio, activeNivelId),
    ]);
    courses = fetchedCourses.data || [];
    areas = fetchedAreas.data || [];
    nivelesAcademicos = fetchedNivelesAcademicos.data || [];
  }

  return (
    <div className="space-y-6 p-4 md:p-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Carga Horaria y Asignación Docente
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Gestiona la malla curricular, horas semanales y profesores responsables por cada curso y sección.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <AddCourseButton
            areas={areas as any}
            nivelesAcademicos={nivelesAcademicos as any}
            profesores={profesores}
            currentAnio={currentAnio}
          />
        </div>
      </div>

      {/* ── TABLA CON FILTROS E INDICADORES KPI ── */}
      <CourseTable
        columns={columns}
        data={courses}
        activeNivelId={activeNivelId}
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
