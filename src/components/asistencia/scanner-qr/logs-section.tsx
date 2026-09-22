"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconClock,
  IconHistory,
  IconAlertCircle,
  IconSearch,
  IconSchool,
  IconBell,
  IconDoorExit,
} from "@tabler/icons-react";

import type { ScanLog } from "./scanner-types";

interface LogsSectionProps {
  logs: ScanLog[];
  lastScan: ScanLog | null;
}

export default function LogsSection({ logs, lastScan }: LogsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "late" | "salida">("all");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        searchTerm === "" ||
        log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.dni && log.dni.includes(searchTerm)) ||
        (log.aula && log.aula.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "salida" && log.mode === "salida") ||
        (filterStatus === "success" && log.status === "success" && log.mode !== "salida") ||
        (filterStatus === "late" && log.status === "late" && log.mode !== "salida");

      return matchSearch && matchStatus;
    });
  }, [logs, searchTerm, filterStatus]);


  return (
    <Card className="h-full overflow-hidden border border-border/40 shadow-md bg-card/80 text-foreground flex flex-col">
      <CardHeader className="pb-3 pt-5 px-5 border-b border-border/20 space-y-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <IconHistory className="size-4 text-primary" />
            Registro de Sesión
          </CardTitle>
          <Badge variant="outline" className="font-mono text-[10px] rounded-full">
            {logs.length} registros hoy
          </Badge>
        </div>

        {/* Buscador y filtro rápido */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por estudiante o DNI..."
              className="h-8 pl-8 text-xs rounded-lg bg-background/80 border-border/40"
            />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterStatus("all")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                filterStatus === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/40",
              )}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("success")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                filterStatus === "success" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:bg-muted/40",
              )}
            >
              Puntual
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("late")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                filterStatus === "late" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:bg-muted/40",
              )}
            >
              Tarde
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("salida")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-colors",
                filterStatus === "salida" ? "bg-amber-600 text-white" : "text-muted-foreground hover:bg-muted/40",
              )}
            >
              Salida
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
        {/* Destacado del Último Escaneado */}
        {lastScan && (
          <div className="p-4 bg-primary/5 border-b border-primary/15 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3.5">
              <div className="relative shrink-0">
                <Avatar className="size-14 border-2 border-primary/20 shadow-md">
                  <AvatarImage src={lastScan.image} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                    {lastScan.studentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border shadow-xs">
                  {lastScan.mode === "salida" ? (
                    <IconDoorExit className="size-3.5 text-amber-600" />
                  ) : (
                    <IconCheck className="size-3.5 text-emerald-500" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  {lastScan.mode === "salida" ? (
                    <Badge
                      className="rounded-md uppercase text-[9px] font-bold px-1.5 py-0 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 flex items-center gap-1"
                      variant="outline"
                    >
                      <IconDoorExit className="size-3" /> Salida (Pick-up)
                    </Badge>
                  ) : (
                    <Badge
                      className={cn(
                        "rounded-md uppercase text-[9px] font-bold px-1.5 py-0",
                        lastScan.status === "success"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : lastScan.status === "late"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "bg-destructive/15 text-destructive border-destructive/30",
                      )}
                      variant="outline"
                    >
                      {lastScan.status === "success" ? "Puntual" : lastScan.status === "late" ? "Tardanza" : "Registrado"}
                    </Badge>
                  )}
                  {lastScan.notification?.notified && (
                    <Badge
                      variant="outline"
                      className="rounded-md text-[9px] font-bold px-1.5 py-0 bg-primary/10 text-primary border-primary/30 flex items-center gap-1"
                    >
                      <IconBell className="size-2.5" />
                      {lastScan.notification.channels?.length ? lastScan.notification.channels.join(" • ") : "Aviso a Padres"}
                    </Badge>
                  )}
                  <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 font-semibold">
                    <IconClock className="size-3" /> {lastScan.time}
                  </span>
                </div>

                <h4 className="font-bold text-sm truncate text-foreground">
                  {lastScan.studentName}
                </h4>

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  {lastScan.dni && <span className="font-mono">DNI: {lastScan.dni}</span>}
                  {lastScan.aula && (
                    <span className="flex items-center gap-1 truncate text-primary/80 font-medium">
                      <IconSchool className="size-3" />
                      {lastScan.aula}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Registros */}
        <ScrollArea className="flex-1 max-h-[500px]">
          {filteredLogs.length > 0 ? (
            <div className="divide-y divide-border/10">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-muted/30 transition-colors flex items-center gap-3 group"
                >
                  <div
                    className={cn(
                      "size-2.5 rounded-full shadow-xs shrink-0",
                      log.mode === "salida"
                        ? "bg-amber-600 shadow-amber-600/40"
                        : log.status === "success"
                          ? "bg-emerald-500 shadow-emerald-500/40"
                          : log.status === "late"
                            ? "bg-amber-500 shadow-amber-500/40"
                            : "bg-destructive shadow-destructive/40",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors text-foreground">
                          {log.studentName}
                        </p>
                        {log.mode === "salida" && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold shrink-0">
                            Salida
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {log.notification?.notified && (
                          <IconBell className="size-3 text-primary shrink-0" />
                        )}
                        <span className="text-[10px] font-mono text-muted-foreground font-medium">
                          {log.time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium truncate">
                      {log.dni && <span className="font-mono">{log.dni}</span>}
                      {log.aula && <span>• {log.aula}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 h-48 text-muted-foreground/50 space-y-2">
              <IconAlertCircle className="size-8 stroke-1" />
              <p className="text-xs font-semibold">
                {searchTerm ? "No hay coincidencias con la búsqueda" : "Sin registros en esta sesión"}
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
