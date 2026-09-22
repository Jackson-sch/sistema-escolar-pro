"use client";

import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RouteError({ reset, homeUrl }: { reset: () => void; homeUrl: string }) {
  const router = useRouter();
  return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center"><div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive"><IconAlertTriangle className="size-6" /></div><div className="space-y-1"><h2 className="text-xl font-bold">No pudimos cargar esta sección</h2><p className="max-w-md text-sm text-muted-foreground">Comprueba tu conexión e inténtalo otra vez. Si el problema continúa, contacta a la institución.</p></div><div className="flex flex-wrap justify-center gap-2"><Button onClick={reset}><IconRefresh className="mr-2 size-4" />Intentar nuevamente</Button><Button variant="outline" onClick={() => router.push(homeUrl)}><IconHome className="mr-2 size-4" />Volver al inicio</Button></div></div>;
}
