import { auth } from "@/auth";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { AdmissionsTable } from "@/components/dashboard/admissions-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getDashboardStatsAction,
  getRecentAdmissionsAction,
  getTeacherDashboardAction,
} from "@/actions/dashboard";
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard";
import { redirect } from "next/navigation";
import { getInstitucionAction } from "@/actions/institucion";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;

  // Renderizado condicional basado en el rol
  if (userRole === "profesor") {
    const teacherData = await getTeacherDashboardAction({});

    return (
      <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
        <div className="flex flex-col gap-1 mb-2 px-4 sm:px-2">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            Panel del Docente
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Bienvenido, {session.user.name}. Aquí tienes un resumen de tus
            cursos y alumnos.
          </p>
        </div>

        {teacherData.success && <TeacherDashboard data={teacherData.success} />}
      </div>
    );
  }

  // Vista para Administradores, Directores y Administrativos
  const [statsRes, admissionsRes, institucionRes] = await Promise.all([
    getDashboardStatsAction({}),
    getRecentAdmissionsAction({}),
    getInstitucionAction(),
  ]);

  const stats = statsRes.success;
  const admissions = admissionsRes.success || [];
  const institucion = institucionRes.data || [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col gap-1 mb-2 px-4 sm:px-2">
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
          Dashboard Institucional
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Bienvenido al panel de control de {institucion?.nombreInstitucion}. Vista general del
          periodo {institucion?.cicloEscolarActual}.
        </p>
      </div>

      <SectionCards stats={stats} />

      <div className="grid gap-6 px-2 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartAreaInteractive data={stats?.chartData} />
        </div>
        <div className="lg:col-span-4">
          <Card className="h-full">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Admisiones Recientes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AdmissionsTable students={admissions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
