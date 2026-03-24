"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconUser, IconCalendar } from "@tabler/icons-react";
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
    header: "Concepto",
    cell: ({ row }) => {
      const boleta = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-xl border bg-green-500/10 border-green-500/20 text-green-500 shadow-sm shadow-green-500/5">
            <IconCheck className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm uppercase text-foreground">
              {boleta.concepto}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              DOC: {boleta.numeroBoleta}
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
      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-xs text-foreground uppercase">
            <IconUser className="size-3.5 text-primary/60" />
            {estudiante.name} {estudiante.apellidoPaterno}
          </div>
          {estudiante.nivelAcademico && (
            <span className="text-[9px] font-black text-muted-foreground uppercase">
              {estudiante.nivelAcademico.nivel.nombre} -{" "}
              {estudiante.nivelAcademico.grado.nombre} "
              {estudiante.nivelAcademico.seccion}"
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "fechaPago",
    header: "Fecha",
    size: 100,
    minSize: 80,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground uppercase">
        <IconCalendar className="size-3.5 text-primary/40" />
        {formatDate(row.original.fechaPago)}
      </div>
    ),
  },
  {
    accessorKey: "monto",
    header: "Monto",
    size: 100,
    minSize: 80,
    cell: ({ row }) => (
      <span className="text-lg font-black text-foreground font-mono">
        {formatCurrency(Number(row.original.monto))}
      </span>
    ),
  },
  {
    id: "acciones",
    header: "Acción",
    size: 100,
    minSize: 80,
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
