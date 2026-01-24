"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconUser, IconBriefcase, IconCalendar } from "@tabler/icons-react";
import { formatDate, getInitials } from "@/lib/formats";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StaffRowActions } from "@/components/gestion/personal/components/row-actions";

export type StaffTableType = {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  role: string;
  sexo: string;
  telefono: string | null;
  direccion: string | null;
  area: string | null;
  especialidad: string | null;
  titulo: string | null;
  numeroContrato: string | null;
  fechaIngreso: Date | null;
  colegioProfesor: string | null;
  escalaMagisterial: string | null;
  image: string | null;
  cargo: {
    nombre: string;
  } | null;
  estado: {
    nombre: string;
    color: string | null;
  };
  institucionId: string;
  estadoId: string;
  cargoId: string | null;
  createdAt: Date;
};

export const columns: ColumnDef<StaffTableType>[] = [
  {
    id: "personal",
    header: "Personal",
    accessorFn: (row) =>
      `${row.name} ${row.apellidoPaterno || ""} ${row.apellidoMaterno || ""} ${
        row.dni
      }`
        .replace(/\s+/g, " ")
        .trim(),
    cell: ({ row }) => {
      const staff = row.original;
      const fullName = [
        staff.name,
        staff.apellidoPaterno,
        staff.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={staff.image || ""} alt={fullName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {getInitials(staff.name, staff.apellidoPaterno)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-foreground leading-tight capitalize">
              {fullName}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5 font-mono">
              {staff.dni}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "cargo",
    header: "Cargo / Área",
    accessorFn: (row) => `${row.cargo?.nombre || ""} ${row.area || ""}`.trim(),
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <IconBriefcase
              className="size-3.5 text-muted-foreground"
              strokeWidth={2.5}
            />
            {staff.cargo?.nombre || (
              <span className="text-muted-foreground italic">
                Sin cargo asignado
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground capitalize mt-0.5">
            {staff.area || "Sin área"}
          </span>
        </div>
      );
    },
  },
  {
    id: "rol",
    header: "Rol Sistema",
    accessorFn: (row) => row.role,
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge variant="secondary" className="capitalize text-xs font-medium">
          {role}
        </Badge>
      );
    },
  },

  {
    id: "estado",
    header: "Estado",
    accessorFn: (row) => row.estado.nombre,
    cell: ({ row }) => {
      const estado = row.original.estado;
      // Estilo dinámico basado en el color del estado, asegurando legibilidad
      const customStyle = estado.color
        ? {
            borderColor: estado.color,
            color: estado.color,
            backgroundColor: `${estado.color}15`, // Fondo muy sutil
          }
        : {};

      return (
        <Badge
          className="font-medium text-xs"
          style={customStyle}
          variant="outline"
        >
          {estado.nombre}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fechaIngreso",
    header: "Fecha Ingreso",
    cell: ({ row }) => {
      const date = row.original.fechaIngreso;
      if (!date)
        return (
          <span className="text-xs text-muted-foreground italic">
            Pendiente
          </span>
        );
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <IconCalendar
            className="size-3.5 text-muted-foreground"
            strokeWidth={2.5}
          />
          {formatDate(date)}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <StaffRowActions row={row} table={table as any} />
    ),
  },
];
