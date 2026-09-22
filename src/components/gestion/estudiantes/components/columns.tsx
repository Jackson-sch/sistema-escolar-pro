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
  IconBrandWhatsapp,
  IconUsersGroup,
} from "@tabler/icons-react";
import { formatDate, formatTime } from "@/lib/formats";
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
  institucion?: {
    nombreInstitucion: string;
  } | null;
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
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconUser className="size-3.5 text-muted-foreground/60" />
        <span>Estudiante</span>
      </div>
    ),
    accessorFn: (row) =>
      `${row.name} ${row.apellidoPaterno} ${row.apellidoMaterno} ${row.dni} ${row.codigoEstudiante ?? ""} ${row.codigoSiagie ?? ""}`,
    cell: ({ row }) => {
      const student = row.original;
      const fullName =
        `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`.trim();

      return (
        <div className="flex items-center gap-3 py-0.5">
          <Avatar className="size-9 rounded-xl border border-border/50 shadow-2xs relative overflow-hidden shrink-0">
            <AvatarImage
              src={student.image ?? undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary font-extrabold text-xs rounded-xl">
              {student.name?.charAt(0)?.toUpperCase()}
              {student.apellidoPaterno?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs leading-tight text-foreground capitalize truncate max-w-[220px]">
              {fullName}
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {student.codigoEstudiante && (
                <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded-md border border-border/40 leading-none">
                  {student.codigoEstudiante}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/70 font-mono font-semibold flex items-center gap-1">
                <IconId className="size-3 text-muted-foreground/50" />
                {student.dni || "S/DNI"}
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
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconSchool className="size-3.5 text-muted-foreground/60" />
        <span>Grado y Sección</span>
      </div>
    ),
    accessorFn: (row) =>
      row.nivelAcademico
        ? `${row.nivelAcademico.nivel.nombre} ${row.nivelAcademico.grado.nombre} ${row.nivelAcademico.seccion}`
        : "Sin Matrícula",
    cell: ({ row }) => {
      const info = row.original.nivelAcademico;

      if (!info) {
        return (
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 rounded-lg w-fit whitespace-nowrap">
            Sin Matrícula 2026
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground whitespace-nowrap">
              {info.grado.nombre} &quot;{info.seccion}&quot;
            </span>
            {info.sede && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 leading-none">
                {info.sede.nombre}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {info.nivel.nombre}
          </span>
        </div>
      );
    },
  },
  {
    id: "apoderado",
    header: () => (
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconUsersGroup className="size-3.5 text-muted-foreground/60" />
        <span>Apoderado / Contacto</span>
      </div>
    ),
    accessorFn: (row) => {
      const mainGuardian =
        row.padresTutores?.find((p) => p.contactoPrimario) ||
        row.padresTutores?.[0];
      return mainGuardian
        ? `${mainGuardian.padreTutor.name} ${mainGuardian.parentesco} ${mainGuardian.padreTutor.telefono || ""}`
        : "";
    },
    cell: ({ row }) => {
      const mainGuardian =
        row.original.padresTutores?.find((p) => p.contactoPrimario) ||
        row.original.padresTutores?.[0];

      if (!mainGuardian) {
        return (
          <span className="text-[11px] text-muted-foreground/60 italic">
            Sin apoderado asignado
          </span>
        );
      }

      const phone = mainGuardian.padreTutor.telefono?.replace(/\D/g, "");
      const studentName =
        `${row.original.name} ${row.original.apellidoPaterno}`.trim();
      const whatsappUrl = phone
        ? `https://wa.me/51${phone.length === 9 ? phone : phone.slice(-9)}?text=${encodeURIComponent(
            `Estimado(a) ${mainGuardian.padreTutor.name}, nos comunicamos de la Dirección Escolar respecto al estudiante ${studentName}.`,
          )}`
        : null;

      return (
        <div className="flex items-center justify-between gap-2 max-w-[200px]">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-foreground truncate capitalize">
              {mainGuardian.padreTutor.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.2 rounded-md border border-border/40 uppercase">
                {mainGuardian.parentesco}
              </span>
              {phone && (
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  {mainGuardian.padreTutor.telefono}
                </span>
              )}
            </div>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white flex items-center justify-center shrink-0 border border-emerald-500/20 transition-colors cursor-pointer shadow-2xs"
              title={`Enviar WhatsApp a ${mainGuardian.padreTutor.name}`}
            >
              <IconBrandWhatsapp className="size-4" />
            </a>
          )}
        </div>
      );
    },
  },
  {
    id: "sexo",
    header: () => (
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconGenderMale className="size-3.5 text-muted-foreground/60" />
        <span>Sexo</span>
      </div>
    ),
    accessorFn: (row) => row.sexo,
    cell: ({ row }) => {
      const sexo = row.original.sexo;
      const isMale =
        sexo?.toLowerCase() === "masculino" || sexo?.toLowerCase() === "m";
      const isFemale =
        sexo?.toLowerCase() === "femenino" || sexo?.toLowerCase() === "f";
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg w-fit whitespace-nowrap border",
            isMale &&
              "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
            isFemale &&
              "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
            !isMale &&
              !isFemale &&
              "bg-muted/30 text-muted-foreground border-border/40",
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
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconCircleFilled className="size-2 text-muted-foreground/60" />
        <span>Estado</span>
      </div>
    ),
    accessorFn: (row) => row.estado.nombre,
    cell: ({ row }) => {
      const estado = row.original.estado;
      return (
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg w-fit whitespace-nowrap border"
          style={{
            color: estado.color || undefined,
            borderColor: `${estado.color}30` || undefined,
            backgroundColor: `${estado.color}12` || undefined,
          }}
        >
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{
              backgroundColor: estado.color || undefined,
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
      <div className="flex items-center gap-1.5 font-bold text-xs">
        <IconCalendarEvent className="size-3.5 text-muted-foreground/60" />
        <span>Fecha Registro</span>
      </div>
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">
            {formatDate(createdAt)}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {formatTime(createdAt, "HH:mm a")?.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="flex items-center justify-center">
        {/* <IconDotsVertical className="size-3.5 text-muted-foreground/40" /> */}
        <span className="text-xs font-bold text-foreground">Acciones</span>
      </div>
    ),
    cell: ({ row, table }) => (
      <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
        <RowActions row={row} table={table as any} />
      </div>
    ),
  },
];

