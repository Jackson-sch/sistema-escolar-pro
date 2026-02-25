import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconClock,
  IconHistory,
  IconAlertCircle,
} from "@tabler/icons-react";

/* const lastScan = {
    id: 'warn-1771512376190',
    studentName: 'liam gael sebastian espinola',
    dni: '97350652',
    time: '09:46 a. m.',
    status: 'success',
    image: undefined
  } */

export default function LogsSection({
  logs,
  lastScan,
}: {
  logs: any[];
  lastScan: any;
}) {
  console.log(lastScan);
  console.log(logs);
  return (
    <>
      {lastScan && (
        <Card className="border-2 border-primary/20 bg-primary/5 dark:bg-primary/5 shadow-2xl animate-in flip-in-x duration-500">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-20 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={lastScan.image} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-3xl uppercase">
                  {lastScan.studentName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border shadow-sm dark:bg-slate-900">
                <IconCheck className="size-5 text-emerald-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  className={cn(
                    "rounded-lg uppercase text-[9px] font-black tracking-wider",
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
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold italic">
                  <IconClock className="size-3" /> {lastScan.time}
                </span>
              </div>
              <h3 className="font-semibold text-xl truncate tracking-tight capitalize">
                {lastScan.studentName}
              </h3>
              <p className="text-xs text-muted-foreground font-mono opacity-80 uppercase tracking-widest">
                {lastScan.dni}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Log */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3 border-b border-border/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <IconHistory className="size-4" />
              Registro Sesión
            </CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full font-mono text-[9px] bg-muted/30"
            >
              {new Date().toLocaleDateString("es-PE")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[380px]">
            {logs.length > 0 ? (
              <div className="divide-y divide-border/10">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-muted/10 transition-colors flex items-center gap-4 group"
                  >
                    <div
                      className={cn(
                        "size-2.5 rounded-full shadow-[0_0_8px]",
                        log.status === "success"
                          ? "bg-emerald-500 shadow-emerald-500/50"
                          : log.status === "late"
                            ? "bg-amber-500 shadow-amber-500/50"
                            : "bg-destructive shadow-destructive/50",
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors tracking-tight capitalize">
                        {log.studentName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        {log.dni} • {log.time}
                      </p>
                    </div>
                    <IconCheck className="size-4 text-emerald-500/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground/30 space-y-3">
                <IconAlertCircle className="size-10 stroke-1" />
                <p className="text-[10px] font-semibold uppercase tracking-widest italic">
                  No hay registros
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  );
}
