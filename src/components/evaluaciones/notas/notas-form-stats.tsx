import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

interface NotasFormStatsProps {
  total: number;
  aprobados: number;
  desaprobados: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function NotasFormStats({
  total,
  aprobados,
  desaprobados,
  searchValue,
  onSearchChange,
}: NotasFormStatsProps) {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 justify-between items-center bg-background/50">
      <div className="flex flex-wrap gap-2 w-full md:w-auto font-black text-[10px]">
        <Badge className="flex items-center gap-2 px-2 py-1 rounded-full bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">Total Estudiantes</span>
          <span className="text-foreground">{total}</span>
        </Badge>
        <Badge className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/10">
          <IconCheck className="size-3 text-emerald-500" />
          <span className="text-emerald-600">Calificados</span>
          <span className="text-foreground">{aprobados}</span>
        </Badge>
        <Badge className="flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/10">
          <IconX className="size-3 text-red-500" />
          <span className="text-red-600">Pendientes</span>
          <span className="text-foreground">{desaprobados}</span>
        </Badge>
      </div>

      <div className="relative w-full md:w-[300px] group">
        <InputGroup className="rounded-full">
          <InputGroupAddon>
            <IconSearch className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por nombre o código..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </InputGroup>
      </div>
    </div>
  );
}
