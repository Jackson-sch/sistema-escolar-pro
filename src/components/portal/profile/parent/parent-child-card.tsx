import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/formats";
import { ChildRelation } from "./parent-types";

interface ParentChildCardProps {
  relation: ChildRelation;
}

export function ParentChildCard({ relation }: ParentChildCardProps) {
  const child = relation.hijo;
  const fullName = [child.name, child.apellidoPaterno, child.apellidoMaterno]
    .filter(Boolean)
    .join(" ");
  const nivel = child.nivelAcademico;
  const gradoInfo = nivel
    ? `${nivel.grado?.nombre || ""} "${nivel.seccion}" • ${nivel.nivel?.nombre || ""}`
    : "Sin sección asignada";

  return (
    <div className="group rounded-2xl border border-border/50 bg-card/80 p-4 shadow-xs transition-all duration-200 hover:border-indigo-500/30 hover:shadow-md">
      <div className="flex items-center gap-3.5">
        <Avatar className="size-12 ring-2 ring-indigo-500/20 shadow-xs">
          <AvatarImage src={child.image || undefined} className="object-cover" />
          <AvatarFallback className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            {getInitials(child.name || "", child.apellidoPaterno || "") || "E"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-foreground truncate capitalize">
            {fullName}
          </h4>
          <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
            {gradoInfo}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge
              variant="outline"
              className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            >
              {relation.parentesco}
            </Badge>
            {child.codigoEstudiante && (
              <Badge
                variant="outline"
                className="text-[9px] font-mono px-2 py-0.5 rounded-full border-border/50 text-muted-foreground"
              >
                #{child.codigoEstudiante}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
