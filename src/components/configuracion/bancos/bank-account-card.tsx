"use client";

import {
  IconBuildingBank,
  IconDeviceMobile,
  IconStar,
  IconCheck,
  IconChevronRight,
  IconCopy,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface BankAccountCardProps {
  cuenta: {
    id: string;
    nombre: string;
    numero: string;
    tipo: "BANCO" | "BILLETERA_DIGITAL";
    esPrincipal?: boolean;
    titular?: string;
    tipoCuenta?: string | null;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function BankAccountCard({
  cuenta,
  isSelected,
  onSelect,
}: BankAccountCardProps) {
  const { copy } = useCopyToClipboard();
  const isBanco = cuenta.tipo === "BANCO";

  // Identificación de color de acento
  const getBrandAccent = () => {
    const n = cuenta.nombre.toLowerCase();
    if (n.includes("bcp")) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    if (n.includes("bbva")) return "text-sky-500 bg-sky-500/10 border-sky-500/20";
    if (n.includes("interbank")) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (n.includes("scotia")) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (n.includes("yape")) return "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20";
    if (n.includes("plin")) return "text-cyan-500 bg-cyan-500/10 border-cyan-500/20";
    return isBanco
      ? "text-primary bg-primary/10 border-primary/20"
      : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div
      className={cn(
        "w-full text-left p-3.5 rounded-2xl border transition-all relative flex items-center justify-between group bg-card shadow-2xs",
        isSelected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
          : "border-border/60 hover:border-primary/40 hover:bg-muted/20",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Seleccionar cuenta ${cuenta.nombre}`}
        aria-pressed={isSelected}
        className="absolute inset-0 size-full rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-0"
      />
      <div className="flex items-center gap-3.5 min-w-0 pointer-events-none">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0 border",
            getBrandAccent(),
          )}
        >
          {isBanco ? (
            <IconBuildingBank className="size-5" />
          ) : (
            <IconDeviceMobile className="size-5" />
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-xs text-foreground truncate">
              {cuenta.nombre}
            </p>
            {cuenta.esPrincipal && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                <IconStar className="size-2.5 fill-amber-500 text-amber-500" />
                Principal
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
            <span className="truncate">{cuenta.numero}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copy(cuenta.numero, "Número copiado");
              }}
              className="relative z-10 pointer-events-auto opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity p-0.5 cursor-pointer"
              title="Copiar número"
            >
              <IconCopy className="size-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isSelected ? (
          <div className="size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xs">
            <IconCheck className="size-3" strokeWidth={3} />
          </div>
        ) : (
          <IconChevronRight className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}
