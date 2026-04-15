import { Suspense } from "react";
import { 
  getNivelesAction, 
  getGradosAction, 
  getSeccionesAction,
  getTutoresAction
} from "@/actions/academic-structure";
import { getSedesAction, getInstitucionAction } from "@/actions/institucion";
import { EstructuraDashboard } from "@/components/gestion/academico/estructura/estructura-dashboard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Estructura Académica | Sistema Escolar",
  description: "Gestión de niveles, grados y secciones de la institución.",
};

export default async function EstructuraPage(props: {
  searchParams: Promise<{ anio?: string }>;
}) {
  const searchParams = await props.searchParams;
  const institucionRes = await getInstitucionAction();
  const currentCycle = institucionRes.data?.cicloEscolarActual || new Date().getFullYear();
  const selectedYear = searchParams.anio ? parseInt(searchParams.anio) : currentCycle;

  const institucionId = institucionRes.data?.id || "";

  // Fetch initial data
  const [
    nivelesRes, 
    gradosRes, 
    seccionesRes, 
    tutoresRes,
    sedesRes
  ] = await Promise.all([
    getNivelesAction(institucionId),
    getGradosAction(), // Fetch all grades for now, we filter in client
    getSeccionesAction({ anioAcademico: selectedYear, institucionId }),
    getTutoresAction(),
    getSedesAction()
  ]);

  return (
    <div className="flex-1 space-y-4">
      <Suspense fallback={<EstructuraSkeleton />}>
        <EstructuraDashboard 
          initialNiveles={nivelesRes.data || []}
          initialGrados={gradosRes.data || []}
          initialSecciones={seccionesRes.data || []}
          tutores={tutoresRes.data || []}
          sedes={sedesRes.data || []}
          selectedYear={selectedYear}
          institucionId={institucionRes.data?.id || ""}
        />
      </Suspense>
    </div>
  );
}

function EstructuraSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-250px)]">
      <div className="col-span-1 md:col-span-3 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="col-span-1 md:col-span-9">
        <Card className="h-full rounded-3xl p-6">
          <div className="space-y-8">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-40 rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
