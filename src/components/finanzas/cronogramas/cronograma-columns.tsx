"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconCash,
  IconAlertTriangle,
  IconCheck,
  IconFileDownload,
  IconReceipt,
  IconX,
  IconClockHour4,
  IconMinus,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNextComprobanteAction } from "@/actions/finance";
import { IAReminderButton } from "./ia-reminder-button";
import Image from "next/image";
import { cn, toTitleCase } from "@/lib/utils";

const DownloadWrapper = dynamic(
  () =>
    import("@/components/finanzas/cronogramas/download-wrapper").then(
      (mod) => mod.DownloadWrapper,
    ),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-xl opacity-50"
        disabled
      >
        <IconFileDownload className="size-4" />
      </Button>
    ),
  },
);

export type CronogramaTableType = {
  id: string;
  monto: number;
  montoPagado: number;
  fechaVencimiento: string;
  pagado: boolean;
  moraAcumulada: number;
  estudiante: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante: string | null;
    dni: string | null;
    image: string | null;
    codigoModular: string | null;
    nivelAcademicoId: string | null;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
    matriculas?: {
      anioAcademico: number;
      nivelAcademico: {
        seccion: string;
        grado: { nombre: string };
        nivel: { nombre: string };
      };
    }[];
  };
  concepto: {
    id: string;
    nombre: string;
  };
  pagos?: any[];
};

export const isVencido = (fecha: string, pagado?: boolean) =>
  new Date(fecha) < new Date() && !pagado;

/* ─── Status config ─── */
type StatusKey = "pagado" | "vencido" | "parcial" | "pendiente" | "anulado";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; dot: string; text: string; bg: string; icon: React.ElementType }
> = {
  pagado: {
    label: "PAGADO",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: IconCheck,
  },
  vencido: {
    label: "VENCIDO",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: IconAlertTriangle,
  },
  parcial: {
    label: "PARCIAL",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: IconMinus,
  },
  pendiente: {
    label: "PENDIENTE",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: IconClockHour4,
  },
  anulado: {
    label: "ANULADO",
    dot: "bg-zinc-500",
    text: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    icon: IconX,
  },
};

function StatusBadge({ status }: { status: StatusKey }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black tracking-widest transition-all hover:scale-105 shadow-sm",
        cfg.bg,
        cfg.text,
      )}
    >
      <div className={cn("size-1.5 rounded-full shadow-xs animate-pulse", cfg.dot)} />
      {cfg.label}
    </Badge>
  );
}

