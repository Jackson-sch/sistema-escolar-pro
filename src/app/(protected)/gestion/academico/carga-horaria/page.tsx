import { IconClock } from "@tabler/icons-react"
import { getCoursesAction, getCurricularAreasAction } from "@/actions/academic"
import { getNivelesAcademicosAction } from "@/actions/students"
import { getStaffAction } from "@/actions/staff"
import { columns } from "@/components/gestion/academico/course-table-columns"
import { CourseTable } from "@/components/gestion/academico/course-table"
import { AddCourseButton } from "@/components/gestion/academico/add-course-button"

export default async function CargaHorariaPage() {
  // Carga paralela de dependencias para la carga horaria
  const [
    { data: courses = [] },
    { data: areas = [] },
    { data: nivelesAcademicos = [] },
    { data: staff = [] }
  ] = await Promise.all([
    getCoursesAction(),
    getCurricularAreasAction(),
    getNivelesAcademicosAction(),
    getStaffAction()
  ])

  // Filtrar solo los profesores para el selector
  const profesores = staff.filter((s: any) => s.role === "profesor")

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
        />
      </div>

      <CourseTable
        columns={columns}
        data={courses as any}
        meta={{
          areas,
            nivelesAcademicos,
            profesores
          }}
        />
    </div>
  )
}
