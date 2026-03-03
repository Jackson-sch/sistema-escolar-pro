import { Card, CardContent } from "@/components/ui/card";

interface PortalStatCardProps {
  title: string;
  value: string;
  icon: any;
  color: "blue" | "amber" | "red" | "violet" | "green";
  description?: string;
}

export function PortalStatCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: PortalStatCardProps) {
  const themes = {
    blue: {
      bg: "bg-linear-to-br from-info/10 via-info/5 to-transparent",
      icon: "bg-info/20 text-info border-info/30",
      border: "border-info/20",
      accent: "bg-info",
    },
    amber: {
      bg: "bg-linear-to-br from-warning/10 via-warning/5 to-transparent",
      icon: "bg-warning/20 text-warning border-warning/30",
      border: "border-warning/20",
      accent: "bg-warning",
    },
    red: {
      bg: "bg-linear-to-br from-destructive/10 via-destructive/5 to-transparent",
      icon: "bg-destructive/20 text-destructive border-destructive/30",
      border: "border-destructive/20",
      accent: "bg-destructive",
    },
    violet: {
      bg: "bg-linear-to-br from-primary/10 via-primary/5 to-transparent",
      icon: "bg-primary/20 text-primary border-primary/30",
      border: "border-primary/20",
      accent: "bg-primary",
    },
    green: {
      bg: "bg-linear-to-br from-success/10 via-success/5 to-transparent",
      icon: "bg-success/20 text-success border-success/30",
      border: "border-success/20",
      accent: "bg-success",
    },
  };

  const theme = themes[color];

  return (
    <Card
      className={`relative overflow-hidden border ${theme.border} ${theme.bg} backdrop-blur-md transition-all hover:scale-[1.02] duration-300`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-14 items-center justify-center rounded-2xl border shadow-lg ${theme.icon}`}
          >
            <Icon className="size-7" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              {title}
            </p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            {description && (
              <p className="text-[11px] font-medium text-muted-foreground/60 italic">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <div
        className={`absolute -right-4 -top-4 size-24 rounded-full opacity-10 blur-2xl ${theme.accent}`}
      />
    </Card>
  );
}
