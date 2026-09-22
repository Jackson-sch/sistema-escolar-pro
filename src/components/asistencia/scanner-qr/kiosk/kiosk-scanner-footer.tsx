"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ScanLog, ScanStats } from "../scanner-types";

interface KioskScannerFooterProps {
  stats: ScanStats;
  logs: ScanLog[];
}

export function KioskScannerFooter({ stats, logs }: KioskScannerFooterProps) {
  return (
    <footer className="pt-4 border-t border-border/30 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-muted-foreground">Total Hoy:</span>
          <span className="font-mono text-sm">{stats.total}</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
          <span>Puntuales:</span>
          <span className="font-mono text-sm">{stats.puntuales}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
          <span>Tardanzas:</span>
          <span className="font-mono text-sm">{stats.tardanzas}</span>
        </div>
        {typeof stats.salidas === "number" && stats.salidas > 0 && (
          <div className="flex items-center gap-1.5 text-amber-600 font-bold">
            <span>Salidas:</span>
            <span className="font-mono text-sm">{stats.salidas}</span>
          </div>
        )}
      </div>

      {/* Mini lista de los últimos escaneados */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
        {logs.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/40 text-xs shrink-0 shadow-xs"
          >
            <Avatar className="size-6 border border-border">
              <AvatarImage src={item.image} />
              <AvatarFallback className="text-[10px]">{item.studentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="font-bold truncate max-w-[110px] text-foreground">{item.studentName}</span>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] px-1 py-0 font-bold",
                item.status === "success" ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30",
              )}
            >
              {item.time}
            </Badge>
          </div>
        ))}
      </div>
    </footer>
  );
}
