import { getInstitucionAction } from "@/actions/institucion"
import { getNivelesAcademicosAction } from "@/actions/students"
import { getCoursesAction } from "@/actions/academic"
import { ScheduleManager } from "@/components/gestion/academico/horarios/schedule-manager"
import { Suspense } from "react"

export default async function HorariosPage(props: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const [searchParams, institucionRes] = await Promise.all([
    props.searchParams,
    getInstitucionAction(),
  ]);
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
    <div className="flex flex-1 flex-col gap-4 @container/main">
      <Suspense fallback={<div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />}>
        <ScheduleManager
          secciones={secciones as any}
          allCourses={courses as any}
          selectedYear={selectedYear}
        />
      </Suspense>
    </div>
  )
}
