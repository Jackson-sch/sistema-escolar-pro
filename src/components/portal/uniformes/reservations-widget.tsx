import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { formatDate } from "@/lib/formats";

export default function ReservationsWidget({
  ventas,
  setActiveTab,
}: {
  ventas: any[];
  setActiveTab: (tab: string) => void;
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold">Mis Reservas</h3>
        </div>
        <Button
          variant="link"
          onClick={() => setActiveTab("mis-reservas")}
          className="h-auto p-0 text-xs font-semibold text-primary capitalize tracking-widest"
        >
          Ver Todas
        </Button>
      </div>

      <div className="space-y-6">
        {ventas.slice(0, 2).map((v, i) => (
          <div key={v.id} className="flex gap-4 relative group">
            {i === 0 && (
              <div className="absolute left-2.5 top-8 bottom-[-24px] w-[2px] bg-slate-100 dark:bg-white/5" />
            )}
            <div className="h-5 w-5 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 z-10 shadow-lg shadow-blue-500/20">
              {i + 1}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  {formatDate(v.createdAt, "MMM dd, yyyy")}
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                {v.estado === "RESERVADO"
                  ? "Cita para Prueba"
                  : "Recojo de Pedido"}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                {v.sede?.nombre} &bull; {v.codigo}
              </p>
            </div>
          </div>
        ))}
        {ventas.length === 0 && (
          <p className="text-sm text-slate-500 font-medium italic py-4">
            Sin actividad reciente.
          </p>
        )}
      </div>
    </div>
  );
}
