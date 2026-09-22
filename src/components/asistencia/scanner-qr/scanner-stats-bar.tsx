"use client";

import { useEffect, useState } from "react";
import {
  IconUsers,
  IconCheck,
  IconClockExclamation,
  IconClock,
  IconMaximize,
  IconVolume,
  IconVolumeOff,
  IconDoorExit,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScannerNotificationSettingsPopover } from "./scanner-notification-settings-popover";
import { ScannerModeToggle } from "./scanner-mode-toggle";
import type { ScanStats, AttendanceNotificationConfig, ScannerMode } from "./scanner-types";

interface ScannerStatsBarProps {
  stats: ScanStats;
  mode: ScannerMode;
  onModeChange: (mode: ScannerMode) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenKiosk: () => void;
  onNotificationConfigChange?: (config: AttendanceNotificationConfig) => void;
}

export function ScannerStatsBar({
  stats,
  mode,
  onModeChange,
  isAudioEnabled,
  onToggleAudio,
  onOpenKiosk,
  onNotificationConfigChange,
}: ScannerStatsBarProps) {

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
      );
      setCurrentDate(
        now.toLocaleDateString("es-PE", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const puntualPct = stats.total > 0 ? Math.round((stats.puntuales / stats.total) * 100) : 0;
  const tardanzaPct = stats.total > 0 ? Math.round((stats.tardanzas / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 sm:p-4 rounded-2xl bg-card/70 border border-border/50 backdrop-blur-md shadow-xs">
      {/* Reloj y Fecha en vivo */}
      <div className="md:col-span-3 flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <IconClock className="size-5 text-primary animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-foreground dark:text-white">
              {currentTime || "00:00:00"}
            </span>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
              EN VIVO
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground capitalize font-medium">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Selector de Modo (Ingreso vs Salida / Pick-up) */}
      <div className="md:col-span-3 flex items-center justify-start sm:justify-center">
        <ScannerModeToggle mode={mode} onChange={onModeChange} />
      </div>

      {/* Contadores rápidos de la jornada */}
      <div className="md:col-span-3 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/40">
          <IconUsers className="size-4 text-muted-foreground" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-muted-foreground font-semibold">Total:</span>
            <span className="font-bold text-sm text-foreground">{stats.total}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <IconCheck className="size-4" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold">Puntuales:</span>
            <span className="font-bold text-sm">{stats.puntuales}</span>
            {stats.total > 0 && <span className="text-[10px] font-mono opacity-80">({puntualPct}%)</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <IconClockExclamation className="size-4" />
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-semibold">Tardanzas:</span>
            <span className="font-bold text-sm">{stats.tardanzas}</span>
            {stats.total > 0 && <span className="text-[10px] font-mono opacity-80">({tardanzaPct}%)</span>}
          </div>
        </div>

        {typeof stats.salidas === "number" && stats.salidas > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-600/10 border border-amber-600/20 text-amber-700 dark:text-amber-400">
            <IconDoorExit className="size-4" />
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold">Salidas:</span>
              <span className="font-bold text-sm">{stats.salidas}</span>
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción: Notificaciones Padres, Sonido y Modo Kiosco */}
      <div className="md:col-span-3 flex items-center justify-end gap-2 flex-wrap">

        <ScannerNotificationSettingsPopover onConfigChange={onNotificationConfigChange} />

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAudio}
          className={cn(
            "rounded-xl gap-1.5 text-xs font-medium border-border/50",
            !isAudioEnabled && "text-muted-foreground",
          )}
          title={isAudioEnabled ? "Sonido activado (voz y chimes)" : "Sonido desactivado"}
        >
          {isAudioEnabled ? (
            <>
              <IconVolume className="size-4 text-emerald-500" />
              <span className="hidden sm:inline">Audio</span>
            </>
          ) : (
            <>
              <IconVolumeOff className="size-4 text-muted-foreground" />
              <span className="hidden sm:inline">Silenciado</span>
            </>
          )}
        </Button>

        <Button
          onClick={onOpenKiosk}
          size="sm"
          className="rounded-xl font-bold gap-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:scale-[1.02]"
        >
          <IconMaximize className="size-4" />
          <span>Modo Kiosco</span>
        </Button>
      </div>
    </div>
  );
}
