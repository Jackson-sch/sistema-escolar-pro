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
import { cn } from "@/lib/utils";

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
        className="h-7 w-7 p-0 rounded-lg opacity-50"
        disabled
      >
        <IconFileDownload className="size-3.5" />
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
type StatusKey = "pagado" | "vencido" | "parcial" | "pendiente";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; dot: string; text: string; bg: string; icon: React.ElementType }
> = {
  pagado: {
    label: "Pagado",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: IconCheck,
  },
  vencido: {
    label: "Vencido",
    dot: "bg-rose-500",
    text: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    icon: IconAlertTriangle,
  },
  parcial: {
    label: "Parcial",
    dot: "bg-amber-500",
    text: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: IconMinus,
  },
  pendiente: {
    label: "Pendiente",
    dot: "bg-zinc-500",
    text: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
    icon: IconClockHour4,
  },
};

function StatusBadge({ status }: { status: StatusKey }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wide",
        cfg.bg,
        cfg.text,
      )}
    >
      <Icon className="size-3" strokeWidth={2.5} />
      {cfg.label}
    </span>
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
    header: () => (
      <span className="text-[10px] font-bold uppercase text-zinc-500">
        Estudiante
      </span>
    ),
    cell: ({ row }) => {
      const { estudiante } = row.original;
      const fullName = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`;
      const nivel =
        estudiante.matriculas?.[0]?.nivelAcademico ??
        estudiante.nivelAcademico;

      const initials =
        (estudiante.name[0] ?? "") + (estudiante.apellidoPaterno[0] ?? "");

      return (
        <div className="flex items-center gap-3 py-0.5">
          {/* Avatar */}
          <div className="size-8 rounded-lg shrink-0 ring-1 ring-white/8 overflow-hidden">
            {estudiante.image ? (
              <Image
                src={estudiante.image}
                alt={fullName}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-blue-600/20 to-indigo-700/20 flex items-center justify-center text-blue-400 font-bold text-[11px] uppercase">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-white truncate capitalize leading-snug">
              {fullName}
            </span>
            <span className="text-[11px] text-zinc-500 truncate leading-snug">
              {nivel
                ? `${nivel.nivel.nombre} · ${nivel.grado.nombre} "${nivel.seccion}"`
                : estudiante.codigoEstudiante ?? "Sin nivel asignado"}
            </span>
          </div>
        </div>
      );
    },
  },

  /* ── Concepto ── */
  {
    accessorKey: "concepto.nombre",
    header: () => (
      <span className="text-[10px] font-bold uppercase text-zinc-500">
        Concepto
      </span>
    ),
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="gap-1.5 text-[11px] font-medium text-zinc-400 bg-white/4 border-white/7 truncate"
      >
        <IconReceipt className="size-3 text-zinc-600 shrink-0" />
        {row.original.concepto.nombre}
      </Badge>
    ),
  },

  /* ── Monto ── */
  {
    id: "monto",
    header: () => (
      <span className="text-[10px] font-bold uppercase text-zinc-500">
        Monto
      </span>
    ),
    cell: ({ row }) => {
      const { monto, montoPagado, pagado } = row.original;
      const pendiente = Number(monto) - Number(montoPagado);
      const hasAbono = montoPagado > 0 && !pagado;

      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-sm text-white font-mono tabular-nums">
            {formatCurrency(Number(monto))}
          </span>
          {!pagado && pendiente > 0 && (
            <span className="text-[10px] font-semibold text-rose-400 font-mono">
              − {formatCurrency(pendiente)}
            </span>
          )}
          {hasAbono && (
            <span className="text-[10px] text-zinc-600 font-mono">
              Abonado {formatCurrency(Number(montoPagado))}
            </span>
          )}
        </div>
      );
    },
  },

  /* ── Fecha ── */
  {
    id: "vencimiento",
    header: () => (
      <span className="text-[10px] font-bold uppercase text-zinc-500">
        Vencimiento
      </span>
    ),
    cell: ({ row }) => {
      const fecha = row.original.fechaVencimiento;
      const vencido = isVencido(fecha, row.original.pagado);

      return (
        <div className="flex items-center gap-1.5">
          {vencido && (
            <IconAlertTriangle className="size-3.5 text-rose-500 shrink-0" />
          )}
          <span
            className={cn(
              "text-[12px] font-medium",
              vencido ? "text-rose-400" : "text-zinc-400",
            )}
          >
            {formatDate(fecha)}
          </span>
        </div>
      );
    },
  },

  /* ── Estado ── */
  {
    id: "estado",
    header: () => (
      <span className="text-[10px] font-bold uppercase text-zinc-500">
        Estado
      </span>
    ),
    cell: ({ row }) => {
      const { pagado, montoPagado, fechaVencimiento } = row.original;
      const vencido = isVencido(fechaVencimiento, pagado);

      const status: StatusKey = pagado
        ? "pagado"
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
          <div className="flex items-center gap-1.5 justify-end">
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
              }}
              fileName={`Recibo-${ultimoPago.numeroBoleta}.pdf`}
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
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
              <IconX className="size-3.5" />
            </Button>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-1.5 justify-end">
          <IAReminderButton cronograma={row.original} />
          <Button
            size="sm"
            className="h-7 px-3 gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20 transition-all"
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
            <IconCash className="size-3.5" />
            Cobrar
          </Button>
        </div>
      );
    },
  },
];