"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  subtitle: string;
}

export function SectionHeader({
  icon,
  colorClass,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
      <div
        className={cn(
          "size-8 rounded-xl border flex items-center justify-center shrink-0",
          colorClass,
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
