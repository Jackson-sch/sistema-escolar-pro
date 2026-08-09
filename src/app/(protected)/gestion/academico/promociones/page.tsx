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
  title: "Cierre de Año y Promociones | EduNova Pro",
  description: "Gestión de transición masiva de estudiantes entre ciclos escolares.",
};

export default async function PromocionesPage(props: {
  searchParams: Promise<{ anioOrigen?: string; anioDestino?: string }>;
}) {
  // Obtener datos iniciales en paralelo (incl. searchParams)
  const [searchParams, institucionRes, aniosRes] = await Promise.all([
    props.searchParams,
    getInstitucionAction(),
    getAniosAcademicosAction(),
  ]);
  const currentYear = institucionRes.data?.cicloEscolarActual || new Date().getFullYear();

  const anioOrigen = searchParams.anioOrigen ? parseInt(searchParams.anioOrigen) : currentYear;
  const anioDestino = searchParams.anioDestino ? parseInt(searchParams.anioDestino) : currentYear + 1;

  const institucionId = institucionRes.data?.id || "";

  const [seccionesOrigenRes, seccionesDestinoRes, gradosRes] = await Promise.all([
    getSeccionesAction({ anioAcademico: anioOrigen, institucionId }),
    getSeccionesAction({ anioAcademico: anioDestino, institucionId }),
    getGradosAction(),
  ]);

  return (
    <div className="space-y-4 px-2">
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
