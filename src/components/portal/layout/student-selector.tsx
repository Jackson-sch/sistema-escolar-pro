"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

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

interface StudentSelectorProps {
  students: Student[];
  orientation?: "horizontal" | "vertical";
}

export function StudentSelector({
  students,
  orientation = "horizontal",
}: StudentSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = searchParams.get("hijoId") || students[0]?.id;

  const handleSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("hijoId", id);
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "flex gap-2.5 overflow-x-auto scrollbar-none py-1",
        orientation === "vertical"
          ? "flex-col items-stretch overflow-y-auto"
          : "items-center",
      )}
    >
      {students.map((student) => {
        const isActive = currentId === student.id;

        // Nombre completo formateado
        const fullName = [
          student.name,
          student.apellidoPaterno,
          student.apellidoMaterno,
        ]
          .filter(Boolean)
          .join(" ");

        // Iniciales para el fallback
        const initials = `${student.name?.[0] || ""}${
          student.apellidoPaterno?.[0] || ""
        }`.toUpperCase();

        // Detalle de grado y nivel
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
          : "Estudiante Matriculado";

        return (
          <button
            key={student.id}
            onClick={() => handleSelect(student.id)}
            className={cn(
              "flex min-w-[200px] shrink-0 items-center gap-3 rounded-xl border p-2.5 text-left transition-[color,background-color,border-color,box-shadow] cursor-pointer",
              isActive
                ? "border-indigo-500/40 bg-indigo-500/10 shadow-xs"
                : "border-border/40 bg-card/80 hover:bg-card hover:border-indigo-500/20 text-muted-foreground",
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
                <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-indigo-600" />
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
