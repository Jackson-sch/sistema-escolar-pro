"use client";

import { Confidence } from "./smart-sizer-constants";

const CONFIDENCE_MAP = {
  alta: {
    label: "Alta precisión",
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  media: {
    label: "Precisión media",
    className:
      "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  },
  baja: {
    label: "Baja precisión",
    className:
      "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30",
  },
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = CONFIDENCE_MAP[confidence];
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${className}`}
    >
      {label}
    </span>
  );
}
