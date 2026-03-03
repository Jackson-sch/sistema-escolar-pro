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
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 rounded-2xl">
      {showGeneralOption && (
        <button
          onClick={() => onSelect("todos")}
          className={cn(
            "flex items-center gap-3 min-w-[140px] p-3 rounded-2xl transition-all text-left border",
            selectedId === "todos"
              ? "bg-primary/5 border-primary shadow-primary/10"
              : "bg-background border-border/50 hover:border-primary/50 text-muted-foreground",
          )}
        >
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <IconUsers className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className={cn(
                "font-bold text-sm",
                selectedId === "todos" ? "text-primary" : "text-foreground",
              )}
            >
              General
            </span>
            <span className="text-[10px] opacity-70">Institucional</span>
          </div>
        </button>
      )}

      {students.map((student) => {
        const isActive = selectedId === student.id;
        const initials =
          `${student.name?.[0] || ""}${student.apellidoPaterno?.[0] || ""}`.toUpperCase();

        return (
          <button
            key={student.id}
            onClick={() => onSelect(student.id)}
            className={cn(
              "flex items-center gap-3 min-w-[160px] p-3 rounded-2xl transition-all text-left border shrink-0",
              isActive
                ? "bg-primary/5 border-primary shadow-lg shadow-primary/10"
                : "bg-background border-border/50 hover:border-primary/50 text-muted-foreground",
            )}
          >
            <div className="relative">
              <Avatar
                className={cn(
                  "size-10 border",
                  isActive ? "border-primary/50" : "border-transparent",
                )}
              >
                <AvatarImage
                  src={student.image || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-primary border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-tight">
              <span
                className={cn(
                  "font-bold truncate text-sm capitalize",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {student.name?.toLowerCase()}
              </span>
              <span className="text-[10px] opacity-70 truncate uppercase tracking-wider font-medium">
                {student.nivelAcademico?.grado.nombre || "Estudiante"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
