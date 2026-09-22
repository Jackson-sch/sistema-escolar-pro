"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconUser,
  IconCalendarEvent,
  IconCheck,
  IconAlertCircle,
  IconRotate2,
  IconLogout,
  IconClockHour4,
} from "@tabler/icons-react";
import { formatDate } from "@/lib/formats";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrollmentRowActions } from "@/components/gestion/matriculas/components/row-actions";

export type EnrollmentTableType = {
  id: string;
  anioAcademico: number;
  fechaMatricula: Date;
  estado: string;
  esPrimeraVez: boolean;
  esRepitente: boolean;
  procedencia: string | null;
  observaciones: string | null;
  estudiante: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    image: string | null;
  };
  nivelAcademico: {
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
    sede: { nombre: string } | null;
  };
};

export const columns: ColumnDef<EnrollmentTableType>[] = [
  {
    id: "estudiante",
    header: () => (
      <div className="flex items-center gap-2">
        <IconUser className="size-4" />
        <span className="font-semibold">Estudiante</span>
      </div>
    ),
    accessorFn: (row) =>
      `${row.estudiante.name} ${row.estudiante.apellidoPaterno} ${row.estudiante.dni}`,
    cell: ({ row }) => {
      const { estudiante } = row.original;
      const fullName = `${estudiante.name} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`;
      const initials =
        `${estudiante.name[0]}${estudiante.apellidoPaterno[0]}`.toUpperCase();

      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-md bg-primary/20">
            <AvatarImage src={estudiante.image ?? undefined} />
            <AvatarFallback className="bg-primary/2 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm text-foreground capitalize">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              DNI: {estudiante.dni}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "nivel",
    header: () => (
      <div className="flex items-center gap-2">
        <IconCalendarEvent className="size-4" />
        <span className="font-semibold">Grado y Sección</span>
      </div>
    ),
    accessorFn: (row) =>
      `${row.nivelAcademico.nivel.nombre} ${row.nivelAcademico.grado.nombre}`,
    cell: ({ row }) => {
      const { nivelAcademico } = row.original;
      return (
        <div className="flex flex-col gap-1.5 py-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {nivelAcademico.grado.nombre} - {nivelAcademico.seccion}
            </span>
            {nivelAcademico.sede && (
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-2 text-blue-600"
              >
                {nivelAcademico.sede.nombre}
              </Badge>
            )}
          </div>
          <Badge
            variant="secondary"
            className="w-fit text-xs font-medium bg-secondary/20 text-secondary-foreground border-secondary/30"
          >
            {nivelAcademico.nivel.nombre}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "anioAcademico",
    header: "Período",
    filterFn: (row, id, value) => {
      return row.getValue(id)?.toString() === value?.toString();
    },
    cell: ({ row }) => (
      <Badge className="font-semibold bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors">
        Año {row.getValue("anioAcademico")}
      </Badge>
    ),
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const { esPrimeraVez, esRepitente } = row.original;

      if (esRepitente) {
        return (
          <Badge className="gap-1 bg-orange-500/20 text-orange-500 border border-orange-500/30 hover:bg-orange-500/30 transition-colors">
            <IconRotate2 className="size-3" />
            Repitente
          </Badge>
        );
      }
      if (esPrimeraVez) {
        return (
          <Badge className="gap-1 bg-green-500/20 text-green-500 border border-green-500/30 hover:bg-green-500/30 transition-colors">
            <IconCheck className="size-3" />
            Nuevo Ingreso
          </Badge>
        );
      }
      return (
        <Badge variant="secondary" className="gap-1">
          <IconAlertCircle className="size-3" />
          Regular
        </Badge>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;

      const statusConfig: Record<
        string,
        { bg: string; text: string; icon: any; label?: string }
      > = {
        activo: {
          bg: "bg-green-500/10 border-green-500/20",
          text: "text-green-600 dark:text-green-400",
          icon: IconCheck,
          label: "Activo",
        },
        pendiente: {
          bg: "bg-amber-500/15 border-amber-500/30",
          text: "text-amber-700 dark:text-amber-300 font-semibold",
          icon: IconClockHour4,
          label: "Por Ratificar",
        },
        retirado: {
          bg: "bg-red-500/10 border-red-500/20",
          text: "text-red-600 dark:text-red-400",
          icon: IconLogout,
          label: "Retirado",
        },
        suspendido: {
          bg: "bg-yellow-500/10 border-yellow-500/20",
          text: "text-yellow-600 dark:text-yellow-400",
          icon: IconAlertCircle,
          label: "Suspendido",
        },
        egresado: {
          bg: "bg-blue-500/10 border-blue-500/20",
          text: "text-blue-600 dark:text-blue-400",
          icon: IconCheck,
          label: "Egresado",
        },
      };

      const config = statusConfig[estado] || {
        bg: "bg-muted border-border",
        text: "text-muted-foreground",
        icon: IconAlertCircle,
      };
      const Icon = config.icon;

      return (
        <Badge
          className={`gap-1.5 ${config.bg} ${config.text} border transition-colors shadow-none`}
        >
          <Icon className="size-3.5" />
          <span className="capitalize">{config.label || estado}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "fechaMatricula",
    header: ({ column }) => (
      <div className="flex items-center gap-2">
        <IconCalendarEvent className="size-4 text-primary" />
        <span className="font-semibold">Fecha Matrícula</span>
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm font-medium text-foreground py-1">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <IconCalendarEvent className="size-3.5 text-primary" />
        </div>
        {formatDate(row.getValue("fechaMatricula"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <EnrollmentRowActions
        row={row}
        institucion={(table.options.meta as any)?.institucion}
      />
    ),
  },
];
