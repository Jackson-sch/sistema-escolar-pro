import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconX,
  IconEye,
  IconLoader2,
  IconReceipt,
  IconUser,
  IconCalendarEvent,
  IconBuildingBank,
  IconHash,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";

interface Comprobante {
  id: string;
  archivoUrl: string;
  monto: number;
  bancoOrigen: string | null;
  numeroOperacion: string | null;
  fechaOperacion: string;
  estado: string;
  createdAt: string;
  cronograma: {
    concepto: { nombre: string };
    estudiante: {
      name: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
  padre: {
    name: string;
    email: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface VerificacionCardProps {
  comprobante: Comprobante;
  loading: boolean;
  onAprobar: (id: string) => void;
  onVer: (comprobante: Comprobante) => void;
  onRechazar: (comprobante: Comprobante) => void;
}

export function VerificacionCard({
  comprobante,
  loading,
  onAprobar,
  onVer,
  onRechazar,
}: VerificacionCardProps) {
  const isImage = comprobante.archivoUrl.startsWith("data:image");

  return (
    <div className="group relative rounded-3xl border border-border bg-card/50 overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5">
      <div className="flex flex-col gap-6 p-4 lg:flex-row lg:p-6">
        {/* Thumbnail Section */}
        <div className="lg:w-56 shrink-0 h-40 lg:h-auto group-hover:scale-[1.02] transition-transform duration-500">
          {isImage ? (
            <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border/50 bg-muted/30">
              <img
                src={comprobante.archivoUrl}
                alt="Comprobante"
                className="h-full w-full object-cover transition-opacity hover:opacity-90 cursor-pointer"
                onClick={() => onVer(comprobante)}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <IconEye className="size-8 text-white" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => onVer(comprobante)}
              className="h-full w-full rounded-2xl bg-muted/50 border border-border/50 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted group/btn"
            >
              <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <IconReceipt className="size-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Ver Documento
              </span>
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-primary/70">
                  Concepto de Pago
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight">
                {comprobante.cronograma.concepto.nombre}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <IconUser className="size-4" />
                <span className="capitalize">
                  {comprobante.cronograma.estudiante.name}{" "}
                  {comprobante.cronograma.estudiante.apellidoPaterno}{" "}
                  {comprobante.cronograma.estudiante.apellidoMaterno}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                Monto
              </span>
              <span className="text-3xl font-black text-primary">
                {formatCurrency(comprobante.monto)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/30 p-4 md:grid-cols-4 border border-border/50">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                Enviado por
              </p>
              <p className="text-sm font-bold capitalize truncate">
                {comprobante.padre.name} {comprobante.padre.apellidoPaterno}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IconCalendarEvent className="size-3 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Fecha Op.
                </p>
              </div>
              <p className="text-sm font-bold">
                {formatDate(comprobante.fechaOperacion)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IconBuildingBank className="size-3 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Banco
                </p>
              </div>
              <p className="text-sm font-bold capitalize truncate">
                {comprobante.bancoOrigen || "-"}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <IconHash className="size-3 text-muted-foreground" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                  Nro. Op.
                </p>
              </div>
              <p className="text-sm font-mono font-bold truncate">
                {comprobante.numeroOperacion || "-"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              className="rounded-xl h-10 px-6 font-bold transition-all hover:bg-muted active:scale-[0.98]"
              onClick={() => onVer(comprobante)}
            >
              <IconEye className="mr-2 size-4" />
              Previsualizar
            </Button>
            <Button
              className="rounded-xl h-10 px-8 font-black shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
              disabled={loading}
              onClick={() => onAprobar(comprobante.id)}
            >
              {loading ? (
                <IconLoader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <IconCheck className="mr-2 size-4" />
              )}
              Aprobar Pago
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-destructive/10 transition-all hover:shadow-destructive/20 active:scale-[0.98]"
              onClick={() => onRechazar(comprobante)}
            >
              <IconX className="mr-2 size-4" />
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
