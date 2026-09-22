"use client";

import { CheckCircle2, Info } from "lucide-react";
import { SizerResult } from "./smart-sizer-constants";
import { ConfidenceBadge } from "./confidence-badge";

export function SizerResultCard({ result }: { result: SizerResult }) {
  return (
    <div className="relative z-10 space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-5 shadow-inner transition-[color,margin,letter-spacing] duration-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-200/70 mb-1">
            Talla Sugerida
          </p>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-black leading-none text-indigo-950 dark:text-white">
              {result.primary}
            </span>
            {result.fallback && (
              <span className="text-base font-black text-indigo-950/40 dark:text-white/40">
                o {result.fallback}
              </span>
            )}
          </div>
        </div>
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* Signals */}
      {result.signals.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-[11px] text-indigo-950/80 dark:text-indigo-200/80 font-medium">
            Basado en:{" "}
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              {result.signals.join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* Conflict note */}
      {result.note && (
        <div className="flex items-start gap-1.5 bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-3 py-2.5">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-200 font-bold leading-normal">
            {result.note}
          </p>
        </div>
      )}

      {result.confidence === "baja" && (
        <p className="text-[11px] text-indigo-950/60 dark:text-indigo-200/60 font-medium italic">
          💡 Para mayor precisión, agrega estatura y peso.
        </p>
      )}
    </div>
  );
}
