import React from "react";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  icon: Icon,
  title,
  description,
  colorClass,
  action,
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center ${action ? "justify-between" : "gap-2.5"} pb-2.5 border-b border-border/30`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`size-8 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
