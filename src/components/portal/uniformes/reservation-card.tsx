import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { actualizarEstadoVentaUniformeAction } from "@/actions/uniformes";
import {
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  ArrowRight,
  Building2,
  Shirt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formats";

export default function ReservationCard({ venta }: { venta: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const getStatusInfo = (estado: string) => {
    switch (estado) {
      case "RESERVADO":
        return {
          icon: <Clock className="h-5 w-5" />,
          text: "En revisión",
          color: "bg-amber-100 text-amber-600 border-amber-200",
          description: "La administración está validando tu reserva.",
        };
      case "APROBADO":
        return {
          icon: <CheckCircle2 className="h-5 w-5" />,
          text: "Pago Pendiente",
          color: "bg-blue-100 text-blue-600 border-blue-200",
          description:
            "Reserva aprobada. Por favor, realiza el pago para el recojo.",
        };
      case "ENTREGADO":
        return {
          icon: <Package className="h-5 w-5" />,
          text: "Entregado",
          color: "bg-green-100 text-green-600 border-green-200",
          description: "Prendas recolectadas exitosamente.",
        };
      case "CANCELADO":
        return {
          icon: <XCircle className="h-5 w-5" />,
          text: "Cancelado",
          color: "bg-red-100 text-red-600 border-red-200",
          description: "Reserva cancelada.",
        };
      default:
        return {
          icon: <ArrowRight className="h-5 w-5" />,
          text: estado,
          color: "bg-slate-100 text-slate-600 border-slate-200",
          description: "",
        };
    }
  };

  const statusInfo = getStatusInfo(venta.estado);

  return (
    <div className="space-y-2 rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-4 pb-4">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-2xl flex items-center justify-center ${statusInfo.color} shrink-0`}
          >
            {statusInfo.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono tracking-wider text-primary">
                {venta.codigo}
              </span>
              <Badge
                className={`rounded-full px-2 py-0 border ${statusInfo.color} font-black text-[10px]`}
              >
                {statusInfo.text}
              </Badge>
            </div>
            <h3 className="text-lg font-black">
              Reserva de {venta.estudiante.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {statusInfo.description}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col justify-between md:items-end gap-2 pr-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {formatDate(venta.createdAt, "dd MMM yyyy")}
          </span>
          <span className="text-2xl font-black leading-none">
            {formatCurrency(venta.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 pt-4 border-t">
        <div className="flex-1 flex items-center gap-2 group">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground/80">
            Sede {venta.sede.nombre}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-xl h-10 px-4 text-primary hover:text-primary/80 hover:bg-primary/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Ocultar prendas" : "Ver prendas"}
          </Button>

          {venta.estado === "RESERVADO" && (
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="rounded-xl h-10 px-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              onClick={() => {
                if (
                  confirm("¿Estás seguro de que deseas cancelar esta reserva?")
                ) {
                  startTransition(async () => {
                    const res = await actualizarEstadoVentaUniformeAction(
                      venta.id,
                      "CANCELADO",
                    );
                    if (res.error) {
                      toast.error(res.error);
                    } else {
                      toast.success("Reserva cancelada exitosamente");
                    }
                  });
                }
              }}
            >
              {isPending ? "Cancelando..." : "Cancelar"}
            </Button>
          )}

          {venta.estado === "APROBADO" && (
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 px-5 font-bold shadow-lg shadow-blue-500/20">
              Ir a Pagar
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="pt-4 animate-in slide-in-from-top-4 animation-duration-">
          <div className="bg-primary/10 rounded-2xl border border-primary/10 overflow-hidden divide-y divide-primary/10">
            {venta.detalles.map((d: any) => (
              <div key={d.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10 shadow-sm shrink-0">
                    <Image
                      src={d.variante.uniforme.imagen}
                      alt={d.variante.uniforme.nombre}
                      width={40}
                      height={40}
                      unoptimized
                      className="h-full w-full rounded-md object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {d.variante.uniforme.nombre}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Talla: {d.variante.talla} &bull; Cantidad: {d.cantidad}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black">
                  {formatCurrency(d.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
