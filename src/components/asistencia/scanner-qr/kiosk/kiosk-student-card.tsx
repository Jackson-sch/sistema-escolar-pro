"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconClockExclamation,
  IconClock,
  IconSchool,
  IconId,
  IconInfoCircle,
  IconBell,
  IconDoorExit,
} from "@tabler/icons-react";
import { KioskAuthorizedGuardians } from "./kiosk-authorized-guardians";
import type { ScanLog } from "../scanner-types";


interface KioskStudentCardProps {
  scan: ScanLog | null;
  onClear: () => void;
  durationMs?: number;
}

export function KioskStudentCard({
  scan,
  onClear,
  durationMs = 4500,
}: KioskStudentCardProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!scan) return;

    setProgress(100);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onClear();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [scan, durationMs, onClear]);

  if (!scan) {
    return (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-border/40 bg-card/40 backdrop-blur-md text-center">
        <div className="size-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <IconId className="size-10 text-primary/70" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-1">
          Listo para el Siguiente Estudiante
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Acerque el fotocheck o código QR frente al sensor óptico para registrar su ingreso.
        </p>
      </div>
    );
  }

  const isSalida = scan.mode === "salida";
  const isSuccess = scan.status === "success" && !isSalida;
  const isLate = scan.status === "late" && !isSalida;

  return (
    <div
      className={cn(
        "w-full rounded-3xl p-6 sm:p-8 flex flex-col justify-between border shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-200",
        isSalida
          ? "bg-amber-950/20 border-amber-500/40 shadow-amber-500/10"
          : isSuccess
            ? "bg-emerald-950/20 border-emerald-500/40 shadow-emerald-500/10"
            : isLate
              ? "bg-amber-950/20 border-amber-500/40 shadow-amber-500/10"
              : "bg-card/90 border-border/60",
      )}
    >
      {/* Barra de progreso de cuenta regresiva en el borde superior */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted/40">
        <div
          className={cn(
            "h-full transition-all duration-75 ease-linear",
            isSalida ? "bg-amber-500" : isSuccess ? "bg-emerald-500" : isLate ? "bg-amber-500" : "bg-primary",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div>
        {/* Banner de Estado */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Badge
            className={cn(
              "px-3 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide uppercase shadow-sm",
              isSalida
                ? "bg-amber-600 text-white dark:bg-amber-700"
                : isSuccess
                  ? "bg-emerald-500 text-white dark:bg-emerald-600"
                  : isLate
                    ? "bg-amber-500 text-white dark:bg-amber-600"
                    : "bg-primary text-primary-foreground",
            )}
          >
            {isSalida ? (
              <span className="flex items-center gap-1.5">
                <IconDoorExit className="size-4 stroke-[2.5]" /> Salida Registrada
              </span>
            ) : isSuccess ? (
              <span className="flex items-center gap-1.5">
                <IconCheck className="size-4 stroke-[3]" /> Acceso Puntual
              </span>
            ) : isLate ? (
              <span className="flex items-center gap-1.5">
                <IconClockExclamation className="size-4 stroke-[2.5]" /> Tardanza Registrada
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <IconInfoCircle className="size-4" /> Ya Registrado
              </span>
            )}
          </Badge>

          <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold text-foreground">
            <IconClock className="size-5 text-muted-foreground" />
            <span>{scan.time}</span>
          </div>
        </div>

        {/* Datos del Estudiante */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative shrink-0">
            <Avatar
              className={cn(
                "size-24 sm:size-28 border-4 shadow-xl",
                isSalida
                  ? "border-amber-500/40 ring-4 ring-amber-500/20"
                  : isSuccess
                    ? "border-emerald-500/40 ring-4 ring-emerald-500/20"
                    : isLate
                      ? "border-amber-500/40 ring-4 ring-amber-500/20"
                      : "border-primary/40",
              )}
            >
              <AvatarImage src={scan.image} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-primary font-black text-3xl">
                {scan.studentName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute -bottom-2 -right-2 size-8 rounded-full flex items-center justify-center text-white shadow-md",
                isSalida ? "bg-amber-600" : isSuccess ? "bg-emerald-500" : isLate ? "bg-amber-500" : "bg-primary",
              )}
            >
              {isSalida ? (
                <IconDoorExit className="size-4.5 stroke-[2.5]" />
              ) : (
                <IconCheck className="size-5 stroke-[3]" />
              )}
            </div>
          </div>

          <div className="space-y-2 flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight line-clamp-2">
              {scan.studentName}
            </h2>

            {scan.aula && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-card border border-border/60 text-xs sm:text-sm font-semibold text-foreground shadow-xs">
                <IconSchool className="size-4 text-primary shrink-0" />
                <span className="truncate">{scan.aula}</span>
              </div>
            )}

            {scan.dni && (
              <p className="text-xs text-muted-foreground font-mono font-medium">
                DNI / CÓDIGO: <span className="font-bold text-foreground">{scan.dni}</span>
              </p>
            )}

            {scan.notification?.notified && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-bold animate-in fade-in slide-in-from-bottom-1">
                <IconBell className="size-3.5" />
                <span>Aviso enviado a apoderado ({scan.notification.channels?.join(", ") || "Enviado"})</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Personas Autorizadas para el Retiro (Modo Salida) */}
        {isSalida && (
          <div className="mt-5 pt-4 border-t border-border/30 w-full animate-in fade-in-50 duration-300">
            <KioskAuthorizedGuardians guardians={scan.authorizedGuardians} />
          </div>
        )}
      </div>

      <div className="pt-6 mt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>Siguiente escaneo disponible</span>
        <span className="font-mono font-bold text-foreground">
          {Math.ceil((progress / 100) * (durationMs / 1000))}s
        </span>
      </div>
    </div>
  );
}
