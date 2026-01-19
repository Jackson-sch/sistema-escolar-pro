"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconUser } from "@tabler/icons-react";
import { formatDate, formatTime } from "@/lib/formats";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RowActions } from "./row-actions";

export type StudentTableType = {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  sexo: string;
  nacionalidad: string;
  fechaNacimiento: Date;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  ubigeo: string;
  fechaIngreso: Date | string | null;
  codigoEstudiante: string;
  codigoSiagie: string;
  tipoSangre: string;
  alergias: string;
  condicionesMedicas: string;
  institucionId: string;
  estadoId: string;
  image: string | null;
  estado: {
    nombre: string;
    color: string | null;
  };
  nivelAcademico: {
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
  } | null;
  padresTutores: {
    padreTutor: {
      name: string;
      dni: string;
      telefono: string | null;
    };
    parentesco: string;
    contactoPrimario: boolean;
  }[];
  matriculadoEsteAnio?: boolean;
  createdAt: Date;
};

export const columns: ColumnDef<StudentTableType>[] = [
  {
    id: "estudiante",
    header: "Estudiante",
    accessorFn: (row) =>
      `${row.name} ${row.apellidoPaterno} ${row.apellidoMaterno} ${row.dni}`,
    cell: ({ row }) => {
      const student = row.original;
      const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/40 shadow-sm relative overflow-hidden group">
            <AvatarImage
              src={student.image || ""}
              className="object-cover transition-transform group-hover:scale-110"
            />
            <AvatarFallback className="bg-violet-500/10 text-violet-500">
              <IconUser className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-[13px] leading-tight text-foreground/90 capitalize">
              {fullName}
            </span>
            <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1.5 mt-0.5 font-medium">
              <span className="text-[9px] px-1 py-0.5 rounded-sm bg-muted/50 border border-border/50 text-muted-foreground/60 leading-none">
                DNI
              </span>
              {student.dni || "Sin ID"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "nivelAcademico",
    header: "Grado/Sección",
    accessorFn: (row) => row.nivelAcademico?.nivel.nombre || "",
    cell: ({ row }) => {
      const info = row.original.nivelAcademico;
      const matriculado = row.original.matriculadoEsteAnio;

      if (!info) {
        return (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-red-500/70 border border-red-500/20 bg-red-500/5 px-2 py-0.5 rounded-md w-fit uppercase tracking-tighter">
              Sin Matrícula Activa
            </span>
          </div>
        );
      }

      return (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground/80">
            {info.grado.nombre} - {info.seccion}
          </span>
          <span className="text-[10px] text-muted-foreground/60 font-semibold tracking-wide mt-0.5">
            {info.nivel.nombre}
          </span>
        </div>
      );
    },
  },
  {
    id: "estado",
    header: "Estado",
    accessorFn: (row) => row.estado.nombre,
    cell: ({ row }) => {
      const estado = row.original.estado;
      return (
        <Badge
          style={{
            borderColor: `${estado.color}30` || undefined,
            color: estado.color || undefined,
            backgroundColor: `${estado.color}10` || undefined,
          }}
          className="text-[10px] font-bold px-2 py-0 h-5 border shadow-none"
          variant="outline"
        >
          {estado.nombre}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registro",
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-foreground/80">
            {formatDate(createdAt)}
          </span>
          <span className="text-[11px] text-muted-foreground/60 font-medium mt-0.5 uppercase tracking-tight">
            {formatTime(createdAt, "HH:mm a")?.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => <RowActions row={row} table={table as any} />,
  },
];
