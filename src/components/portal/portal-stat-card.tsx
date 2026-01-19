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
      bg: "bg-linear-to-br from-blue-500/10 via-blue-500/5 to-transparent",
      icon: "bg-blue-500/20 text-blue-500 border-blue-500/30",
      border: "border-blue-500/20",
      accent: "bg-blue-500",
    },
    amber: {
      bg: "bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent",
      icon: "bg-amber-500/20 text-amber-500 border-amber-500/30",
      border: "border-amber-500/20",
      accent: "bg-amber-500",
    },
    red: {
      bg: "bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent",
      icon: "bg-red-500/20 text-red-500 border-red-500/30",
      border: "border-red-500/20",
      accent: "bg-red-500",
    },
    violet: {
      bg: "bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent",
      icon: "bg-violet-500/20 text-violet-500 border-violet-500/30",
      border: "border-violet-500/20",
      accent: "bg-violet-500",
    },
    green: {
      bg: "bg-linear-to-br from-green-500/10 via-green-500/5 to-transparent",
      icon: "bg-green-500/20 text-green-500 border-green-500/30",
      border: "border-green-500/20",
      accent: "bg-green-500",
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
