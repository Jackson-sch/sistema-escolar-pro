"use client";

import { useEffect, useState, useRef } from "react";
import {
  IconX,
  IconClock,
  IconSwitchHorizontal,
  IconVolume,
  IconVolumeOff,
  IconSchool,
  IconRefresh,
  IconCamera,
  IconLock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KioskStudentCard } from "./kiosk-student-card";
import { KioskScannerFooter } from "./kiosk-scanner-footer";
import { ScannerModeToggle } from "../scanner-mode-toggle";
import type { ScanLog, ScanStats, ScannerMode } from "../scanner-types";

interface KioskScannerViewProps {
  logs: ScanLog[];
  lastScan: ScanLog | null;
  stats: ScanStats;
  mode: ScannerMode;
  onModeChange: (mode: ScannerMode) => void;
  isAudioEnabled: boolean;
  facingMode: "user" | "environment";
  isScanning: boolean;
  isChangingCamera: boolean;
  permissionDenied?: boolean;
  onToggleAudio: () => void;
  onToggleCamera: () => void;
  onStartScanner: (targetId?: string) => Promise<void>;
  onStopScanner: () => Promise<void>;
  onClose: () => void;
  onClearLastScan: () => void;
}

export function KioskScannerView({
  logs,
  lastScan,
  stats,
  mode,
  onModeChange,
  isAudioEnabled,
  facingMode,
  isScanning,
  isChangingCamera,
  permissionDenied = false,
  onToggleAudio,
  onToggleCamera,
  onStartScanner,
  onStopScanner,
  onClose,
  onClearLastScan,
}: KioskScannerViewProps) {

  const [clock, setClock] = useState({ time: "", date: "" });
  const onStartScannerRef = useRef(onStartScanner);
  const onStopScannerRef = useRef(onStopScanner);
  onStartScannerRef.current = onStartScanner;
  onStopScannerRef.current = onStopScanner;

  // Iniciar scanner una sola vez tras montar el kiosco
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        onStartScannerRef.current("kiosk-qr-reader");
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
      onStopScannerRef.current();
    };
  }, []);

  // Manejador tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reloj digital en vivo
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock({
        time: now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
        date: now.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background/98 text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8 backdrop-blur-3xl overflow-hidden animate-in fade-in duration-300">
      {/* Barra Superior Kiosco */}
      <header className="flex items-center justify-between gap-4 pb-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xs">
            <IconSchool className="size-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                Control de Asistencia Kiosco
              </h1>
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground capitalize font-medium">
              {clock.date} • Modo Recepción & Portería
            </p>
          </div>
        </div>

        {/* Reloj Gigante Central */}
        <div className="hidden md:flex flex-col items-center">
          <div className="font-mono text-3xl lg:text-4xl font-black tracking-tight text-primary flex items-center gap-2">
            <IconClock className="size-7 opacity-80" />
            <span>{clock.time || "00:00:00"}</span>
          </div>
        </div>

        {/* Controles de Pantalla, Modo y Salida */}
        <div className="flex items-center gap-3">
          <ScannerModeToggle mode={mode} onChange={onModeChange} isKiosk />

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleAudio}
            className="rounded-xl size-10 border-border/60"
            title={isAudioEnabled ? "Audio activado" : "Audio silenciado"}
          >
            {isAudioEnabled ? <IconVolume className="size-5 text-emerald-500" /> : <IconVolumeOff className="size-5 text-muted-foreground" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={onToggleCamera}
            disabled={isChangingCamera}
            className="rounded-xl size-10 border-border/60"
            title="Cambiar Cámara"
          >
            <IconSwitchHorizontal className={cn("size-5", isChangingCamera && "animate-spin")} />
          </Button>

          <Button
            variant="destructive"
            onClick={onClose}
            className="rounded-xl font-bold h-10 px-4 text-xs gap-1.5 shadow-md hover:scale-105 transition-all"
          >
            <IconX className="size-4" />
            <span className="hidden sm:inline">Salir</span>
            <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-mono">ESC</kbd>
          </Button>
        </div>
      </header>

      {/* Cuerpo Principal del Kiosco */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6 items-center max-w-7xl w-full mx-auto">
        {/* Lado Izquierdo: Sensor Óptico de Gran Tamaño */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md relative rounded-3xl overflow-hidden border-2 border-primary/40 bg-black/95 shadow-2xl p-2 min-h-[350px] sm:min-h-[390px] flex items-center justify-center">
            <div id="kiosk-qr-reader" className="w-full min-h-[340px] sm:min-h-[380px] rounded-2xl overflow-hidden relative z-10" />

            {/* Retícula Kiosco */}
            {isScanning && (
              <div className="absolute inset-4 z-20 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="size-8 border-t-4 border-l-4 border-primary rounded-tl-xl shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                  <div className="size-8 border-t-4 border-r-4 border-primary rounded-tr-xl shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                </div>
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
                <div className="flex justify-between">
                  <div className="size-8 border-b-4 border-l-4 border-primary rounded-bl-xl shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                  <div className="size-8 border-b-4 border-r-4 border-primary rounded-br-xl shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
                </div>
              </div>
            )}

            {/* Pantalla de error si el permiso fue denegado */}
            {permissionDenied && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/90 text-center space-y-3">
                <IconLock className="size-12 text-amber-500 mb-1 animate-bounce" />
                <h4 className="text-base font-bold text-white uppercase tracking-wider">Permiso de Cámara Bloqueado</h4>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  El navegador no permitió el uso de la cámara. Habilítela haciendo clic en el candado de la URL y luego presione reintentar.
                </p>
                <Button
                  onClick={() => onStartScanner("kiosk-qr-reader")}
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-amber-500/50 text-amber-400 hover:bg-amber-500/20 font-bold text-xs"
                >
                  <IconRefresh className="size-3.5 mr-1.5" /> Reintentar Permiso
                </Button>
              </div>
            )}

            {/* Si no está escaneando ni cambiando cámara ni bloqueado */}
            {!isScanning && !isChangingCamera && !permissionDenied && (
              <div className="absolute inset-0 z-25 flex flex-col items-center justify-center p-6 bg-black/85 text-center space-y-4">
                <IconCamera className="size-12 text-primary" />
                <p className="text-xs text-zinc-300">Sensor listo para iniciar</p>
                <Button
                  onClick={() => onStartScanner("kiosk-qr-reader")}
                  className="rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                >
                  Activar Sensor Kiosco
                </Button>
              </div>
            )}

            {isChangingCamera && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs">
                <IconRefresh className="size-10 text-primary animate-spin mb-3" />
                <p className="text-xs font-black uppercase tracking-widest text-primary">Sincronizando Sensor...</p>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-3 font-semibold tracking-wide uppercase">
            {facingMode === "environment" ? "Cámara Trasera" : "Cámara Frontal"} • Digital Scanner ID
          </p>
        </div>

        {/* Lado Derecho: Tarjeta Gigante del Estudiante */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center w-full">
          <div className="w-full max-w-lg">
            <KioskStudentCard scan={lastScan} onClear={onClearLastScan} />
          </div>
        </div>
      </main>

      {/* Barra Inferior: Feed de Últimos Accesos */}
      <KioskScannerFooter stats={stats} logs={logs} />
    </div>
  );
}
