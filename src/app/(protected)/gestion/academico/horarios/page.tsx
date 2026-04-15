import { getInstitucionAction } from "@/actions/institucion"
import { getNivelesAcademicosAction } from "@/actions/students"
import { getCoursesAction } from "@/actions/academic"
import { ScheduleManager } from "@/components/gestion/academico/horarios/schedule-manager"

export default async function HorariosPage(props: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const searchParams = await props.searchParams;
  const institucionRes = await getInstitucionAction();
  const currentCycle = institucionRes.data?.cicloEscolarActual || new Date().getFullYear();
  const selectedYear = searchParams.anio ? parseInt(searchParams.anio) : currentCycle;

  const [
    { data: secciones = [] },
    { data: courses = [] }
  ] = await Promise.all([
    getNivelesAcademicosAction(selectedYear),
    getCoursesAction({ anioAcademico: selectedYear })
  ])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Gestión de Horarios</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Organiza las horas de clase por sección y evita traslapes de docentes.
          </p>
        </div>
      </div>

      <ScheduleManager
        secciones={secciones as any}
        allCourses={courses as any}
        selectedYear={selectedYear}
      />
    </div>
  )
}
