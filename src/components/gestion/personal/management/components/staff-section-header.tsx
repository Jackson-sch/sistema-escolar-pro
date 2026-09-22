import React from "react";

interface StaffSectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
}

export function StaffSectionHeader({
  icon: Icon,
  title,
  description,
  colorClass,
}: StaffSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
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
  );
}
