"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconCash,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconFileDownload,
  IconReceipt,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNextComprobanteAction } from "@/actions/finance";
import { IAReminderButton } from "./ia-reminder-button";

const DownloadWrapper = dynamic(
  () =>
    import("@/components/finanzas/cronogramas/download-wrapper").then(
      (mod) => mod.DownloadWrapper
    ),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        disabled
      >
        <IconFileDownload className="size-3.5" />
        ...
      </Button>
    ),
  }
);

export type CronogramaTableType = {
  id: string;
  monto: number;
  montoPagado: number;
  fechaVencimiento: string;
  pagado: boolean;
  estudiante: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante: string | null;
    dni: string | null;
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

export const getCronogramaColumns = (meta: {
  institucion: any;
  setSelectedCronograma: (val: CronogramaTableType | null) => void;
  setMontoPago: (val: string) => void;
  setNumeroBoleta: (val: string) => void;
  setShowPagoDialog: (val: boolean) => void;
}): ColumnDef<CronogramaTableType>[] => [
  {
    id: "estudiante",
    header: "Estudiante",
    cell: ({ row }) => {
      const { estudiante } = row.original;
      const fullName = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`;

      return (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shrink-0">
            <IconUser className="size-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground truncate">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              {estudiante.matriculas && estudiante.matriculas.length > 0 ? (
                <>
                  {estudiante.matriculas[0].nivelAcademico.nivel.nombre} •{" "}
                  {estudiante.matriculas[0].nivelAcademico.grado.nombre} "
                  {estudiante.matriculas[0].nivelAcademico.seccion}"
                </>
              ) : estudiante.nivelAcademico ? (
                <>
                  {estudiante.nivelAcademico.nivel.nombre} •{" "}
                  {estudiante.nivelAcademico.grado.nombre} "
                  {estudiante.nivelAcademico.seccion}"
                </>
              ) : (
                estudiante.codigoEstudiante || "Sin nivel asignado"
              )}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "concepto.nombre",
    header: "Concepto",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-normal text-xs bg-background border-border"
      >
        <IconReceipt className="size-3 mr-1.5 text-muted-foreground" />
        {row.original.concepto.nombre}
      </Badge>
    ),
  },
  {
    id: "monto",
    header: "Monto",
    cell: ({ row }) => {
      const { monto, montoPagado, pagado } = row.original;
      const pendiente = Number(monto) - Number(montoPagado);

      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">
            {formatCurrency(Number(monto))}
          </span>
          {!pagado && pendiente > 0 && (
            <span className="text-[10px] font-medium text-destructive uppercase tracking-wide">
              Pendiente: {formatCurrency(pendiente)}
            </span>
          )}
          {montoPagado > 0 && !pagado && (
            <span className="text-[10px] text-muted-foreground">
              Abonado: {formatCurrency(Number(montoPagado))}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "vencimiento",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = row.original.fechaVencimiento;
      const vencido = isVencido(fecha, row.original.pagado);

      return (
        <div className="flex items-center gap-2">
          {vencido && (
            <IconAlertTriangle className="size-3.5 text-destructive fill-destructive/10 shrink-0" />
          )}
          <span
            className={`text-sm font-medium ${
              vencido ? "text-destructive" : "text-foreground"
            }`}
          >
            {formatDate(fecha)}
          </span>
        </div>
      );
    },
  },
  {
    id: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const { pagado, monto, montoPagado, fechaVencimiento } = row.original;
      const vencido = isVencido(fechaVencimiento, pagado);

      if (pagado) {
        return (
          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 gap-1.5 border-0">
            <IconCheck className="size-3" strokeWidth={3} />
            <span>Pagado</span>
          </Badge>
        );
      }

      if (vencido) {
        return (
          <Badge variant="destructive" className="gap-1.5">
            <IconAlertTriangle className="size-3" />
            <span>Vencido</span>
          </Badge>
        );
      }

      if (montoPagado > 0) {
        return (
          <Badge variant="secondary" className="gap-1.5">
            <span>Parcial</span>
          </Badge>
        );
      }

      return (
        <Badge variant="outline" className="text-muted-foreground gap-1.5">
          <span>Pendiente</span>
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      if (row.original.pagado) {
        const ultimoPago = row.original.pagos?.[0];
        if (!ultimoPago) return null;

        return (
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
        );
      }

      return (
        <div className="flex items-center gap-2">
          <IAReminderButton cronograma={row.original} />
          <Button
            size="sm"
            className="h-8 gap-1.5 font-medium shadow-sm"
            onClick={async () => {
              meta.setSelectedCronograma(row.original);
              meta.setMontoPago(
                (
                  Number(row.original.monto) - Number(row.original.montoPagado)
                ).toFixed(2)
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
