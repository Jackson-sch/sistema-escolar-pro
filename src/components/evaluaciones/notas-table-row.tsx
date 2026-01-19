import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IconCheck, IconClockHour4, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { NotaInput } from "./nota-input";
import { NotaFeedbackPopover } from "./nota-feedback-popover";

interface StudentType {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codigoEstudiante: string | null;
}

interface NotaData {
  valor: number;
  valorLiteral?: string;
  comentario?: string;
}

interface NotasTableRowProps {
  estudiante: StudentType;
  index: number;
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  notaData?: NotaData;
  onNotaChange: (
    estudianteId: string,
    valor: string,
    type: "valor" | "valorLiteral" | "comentario",
  ) => void;
  onGenerateAI: (est: StudentType) => void;
  isStreaming: boolean;
  streamingContent: string | null;
  isActiveForAI: boolean;
}

export function NotasTableRow({
  estudiante,
  index,
  escala,
  notaData,
  onNotaChange,
  onGenerateAI,
  isStreaming,
  streamingContent,
  isActiveForAI,
}: NotasTableRowProps) {
  const getNotaStatus = (data?: NotaData) => {
    if (!data) return "pendiente";
    if (escala === "LITERAL") {
      if (data.valorLiteral === "C") return "desaprobado";
      return "aprobado";
    }
    if (data.valor >= 11) return "aprobado";
    return "desaprobado";
  };

  const status = getNotaStatus(notaData);
  const initials =
    `${estudiante.name?.[0] || ""}${estudiante.apellidoPaterno?.[0] || ""}`.toUpperCase();

  return (
    <TableRow className="group hover:bg-violet-600/5 transition-colors border-b border-border/10 last:border-0">
      <TableCell className="text-center font-mono text-[10px] text-muted-foreground/40 hidden md:table-cell">
        {String(index + 1).padStart(2, "0")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-2xl border border-border/40 shadow-sm transition-transform group-hover:scale-105">
            <AvatarFallback className="text-xs font-black bg-violet-600/5 text-violet-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm tracking-tight text-foreground/90 uppercase truncate">
              {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
              {estudiante.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/70 uppercase">
              {estudiante.codigoEstudiante || "SIN CÓDIGO"}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-2">
        <NotaInput
          escala={escala}
          valor={notaData?.valor}
          valorLiteral={notaData?.valorLiteral}
          onChange={(v, type) => onNotaChange(estudiante.id, v, type)}
        />
      </TableCell>
      <TableCell className="text-right hidden sm:table-cell">
        <StatusBadge status={status} />
      </TableCell>
      <TableCell className="text-center">
        <NotaFeedbackPopover
          comentario={notaData?.comentario}
          isStreaming={isStreaming && isActiveForAI}
          onGenerateAI={() => onGenerateAI(estudiante)}
          onCommentChange={(v) => onNotaChange(estudiante.id, v, "comentario")}
          streamingContent={isActiveForAI ? streamingContent : null}
        />
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    pendiente: {
      label: "Pte.",
      color: "bg-muted/50 text-muted-foreground/60",
      icon: IconClockHour4,
    },
    aprobado: {
      label: "Logrado",
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      icon: IconCheck,
    },
    desaprobado: {
      label: "En Inicio",
      color: "bg-red-500/10 text-red-600 border-red-500/20",
      icon: IconX,
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[9px] font-black uppercase tracking-tight px-2.5 py-0.5 gap-1.5 rounded-lg border-0 shadow-sm",
        config.color,
      )}
    >
      <Icon className="size-2.5" />
      {config.label}
    </Badge>
  );
}
