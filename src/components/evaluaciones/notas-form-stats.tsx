import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";

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
    <div className="flex flex-col-reverse md:flex-row gap-4 justify-between items-center bg-background/50 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
      <div className="flex flex-wrap gap-2 w-full md:w-auto font-black text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/40">
          <span className="text-muted-foreground">Total Estudiantes</span>
          <span className="text-foreground">{total}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <IconCheck className="size-3 text-emerald-500" />
          <span className="text-emerald-600">Calificados</span>
          <span className="text-foreground">{aprobados}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/5 border border-red-500/10">
          <IconX className="size-3 text-red-500" />
          <span className="text-red-600">Pendientes</span>
          <span className="text-foreground">{desaprobados}</span>
        </div>
      </div>

      <div className="relative w-full md:w-[300px] group">
        <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground group-focus-within:text-violet-500 transition-colors" />
        <Input
          placeholder="Buscar por nombre o código..."
          className="pl-10 h-10 rounded-xl bg-background/50 border-border/40 focus:border-violet-500/50 transition-all shadow-none ring-0 focus-visible:ring-0"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
