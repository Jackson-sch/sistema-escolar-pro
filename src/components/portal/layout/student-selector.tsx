"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Student {
  id: string;
  name: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  image: string | null;
  nivelAcademico?: {
    nivel: { nombre: string };
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
        "flex gap-3 overflow-x-auto scrollbar-none",
        orientation === "vertical"
          ? "flex-col items-stretch overflow-y-auto"
          : "items-center",
      )}
    >
      {students.map((student) => {
        const isActive = currentId === student.id;
        const initials =
          `${student.name?.[0] || ""}${student.apellidoPaterno?.[0] || ""}`.toUpperCase();

        return (
          <button
            key={student.id}
            onClick={() => handleSelect(student.id)}
            className={cn(
              "flex items-center gap-3 min-w-[160px] p-2 rounded-xl transition-all text-left border shrink-0",
              isActive
                ? "bg-card border-primary border"
                : "bg-card border hover:bg-card text-slate-400 hover:text-slate-200",
            )}
          >
            <div className="relative">
              <Avatar
                className={cn(
                  "size-10 border",
                  isActive ? "border-primary" : "border-transparent",
                )}
              >
                <AvatarImage
                  src={student.image || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-primary border-2 border-card rounded-full" />
              )}
            </div>

            <div className="flex flex-col min-w-0 leading-tight">
              <span
                className={cn(
                  "font-bold truncate text-sm capitalize",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {student.name}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {student.nivelAcademico?.grado.nombre || "Estudiante"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
