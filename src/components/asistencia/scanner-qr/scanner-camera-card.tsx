"use client";

import { useState } from "react";
import {
  IconCamera,
  IconX,
  IconRefresh,
  IconSwitchHorizontal,
  IconId,
  IconArrowRight,
  IconLoader2,
  IconLock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ScannerCameraCardProps {
  isScanning: boolean;
  isChangingCamera: boolean;
  permissionDenied?: boolean;
  facingMode: "user" | "environment";
  onStartScanner: () => void;
  onStopScanner: () => void;
  onToggleCamera: () => void;
  onManualSubmit: (dni: string) => Promise<void>;
  isProcessingManual?: boolean;
}

export function ScannerCameraCard({
  isScanning,
  isChangingCamera,
  permissionDenied = false,
  facingMode,
  onStartScanner,
  onStopScanner,
  onToggleCamera,
  onManualSubmit,
  isProcessingManual = false,
}: ScannerCameraCardProps) {
  const [manualDni, setManualDni] = useState("");

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDni = manualDni.trim();
    if (!cleanDni) return;
    await onManualSubmit(cleanDni);
    setManualDni("");
  };

  return (
    <Card className="h-full overflow-hidden border border-border/40 shadow-md bg-card/80 text-foreground flex flex-col justify-between">
      <CardHeader className="pb-3 pt-5 px-5 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <IconCamera className={cn("size-5 text-primary", isScanning && "animate-pulse")} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Sensor Óptico QR</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isScanning
                  ? facingMode === "environment"
                    ? "Cámara Trasera Activa"
                    : "Cámara Frontal Activa"
                  : permissionDenied
                    ? "Permiso denegado"
                    : "Sensor en pausa"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isScanning && (
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleCamera}
                disabled={isChangingCamera}
                className="rounded-lg size-8 border-border/50"
                title="Cambiar Cámara"
              >
                <IconSwitchHorizontal className={cn("size-4", isChangingCamera && "animate-spin")} />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
              className="rounded-lg size-8 border-border/50"
              title="Reiniciar Módulo"
            >
              <IconRefresh className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
        {permissionDenied ? (
          <div className="text-center space-y-4 py-4 max-w-sm mx-auto animate-in fade-in">
            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-sm">
              <IconLock className="size-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-foreground flex items-center justify-center gap-1.5">
                <IconAlertTriangle className="size-4 text-amber-500" />
                Permiso de Cámara Bloqueado
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                El navegador bloqueó el acceso a la cámara. Haz clic en el ícono de candado o cámara 🔒 en la barra de URL para cambiar a <strong>&quot;Permitir&quot;</strong>.
              </p>
            </div>
            <div className="pt-1 flex flex-col gap-2">
              <Button
                onClick={onStartScanner}
                variant="outline"
                size="sm"
                className="rounded-xl font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
              >
                <IconRefresh className="size-4 mr-1.5" /> Reintentar Permiso
              </Button>
            </div>
          </div>
        ) : isScanning ? (
          <div className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95">
            <div className="relative group rounded-2xl overflow-hidden border border-border/50 bg-black/95 shadow-inner">
              <div id="qr-reader" className="w-full min-h-[260px] relative z-10" />

              <div className="absolute inset-0 z-20 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="size-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="size-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                </div>
                <div className="w-full h-0.5 bg-primary/80 shadow-[0_0_12px_rgba(var(--primary),0.8)] animate-pulse" />
                <div className="flex justify-between">
                  <div className="size-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="size-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
                </div>
              </div>

              {isChangingCamera && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs">
                  <IconRefresh className="size-8 text-primary animate-spin mb-2" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Sincronizando Sensor...</p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="sm"
                onClick={onStopScanner}
                className="rounded-xl px-6 font-semibold shadow-xs"
              >
                <IconX className="size-4 mr-1.5" /> Detener Cámara
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-5 py-6 animate-in fade-in">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-125 animate-pulse" />
              <div className="relative size-24 bg-card/90 rounded-2xl flex items-center justify-center border border-border shadow-sm">
                <IconCamera className="size-12 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-foreground">Sensor en Espera</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Inicia la cámara para escanear fotochecks, carnets o códigos QR de los estudiantes.
              </p>
            </div>
            <Button
              onClick={onStartScanner}
              className="rounded-xl px-8 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-105"
            >
              <IconCamera className="size-4 mr-2" /> Activar Cámara
            </Button>
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t border-border/20 bg-muted/20">
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <IconId className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ingreso manual por DNI..."
              value={manualDni}
              onChange={(e) => setManualDni(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl bg-background border-border/50 font-mono"
              maxLength={12}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!manualDni.trim() || isProcessingManual}
            className="h-9 rounded-xl text-xs font-semibold px-4 gap-1.5"
          >
            {isProcessingManual ? (
              <IconLoader2 className="size-3.5 animate-spin" />
            ) : (
              <>
                <span>Marcar</span>
                <IconArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
