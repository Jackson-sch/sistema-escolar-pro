"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconUser, IconCalendar, IconFileText } from "@tabler/icons-react";
import { BoletaDownloadButton } from "@/components/portal/finance/boleta-download-button";

export type BoletaColumnType = {
  id: string;
  numeroBoleta: string;
  concepto: string;
  monto: number;
  fechaPago: Date;
  metodoPago?: string;
  referenciaPago?: string;
  estudiante: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante?: string;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
  };
  institucionData?: any;
};

export const getBoletaColumns = (): ColumnDef<BoletaColumnType>[] => [
  {
    accessorKey: "concepto",
    header: "Concepto / Documento",
    cell: ({ row }) => {
      const boleta = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-xs">
            <IconCheck className="size-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-foreground truncate">
              {boleta.concepto}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
              Boleta #{boleta.numeroBoleta}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "estudiante",
    header: "Estudiante",
    cell: ({ row }) => {
      const estudiante = row.original.estudiante;
      const fullName = [estudiante.name, estudiante.apellidoPaterno, estudiante.apellidoMaterno].filter(Boolean).join(" ");
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
            <IconUser className="size-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{fullName}</span>
          </div>
          {estudiante.nivelAcademico && (
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              {estudiante.nivelAcademico.grado.nombre} &quot;{estudiante.nivelAcademico.seccion}&quot; • {estudiante.nivelAcademico.nivel.nombre}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fechaPago",
    header: "Fecha de Emisión",
    size: 130,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-muted-foreground">
        <IconCalendar className="size-3.5 text-indigo-500 shrink-0" />
        <span>{formatDate(row.original.fechaPago, "dd MMM yyyy")}</span>
      </div>
    ),
  },
  {
    accessorKey: "monto",
    header: "Importe Total",
    size: 110,
    cell: ({ row }) => (
      <span className="text-sm font-bold font-mono text-foreground">
        {formatCurrency(Number(row.original.monto))}
      </span>
    ),
  },
  {
    id: "acciones",
    header: "Comprobante",
    size: 140,
    cell: ({ row }) => {
      const boleta = row.original;
      return (
        <BoletaDownloadButton
          pago={{
            id: boleta.id,
            numeroBoleta: boleta.numeroBoleta,
            fechaPago: boleta.fechaPago,
            monto: Number(boleta.monto),
            concepto: boleta.concepto,
            metodoPago: boleta.metodoPago,
            referenciaPago: boleta.referenciaPago,
          }}
          estudiante={boleta.estudiante}
          institucion={boleta.institucionData}
        />
      );
    },
  },
];
