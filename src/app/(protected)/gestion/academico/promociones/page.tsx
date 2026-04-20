import { Suspense } from "react";
import { getInstitucionAction } from "@/actions/institucion";
import { 
  getAniosAcademicosAction, 
  getSeccionesAction,
  getGradosAction
} from "@/actions/academic-structure";
import { PromocionesView } from "@/components/gestion/academico/promociones/promociones-view";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Cierre de Año y Promociones | Sistema Escolar",
  description: "Gestión de transición masiva de estudiantes entre ciclos escolares.",
};

export default async function PromocionesPage(props: {
  searchParams: Promise<{ anioOrigen?: string; anioDestino?: string }>;
}) {
  const searchParams = await props.searchParams;
  const institucionRes = await getInstitucionAction();
  const currentYear = institucionRes.data?.cicloEscolarActual || new Date().getFullYear();
  
  const anioOrigen = searchParams.anioOrigen ? parseInt(searchParams.anioOrigen) : currentYear;
  const anioDestino = searchParams.anioDestino ? parseInt(searchParams.anioDestino) : currentYear + 1;

  const institucionId = institucionRes.data?.id || "";

  // Obtener datos iniciales
  const [aniosRes, seccionesOrigenRes, seccionesDestinoRes, gradosRes] = await Promise.all([
    getAniosAcademicosAction(),
    getSeccionesAction({ anioAcademico: anioOrigen, institucionId }),
    getSeccionesAction({ anioAcademico: anioDestino, institucionId }),
    getGradosAction()
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cierre de Año y Promociones</h2>
          <p className="text-muted-foreground">
            Gestión masiva de estudiantes para el nuevo ciclo escolar {anioDestino}.
          </p>
        </div>
      </div>

      <Suspense fallback={<PromocionesSkeleton />}>
        <PromocionesView 
          aniosDisponibles={aniosRes.data || [currentYear]}
          seccionesOrigen={seccionesOrigenRes.data || []}
          seccionesDestino={seccionesDestinoRes.data || []}
          grados={gradosRes.data || []}
          anioOrigen={anioOrigen}
          anioDestino={anioDestino}
          institucionId={institucionId}
        />
      </Suspense>
    </div>
  );
}

function PromocionesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <Card className="p-6 rounded-3xl h-96">
        <Skeleton className="h-full w-full rounded-2xl" />
      </Card>
    </div>
  );
}
