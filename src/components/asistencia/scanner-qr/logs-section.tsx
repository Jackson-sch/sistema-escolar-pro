import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconClock,
  IconHistory,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function LogsSection({
  logs,
  lastScan,
}: {
  logs: any[];
  lastScan: any;
}) {
  const hoy = new Date().toLocaleDateString("es-PE");
  return (
    <Card className="h-full overflow-hidden border border-border/40 shadow-lg bg-card/80 text-foreground dark:text-white flex flex-col">
      <CardHeader className="pb-3 border-b border-border/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <IconHistory className="size-4" />
            Registro Sesión
          </CardTitle>
          <Badge
            variant="secondary"
            className="rounded-full font-mono text-[9px] dark:bg-muted/30 dark:text-muted-foreground border-border/20"
          >
            {hoy}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        {/* Highlight Section (lastScan) */}
        {lastScan && (
          <div className="p-4 bg-primary/5 border-b border-primary/10 animate-in slide-in-from-top animation-duration-">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <Avatar className="size-16 border-2 border-primary/20 shadow-xl">
                  <AvatarImage src={lastScan.image} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl uppercase">
                    {lastScan.studentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-border shadow-sm dark:bg-slate-950">
                  <IconCheck className="size-4 text-emerald-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={cn(
                      "rounded-lg uppercase text-[8px] font-black tracking-wider",
                      lastScan.status === "success"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : lastScan.status === "late"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-destructive/10 text-destructive border-destructive/20",
                    )}
                    variant="outline"
                  >
                    {lastScan.status === "success"
                      ? "Acceso Válido"
                      : lastScan.status === "late"
                        ? "Tardanza"
                        : "Error"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                    <IconClock className="size-3" /> {lastScan.time}
                  </span>
                </div>
                <h3 className="font-bold text-lg truncate tracking-tight capitalize dark:text-white">
                  {lastScan.studentName}
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest font-bold">
                  {lastScan.dni}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable History List */}
        <ScrollArea className="flex-1">
          {logs.length > 0 ? (
            <div className="divide-y divide-border/10">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 hover:bg-muted/10 transition-colors flex items-center gap-4 group"
                >
                  <div
                    className={cn(
                      "size-2 rounded-full shadow-[0_0_8px] shrink-0",
                      log.status === "success"
                        ? "bg-emerald-500 shadow-emerald-500/50"
                        : log.status === "late"
                          ? "bg-amber-500 shadow-amber-500/50"
                          : "bg-destructive shadow-destructive/50",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors tracking-tight capitalize dark:text-zinc-100">
                      {log.studentName}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {log.dni} • {log.time}
                    </p>
                  </div>
                  <IconCheck className="size-4 text-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 h-full min-h-[300px] text-muted-foreground/30 space-y-3">
              <IconAlertCircle className="size-12 stroke-1" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                Sin registros en esta sesión
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
