"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotasFilterProps {
  hijos: { id: string; name: string | null; apellidoPaterno: string | null }[];
  periodos: { id: string; nombre: string }[];
  currentHijoId: string;
  currentPeriodoId: string;
  showPeriodo?: boolean;
}

export function NotasFilter({
  hijos,
  periodos,
  currentHijoId,
  currentPeriodoId,
  showPeriodo = true,
}: NotasFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-end gap-3 sm:gap-4 bg-muted/10 p-5 rounded-[2rem] border border-border/50 backdrop-blur-sm">
      <div className="w-full sm:w-auto space-y-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
          Estudiante
        </label>
        <Select
          defaultValue={currentHijoId}
          onValueChange={(val) => updateFilter("hijoId", val)}
        >
          <SelectTrigger className="h-14 w-full sm:w-[260px] rounded-2xl border-border/50 bg-background/50 text-base font-bold transition-all focus:ring-primary/20">
            <SelectValue placeholder="Seleccione hijo" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
            {hijos.map((h) => (
              <SelectItem key={h.id} value={h.id} className="rounded-xl mt-1">
                <span className="capitalize">
                  {(h.name || "").toLowerCase()}{" "}
                  {(h.apellidoPaterno || "").toLowerCase()}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showPeriodo && (
        <div className="w-full sm:w-auto space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
            Periodo Académico
          </label>
          <Select
            defaultValue={currentPeriodoId}
            onValueChange={(val) => updateFilter("periodoId", val)}
          >
            <SelectTrigger className="h-14 w-full sm:w-[200px] rounded-2xl border-border/50 bg-background/50 text-base font-bold transition-all focus:ring-primary/20">
              <SelectValue placeholder="Seleccione periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/50 shadow-2xl">
              {periodos.map((p) => (
                <SelectItem key={p.id} value={p.id} className="rounded-xl mt-1">
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
