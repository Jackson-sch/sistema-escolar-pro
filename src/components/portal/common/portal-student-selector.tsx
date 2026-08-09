"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { IconUsers } from "@tabler/icons-react";

interface Student {
  id: string;
  name: string | null;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  image?: string | null;
  nivelAcademico?: {
    seccion?: string | null;
    nivel?: { nombre: string } | null;
    grado: { nombre: string };
  } | null;
}

interface PortalStudentSelectorProps {
  students: Student[];
  selectedId: string;
  onSelect: (id: string) => void;
  showGeneralOption?: boolean;
}

export function PortalStudentSelector({
  students,
  selectedId,
  onSelect,
  showGeneralOption = false,
}: PortalStudentSelectorProps) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1">
      {showGeneralOption && (
        <button
          onClick={() => onSelect("todos")}
          className={cn(
            "flex items-center gap-2.5 min-w-[140px] p-2.5 rounded-xl transition-[color,background-color,border-color,box-shadow] text-left border shrink-0 cursor-pointer",
            selectedId === "todos"
              ? "bg-indigo-500/10 border-indigo-500/40 shadow-xs"
              : "bg-card/80 border-border/40 hover:border-indigo-500/30 text-muted-foreground",
          )}
        >
          <div className="size-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <IconUsers className="size-4" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span
              className={cn(
                "font-bold text-xs truncate",
                selectedId === "todos" ? "text-indigo-600 dark:text-indigo-400" : "text-foreground",
              )}
            >
              General
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
              Todos los Hijos
            </span>
          </div>
        </button>
      )}

      {students.map((student) => {
        const isActive = selectedId === student.id;

        // Nombre completo formateado
        const fullName = [
          student.name,
          student.apellidoPaterno,
          student.apellidoMaterno,
        ]
          .filter(Boolean)
          .join(" ");

        const initials = `${student.name?.[0] || ""}${
          student.apellidoPaterno?.[0] || ""
        }`.toUpperCase();

        const gradeDetail = student.nivelAcademico
          ? `${student.nivelAcademico.grado.nombre}${
              student.nivelAcademico.seccion
                ? ` "${student.nivelAcademico.seccion}"`
                : ""
            }${
              student.nivelAcademico.nivel?.nombre
                ? ` • ${student.nivelAcademico.nivel.nombre}`
                : ""
            }`
          : "Estudiante";

        return (
          <button
            key={student.id}
            onClick={() => onSelect(student.id)}
            className={cn(
              "flex items-center gap-2.5 min-w-[210px] p-2.5 rounded-xl transition-[color,background-color,border-color,box-shadow] text-left border shrink-0 cursor-pointer",
              isActive
                ? "bg-indigo-500/10 border-indigo-500/40 shadow-xs"
                : "bg-card/80 border-border/40 hover:border-indigo-500/30 text-muted-foreground",
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                className={cn(
                  "size-9 border transition-colors",
                  isActive ? "border-indigo-500/40" : "border-border/30",
                )}
              >
                <AvatarImage
                  src={student.image || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-indigo-600 border-2 border-card rounded-full" />
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-tight">
              <span
                className={cn(
                  "font-bold truncate text-xs capitalize",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-foreground",
                )}
                title={fullName}
              >
                {fullName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                {gradeDetail}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
