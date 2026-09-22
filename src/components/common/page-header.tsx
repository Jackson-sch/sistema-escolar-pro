import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  badge,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 sm:flex-row sm:items-start",
        className
      )}
    >
      <div className="space-y-1.5 min-w-0 flex-1">
        {/* Breadcrumbs / Context trail */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground pb-0.5 flex-wrap">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.href || "no-href"}-${crumb.label}-${idx}`}>
                  {idx > 0 && <IconChevronRight size={12} className="opacity-50 shrink-0" />}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={cn("truncate max-w-[150px] sm:max-w-none", isLast && "text-foreground font-semibold")}>
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <div className="flex items-start gap-3 min-w-0">
          {icon && (
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1
                className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-foreground break-words line-clamp-2 leading-snug max-w-full"
                title={typeof title === "string" ? title : undefined}
              >
                {title}
              </h1>
              {badge && (
                typeof badge === "string" ? (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border-primary/30 text-primary bg-primary/5 rounded-full shrink-0">
                    {badge}
                  </Badge>
                ) : (
                  badge
                )
              )}
            </div>

            {description && (
              <p className="text-xs text-muted-foreground font-normal leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-none break-words">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-start mt-0.5 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
}
