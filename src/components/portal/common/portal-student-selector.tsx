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
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none rounded-xl py-1 pb-3">
      {showGeneralOption && (
        <button
          onClick={() => onSelect("todos")}
          className={cn(
            "flex items-center gap-2 min-w-[120px] p-2 rounded-xl transition-all text-left border shrink-0",
            selectedId === "todos"
              ? "bg-primary/5 border-primary shadow-primary/5"
              : "bg-background/40 border-border/40 hover:border-primary/30 text-muted-foreground",
          )}
        >
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
            <IconUsers className="size-4" />
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span
              className={cn(
                "font-bold text-xs truncate",
                selectedId === "todos" ? "text-primary" : "text-foreground",
              )}
            >
              General
            </span>
            <span className="text-[9px] opacity-60 truncate">
              Institucional
            </span>
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
              "flex items-center gap-2 min-w-[130px] p-2 rounded-xl transition-all text-left border shrink-0",
              isActive
                ? "bg-primary/5 border-primary shadow-md shadow-primary/5"
                : "bg-background/40 border-border/40 hover:border-primary/30 text-muted-foreground",
            )}
          >
            <div className="relative shrink-0">
              <Avatar
                className={cn(
                  "size-8 border",
                  isActive ? "border-primary/40" : "border-transparent",
                )}
              >
                <AvatarImage
                  src={student.image || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-primary border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-tight">
              <span
                className={cn(
                  "font-bold truncate text-xs capitalize",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {student.name?.toLowerCase()}
              </span>
              <span className="text-[9px] opacity-60 truncate uppercase tracking-tight font-medium">
                {student.nivelAcademico?.grado.nombre || "Estudiante"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