export const getCronogramaColumns = (meta: {
  institucion: any;
  setSelectedCronograma: (val: CronogramaTableType | null) => void;
  setMontoPago: (val: string) => void;
  setNumeroBoleta: (val: string) => void;
  setShowPagoDialog: (val: boolean) => void;
  setSelectedPago: (val: any | null) => void;
  setShowVoidDialog: (val: boolean) => void;
}): ColumnDef<CronogramaTableType>[] => [
  /* ── Estudiante ── */
  {
    id: "estudiante",
    accessorFn: (row) =>
      `${row.estudiante.dni || ""} ${row.estudiante.name} ${row.estudiante.apellidoPaterno} ${row.estudiante.apellidoMaterno}`,
    header: "Estudiante",
    cell: ({ row }) => {
      const { estudiante } = row.original;
      const fullName = toTitleCase(`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`);
      const nivel =
        estudiante.matriculas?.[0]?.nivelAcademico ??
        estudiante.nivelAcademico;

      const initials =
        (estudiante.name[0] ?? "") + (estudiante.apellidoPaterno[0] ?? "");

      return (
        <div className="flex items-center gap-4 group">
          <div className="relative size-10 rounded-xl overflow-hidden ring-1 ring-border/40 bg-muted/40 shadow-xs transition-all group-hover:ring-primary/40 group-hover:shadow-md">
            {estudiante.image ? (
              <Image
                src={estudiante.image}
                alt={fullName}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black text-xs uppercase">
                {initials}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {fullName}
            </span>
            <span className="text-[10px] text-muted-foreground font-black tracking-tighter uppercase opacity-60">
              {nivel
                ? `${nivel.nivel.nombre} · ${nivel.grado.nombre} "${nivel.seccion}"`
                : estudiante.codigoEstudiante ?? "SIN NIVEL"}
            </span>
          </div>
        </div>
      );
    },
  },

  /* ── Concepto ── */
  {
    accessorKey: "concepto.nombre",
    header: "Concepto",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="gap-2 text-[10px] font-black uppercase tracking-widest bg-background/40 border-border/40 px-3 py-1 rounded-lg"
      >
        <IconReceipt className="size-3.5 text-primary opacity-60" />
        {row.original.concepto.nombre}
      </Badge>
    ),
  },

  /* ── Monto ── */
  {
    id: "monto",
    header: "Monto",
    cell: ({ row }) => {
      const { monto, montoPagado, pagado } = row.original;
      const pendiente = Number(monto) - Number(montoPagado);
      const hasAbono = montoPagado > 0 && !pagado;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-sm tabular-nums tracking-tighter">
            {formatCurrency(Number(monto))}
          </span>
          {!pagado && pendiente > 0 && (
            <span className="text-[10px] font-black text-red-500/80 tabular-nums uppercase">
              − {formatCurrency(pendiente)}
            </span>
          )}
          {hasAbono && (
            <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
              ABONADO {formatCurrency(Number(montoPagado))}
            </span>
          )}
        </div>
      );
    },
  },

  /* ── Fecha ── */
  {
    id: "vencimiento",
    header: "Vencimiento",
    cell: ({ row }) => {
      const fecha = row.original.fechaVencimiento;
      const vencido = isVencido(fecha, row.original.pagado);

      return (
        <div className="flex items-center gap-2">
          {vencido ? (
            <IconAlertTriangle className="size-4 text-red-500 animate-pulse" />
          ) : (
            <IconClockHour4 className="size-4 text-muted-foreground opacity-40" />
          )}
          <span
            className={cn(
              "text-xs font-black tracking-tighter tabular-nums",
              vencido ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {formatDate(fecha).toUpperCase()}
          </span>
        </div>
      );
    },
  },

  /* ── Estado ── */
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const { pagado, montoPagado, fechaVencimiento, pagos } = row.original;
      const vencido = isVencido(fechaVencimiento, pagado);
      const hasAnulado = pagos?.some((p: any) => p.estado === "anulado");

      const status: StatusKey = pagado
        ? "pagado"
        : hasAnulado
          ? "anulado"
          : vencido
            ? "vencido"
            : montoPagado > 0
              ? "parcial"
              : "pendiente";

      return <StatusBadge status={status} />;
    },
  },

  /* ── Acciones ── */
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const { pagado, pagos } = row.original;

      if (pagado || (pagos && pagos.length > 0)) {
        const ultimoPago = pagos?.[0];
        if (!ultimoPago) return null;

        return (
          <div className="flex items-center gap-1 justify-end">
            <DownloadWrapper
              pago={{
                numeroBoleta: ultimoPago.numeroBoleta,
                fechaPago: new Date(ultimoPago.fechaPago),
                monto: Number(ultimoPago.monto),
                metodoPago: ultimoPago.metodoPago,
                referenciaPago: ultimoPago.referenciaPago,
                concepto: row.original.concepto.nombre,
                observaciones: ultimoPago.observaciones,
              }}
              estudiante={{
                ...row.original.estudiante,
                codigoEstudiante:
                  row.original.estudiante.codigoEstudiante ?? undefined,
              }}
              institucion={{
                nombre:
                  meta.institucion?.nombreInstitucion || "SISTEMA ESCOLAR PRO",
                direccion: meta.institucion?.direccion,
                telefono: meta.institucion?.telefono,
                ruc: meta.institucion?.codigoModular,
                dre: meta.institucion?.dre,
                ugel: meta.institucion?.ugel,
                logo: meta.institucion?.logo,
              }}
              fileName={`Recibo-${ultimoPago.numeroBoleta}.pdf`}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
              onClick={() => {
                meta.setSelectedPago({
                  id: ultimoPago.id,
                  numeroBoleta: ultimoPago.numeroBoleta,
                  monto: Number(ultimoPago.monto),
                  concepto: row.original.concepto.nombre,
                });
                meta.setShowVoidDialog(true);
              }}
              title="Anular Pago"
            >
              <IconX className="size-4" />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2 justify-end">
          <IAReminderButton cronograma={row.original} />
          <Button
            size="sm"
            className="h-9 px-5 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95"
            onClick={async () => {
              meta.setSelectedCronograma(row.original);
              meta.setMontoPago(
                (
                  Number(row.original.monto) - Number(row.original.montoPagado)
                ).toFixed(2),
              );
              const nextBoleta = await getNextComprobanteAction({});
              meta.setNumeroBoleta(nextBoleta.success || "B001-000001");
              meta.setShowPagoDialog(true);
            }}
          >
            <IconCash className="size-4" />
            Cobrar
          </Button>
        </div>
      );
    },
  },
];