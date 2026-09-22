import { cn } from "@/lib/utils";

interface ParentInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  isMono?: boolean;
  colorClass?: string;
}

export function ParentInfoRow({
  icon: Icon,
  label,
  value,
  isMono = false,
  colorClass = "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
}: ParentInfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border shadow-xs",
          colorClass,
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          {label}
        </span>
        <p
          className={cn(
            "text-xs md:text-sm font-semibold text-foreground truncate mt-0.5",
            isMono && "font-mono",
          )}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
