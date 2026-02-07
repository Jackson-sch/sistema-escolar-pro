import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconUser, IconReceipt } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";

interface StudentCardProps {
  hijo: {
    id: string;
    name: string | null;
    apellidoPaterno: string | null;
    nivelAcademico?: {
      nivel: { nombre: string };
      grado: { nombre: string };
    } | null;
    cronogramaPagos?: Array<{
      monto: number;
      montoPagado: any;
    }>;
  };
}

export function StudentCard({ hijo }: StudentCardProps) {
  const deudaHijo =
    hijo.cronogramaPagos?.reduce(
      (sum, c) => sum + (c.monto - Number(c.montoPagado)),
      0,
    ) || 0;
  const tieneDeuda = deudaHijo > 0;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors">
          <IconUser className="size-8" />
        </div>
        <div>
          <CardTitle className="text-xl capitalize">
            {(hijo.name || "").toLowerCase()}{" "}
            {(hijo.apellidoPaterno || "").toLowerCase()}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {hijo.nivelAcademico
              ? `${hijo.nivelAcademico.nivel.nombre} - ${hijo.nivelAcademico.grado.nombre}`
              : "Sin nivel asignado"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl bg-muted/30 p-4 transition-colors group-hover:bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Estado de Cuenta
            </span>
            {tieneDeuda ? (
              <Badge
                variant="outline"
                className="border-warning/50 bg-warning/10 text-warning"
              >
                Deuda Pendiente
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-success/50 bg-success/10 text-success"
              >
                Al Día
              </Badge>
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Monto Total:</span>
            <span
              className={`text-2xl font-black ${
                tieneDeuda ? "text-warning" : "text-success"
              }`}
            >
              {tieneDeuda ? formatCurrency(deudaHijo) : "S/ 0.00"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            asChild
            className="flex-1 font-bold text-xs h-9 px-2"
            variant={tieneDeuda ? "default" : "outline"}
          >
            <Link href={`/portal/deudas?hijoId=${hijo.id}`}>Deudas</Link>
          </Button>
          <Button
            asChild
            className="flex-1 font-bold text-xs h-9 px-2"
            variant="outline"
          >
            <Link href={`/portal/notas?hijoId=${hijo.id}`}>Notas</Link>
          </Button>
          <Button
            asChild
            className="flex-1 font-bold text-xs h-9 px-2"
            variant="outline"
          >
            <Link href={`/portal/asistencia?hijoId=${hijo.id}`}>
              Asistencia
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 font-bold text-xs h-9 px-2"
            variant="outline"
          >
            <Link href={`/portal/disciplina?hijoId=${hijo.id}`}>Conducta</Link>
          </Button>
          <Button
            asChild
            size="icon"
            variant="outline"
            className="shrink-0 size-9 transition-colors hover:bg-primary hover:text-white"
            title="Ver Boletas"
          >
            <Link href="/portal/boletas">
              <IconReceipt className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
