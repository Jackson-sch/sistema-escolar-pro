import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, LucideIcon, Smartphone } from "lucide-react";
import { ComparisonBadge } from "@/components/common/comparison-badge";

interface StatCardProps {
  title: string;
  description?: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
  comparison?: number;
  cashSales?: string;
  cardSales?: string;
  otherSales?: string;
}

export default function StatCard({
  title,
  description,
  value,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor,
  className = "",
  comparison,
  cashSales,
  cardSales,
  otherSales,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "luxury-panel shadow-none overflow-hidden relative group",
        className,
      )}
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-xl -mr-8 -mt-8 rounded-full" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          {title}
        </CardTitle>
        {iconBgColor ? (
          <div
            className={cn(
              "p-2 rounded-lg transition-transform group-hover:scale-110",
              iconBgColor,
            )}
          >
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        ) : (
          <div className="p-2 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
            <Icon className={cn("h-4 w-4", iconColor)} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl md:text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors",
          )}
        >
          {value}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {comparison !== undefined && <ComparisonBadge value={comparison} />}
          <div className="flex flex-wrap items-center gap-2">
            {cashSales !== undefined && (
              <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                <Banknote className="h-3 w-3" />
                {cashSales}
              </span>
            )}
            {cardSales !== undefined && (
              <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                <CreditCard className="h-3 w-3" />
                {cardSales}
              </span>
            )}
            {otherSales !== undefined && (
              <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                <Smartphone className="h-3 w-3" />
                {otherSales}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Named export for compatibility
export { StatCard };
