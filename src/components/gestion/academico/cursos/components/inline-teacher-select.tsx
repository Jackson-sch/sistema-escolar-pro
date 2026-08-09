"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignTeacherAction } from "@/actions/academic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconChevronDown, IconLoader2 } from "@tabler/icons-react";

interface InlineTeacherSelectProps {
  courseId: string;
  currentProfesorId: string | null;
  currentProfesor: any;
  profesores: any[];
}

export function InlineTeacherSelect({
  courseId,
  currentProfesorId,
  currentProfesor,
  profesores = [],
}: InlineTeacherSelectProps) {
  const [selectedProfId, setSelectedProfId] = useState<string | null>(
    currentProfesorId,
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const activeProfesor =
    profesores.find((p) => p.id === selectedProfId) ||
    (selectedProfId === currentProfesorId ? currentProfesor : null);

  const handleSelect = async (newProfesorId: string) => {
    const valueToSet = newProfesorId === "UNASSIGNED" ? null : newProfesorId;
    setSelectedProfId(valueToSet);
    setLoading(true);
    try {
      const res = await assignTeacherAction(courseId, valueToSet);
      if (res.success) {
        toast.success("Docente actualizado en tiempo real");
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
        setSelectedProfId(currentProfesorId);
      }
    } catch {
      toast.error("Error al actualizar docente");
      setSelectedProfId(currentProfesorId);
    } finally {
      setLoading(false);
    }
  };

  const firstName = activeProfesor?.name || "";
  const lastName = activeProfesor?.apellidoPaterno || "";
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  const unassigned = !activeProfesor;

  return (
    <div
      className="relative inline-flex items-center gap-1.5 min-w-0 max-w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <Avatar className="size-5 shrink-0 border border-border/50">
        <AvatarImage src={activeProfesor?.image ?? undefined} />
        <AvatarFallback
          className={`text-[9px] font-bold ${
            unassigned
              ? "bg-muted text-muted-foreground/40"
              : "bg-primary/20 text-primary"
          }`}
        >
          {unassigned ? "—" : initials}
        </AvatarFallback>
      </Avatar>

      <div className="relative flex items-center min-w-0 flex-1">
        <select
          disabled={loading}
          aria-label="Seleccionar docente del curso"
          value={selectedProfId || "UNASSIGNED"}
          onChange={(e) => handleSelect(e.target.value)}
          className="h-7 text-xs font-semibold bg-muted/40 hover:bg-accent/60 border border-border/40 rounded-lg pl-2 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground transition-[background-color,outline-color,box-shadow,opacity] disabled:opacity-50 w-full max-w-[170px] truncate"
        >
          <option
            value="UNASSIGNED"
            className="text-muted-foreground italic bg-background text-xs"
          >
            Sin Docente
          </option>
          {profesores.map((p) => (
            <option
              key={p.id}
              value={p.id}
              className="bg-background text-foreground text-xs font-semibold py-1"
            >
              {p.name} {p.apellidoPaterno || ""}
            </option>
          ))}
        </select>
        {loading ? (
          <IconLoader2
            size={11}
            className="absolute right-2 text-primary animate-spin pointer-events-none"
          />
        ) : (
          <IconChevronDown
            size={12}
            className="absolute right-2 text-muted-foreground/70 pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
