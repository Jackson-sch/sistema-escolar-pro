import { ComponentType } from "react";

interface EnrollmentSectionHeaderProps {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  description: string;
}

export function EnrollmentSectionHeader({
  icon: Icon,
  iconClassName,
  title,
  description,
}: EnrollmentSectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
      <div
        className={`size-8 rounded-xl border flex items-center justify-center shrink-0 ${iconClassName}`}
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
