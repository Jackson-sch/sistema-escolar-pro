"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NotaInputProps {
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  valor?: number;
  valorLiteral?: string;
  onChange: (valor: string, type: "valor" | "valorLiteral") => void;
  inputIndex: number;
  onKeyDown: (e: React.KeyboardEvent<any>) => void;
}

const LITERAL_OPTIONS = [
  {
    id: "AD",
    label: "AD",
    title: "Logro Destacado",
    activeClass: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold",
    hoverClass: "hover:bg-emerald-500/15 hover:text-emerald-600",
  },
  {
    id: "A",
    label: "A",
    title: "Logro Esperado",
    activeClass: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-bold",
    hoverClass: "hover:bg-indigo-500/15 hover:text-indigo-600",
  },
  {
    id: "B",
    label: "B",
    title: "En Proceso",
    activeClass: "bg-amber-500 text-white shadow-sm shadow-amber-500/30 font-bold",
    hoverClass: "hover:bg-amber-500/15 hover:text-amber-600",
  },
  {
    id: "C",
    label: "C",
    title: "En Inicio",
    activeClass: "bg-rose-600 text-white shadow-sm shadow-rose-600/30 font-bold",
    hoverClass: "hover:bg-rose-500/15 hover:text-rose-600",
  },
];

export function NotaInput({
  escala,
  valor,
  valorLiteral,
  onChange,
  inputIndex,
  onKeyDown,
}: NotaInputProps) {
  const isLiteral = escala === "LITERAL";

  // Manejo de teclado para escala literal (teclas AD, A, B, C o números 4, 3, 2, 1)
  const handleLiteralKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const key = e.key.toUpperCase();
    if (key === "A") {
      e.preventDefault();
      onChange("A", "valorLiteral");
    } else if (key === "D") {
      e.preventDefault();
      onChange("AD", "valorLiteral");
    } else if (key === "B") {
      e.preventDefault();
      onChange("B", "valorLiteral");
    } else if (key === "C") {
      e.preventDefault();
      onChange("C", "valorLiteral");
    } else if (key === "4") {
      e.preventDefault();
      onChange("AD", "valorLiteral");
    } else if (key === "3") {
      e.preventDefault();
      onChange("A", "valorLiteral");
    } else if (key === "2") {
      e.preventDefault();
      onChange("B", "valorLiteral");
    } else if (key === "1") {
      e.preventDefault();
      onChange("C", "valorLiteral");
    } else if (key === "DELETE" || key === "BACKSPACE") {
      e.preventDefault();
      onChange("", "valorLiteral");
    } else {
      onKeyDown(e);
    }
  };

  if (isLiteral) {
    return (
      <div
        role="group"
        aria-label="Calificación literal"
        data-index={inputIndex}
        tabIndex={0}
        onKeyDown={handleLiteralKeyDown}
        className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/40 gap-1 select-none"
      >
        {LITERAL_OPTIONS.map((opt) => {
          const isSelected = valorLiteral?.toUpperCase() === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              tabIndex={-1}
              onClick={() => onChange(isSelected ? "" : opt.id, "valorLiteral")}
              title={opt.title}
              className={cn(
                "size-8 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center",
                isSelected
                  ? opt.activeClass
                  : cn("text-muted-foreground/70", opt.hoverClass)
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // ── ESCALA VIGESIMAL (00-20) ──────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("", "valor");
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) {
      onChange("", "valor");
      return;
    }

    const clamped = Math.min(20, Math.max(0, num));
    onChange(clamped.toString(), "valor");
  };

  const isAprobado = valor !== undefined && valor >= 11;
  const isDesaprobado = valor !== undefined && valor < 11 && valor >= 0;

  return (
    <div className="relative w-24 mx-auto">
      <Input
        type="number"
        min={0}
        max={20}
        step={1}
        data-index={inputIndex}
        value={valor !== undefined && valor !== null ? valor : ""}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder="0-20"
        className={cn(
          "h-9 text-center font-mono text-sm font-bold rounded-xl border-border/60 transition-all focus:ring-2 focus:ring-primary/40",
          isAprobado && "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
          isDesaprobado && "border-rose-500/50 bg-rose-500/5 text-rose-700 dark:text-rose-300"
        )}
      />
    </div>
  );
}
