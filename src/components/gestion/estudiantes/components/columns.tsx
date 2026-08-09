"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconUser,
  IconSchool,
  IconGenderMale,
  IconGenderFemale,
  IconCalendarEvent,
  IconId,
  IconCircleFilled,
  IconDotsVertical,
} from "@tabler/icons-react";
import { formatDate, formatTime } from "@/lib/formats";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RowActions } from "@/components/gestion/estudiantes/components/row-actions";
import { cn } from "@/lib/utils";

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
  tipoSangre: string | null;
  alergias: string | null;
  condicionesMedicas: string | null;
  medicamentos: string | null;
  seguroMedico: string | null;
  discapacidades: string | null;
  carnetConadis: string | null;
  restriccionesAlimenticias: string | null;
  centroSaludPreferido: string | null;
  peso: number | null;
  talla: number | null;
  parentescoContactoEmergencia: string | null;
  nombreContactoEmergencia2: string | null;
  telefonoContactoEmergencia2: string | null;
  parentescoContactoEmergencia2: string | null;
  paisNacimiento: string | null;
  lugarNacimiento: string | null;
  lenguaMaterna: string | null;
  religion: string | null;
  numeroHermanos: number | null;
  institucionId: string;
  estadoId: string;
  image: string | null;
  telefono: string | null;
  estado: {
    nombre: string;
    color: string | null;
  };
  nivelAcademico: {
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
    sede: { nombre: string } | null;
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
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconUser className="size-3.5 text-muted-foreground/60" />
        <span>Estudiante</span>
      </div>
    ),
    accessorFn: (row) =>
      `${row.name} ${row.apellidoPaterno} ${row.apellidoMaterno} ${row.dni} ${row.codigoEstudiante ?? ""}`,
    cell: ({ row }) => {
      const student = row.original;
      const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-border/30 shadow-sm relative overflow-hidden shrink-0">
            <AvatarImage
              src={student.image ?? undefined}
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
              {student.name?.charAt(0)?.toUpperCase()}
              {student.apellidoPaterno?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm leading-tight text-foreground/90 capitalize truncate max-w-[220px]">
              {fullName}
            </span>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {student.codigoEstudiante && (
                <span className="text-[10px] font-mono font-semibold text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded-sm border border-border/30 leading-none">
                  {student.codigoEstudiante}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60 font-medium flex items-center gap-1">
                <IconId className="size-3 text-muted-foreground/40" />
                {student.dni || "---"}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "nivelAcademico",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconSchool className="size-3.5 text-muted-foreground/60" />
        <span>Grado/Sección</span>
      </div>
    ),
    accessorFn: (row) => row.nivelAcademico?.nivel.nombre || "",
    cell: ({ row }) => {
      const info = row.original.nivelAcademico;

      if (!info) {
        return (
          <span className="text-[10px] font-semibold text-red-500/60 border border-red-500/15 bg-red-500/5 px-2 py-0.5 rounded-full w-fit whitespace-nowrap">
            Sin Matrícula
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-foreground/80 whitespace-nowrap">
              {info.grado.nombre}
              <span className="mx-1 text-muted-foreground/30">-</span>
              {info.seccion}
            </span>
            {info.sede && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/5 text-blue-500 border border-blue-500/15 leading-none">
                {info.sede.nombre}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-semibold tracking-wide">
            {info.nivel.nombre}
          </span>
        </div>
      );
    },
  },
  {
    id: "sexo",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconGenderMale className="size-3.5 text-muted-foreground/60" />
        <span>Sexo</span>
      </div>
    ),
    accessorFn: (row) => row.sexo,
    cell: ({ row }) => {
      const sexo = row.original.sexo;
      const isMale = sexo?.toLowerCase() === "masculino" || sexo?.toLowerCase() === "m";
      const isFemale = sexo?.toLowerCase() === "femenino" || sexo?.toLowerCase() === "f";
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit whitespace-nowrap border",
            isMale &&
              "bg-blue-500/8 text-blue-600 dark:text-blue-400 border-blue-500/15",
            isFemale &&
              "bg-pink-500/8 text-pink-600 dark:text-pink-400 border-pink-500/15",
            !isMale && !isFemale &&
              "bg-muted/30 text-muted-foreground border-border/30",
          )}
        >
          {isMale ? (
            <IconGenderMale className="size-3.5" />
          ) : isFemale ? (
            <IconGenderFemale className="size-3.5" />
          ) : null}
          {sexo || "---"}
        </span>
      );
    },
  },
  {
    id: "estado",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconCircleFilled className="size-2.5 text-muted-foreground/60" />
        <span>Estado</span>
      </div>
    ),
    accessorFn: (row) => row.estado.nombre,
    cell: ({ row }) => {
      const estado = row.original.estado;
      return (
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full w-fit whitespace-nowrap border"
          style={{
            color: estado.color || undefined,
            borderColor: `${estado.color}25` || undefined,
            backgroundColor: `${estado.color}0d` || undefined,
          }}
        >
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: estado.color || undefined,
              boxShadow: estado.color
                ? `0 0 6px ${estado.color}50`
                : undefined,
            }}
          />
          {estado.nombre}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <div className="flex items-center gap-1.5">
        <IconCalendarEvent className="size-3.5 text-muted-foreground/60" />
        <span>Registro</span>
      </div>
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-foreground/80">
              {formatDate(createdAt)}
            </span>
            <span className="text-[10px] text-muted-foreground/50 font-medium mt-0.5">
              {formatTime(createdAt, "HH:mm a")?.toLowerCase()}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center justify-center">
        <IconDotsVertical className="size-3.5 text-muted-foreground/40" />
      </div>
    ),
    cell: ({ row, table }) => (
      <div className="flex justify-center">
        <RowActions row={row} table={table as any} />
      </div>
    ),
  },
];
