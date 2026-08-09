"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconCamera,
  IconX,
  IconRefresh,
  IconSwitchHorizontal,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  registerQRAsistenciaAction,
  getRecentAttendanceLogsAction,
} from "@/actions/attendance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LogsSection from "./logs-section";
import { useSpeechFeedback } from "@/hooks/use-speech-feedback";
import { useQRScanner } from "@/hooks/use-qr-scanner";

interface ScanLog {
  id: string;
  studentName: string;
  dni: string | null;
  time: string;
  status: string;
  image?: string;
}

export function QRScannerDashboard() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [lastScan, setLastScan] = useState<ScanLog | null>(null);
  const lastScanTimeRef = useRef<Record<string, number>>({});
  const { speak } = useSpeechFeedback();

  const handleScan = useCallback(async (decodedText: string) => {
    const now = Date.now();
    if (now - (lastScanTimeRef.current[decodedText] || 0) < 10000) return;
    lastScanTimeRef.current[decodedText] = now;

    try {
      const result = await registerQRAsistenciaAction(decodedText) as any;
      if (result.success && result.data) {
        const { student } = result.data;
        const newLog: ScanLog = {
          id: result.data.id,
          studentName: `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`,
          dni: student.dni,
          time: result.data.horaLlegada || new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }),
          status: result.data.tardanza ? "late" : "success",
          image: student.image || undefined,
        };
        setLogs((prev) => [newLog, ...prev].slice(0, 50));
        setLastScan(newLog);
        toast.success(`Asistencia registrada: ${newLog.studentName}`);
        speak(result.data.tardanza ? `Acceso registrado, ${student.name}. Tienes una tardanza.` : `Bienvenido ${student.name}, acceso correcto.`);
      } else if (result.alreadyMarked) {
        const { student } = result.data;
        toast.warning(`Ya registrado hoy: ${student.name}`);
        speak(`${student.name}, tu asistencia ya fue registrada.`);
      } else {
        lastScanTimeRef.current[decodedText] = now - 5000;
        toast.error(result.error || "Error al procesar QR");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  }, [speak]);

  const { isScanning, isChangingCamera, facingMode, startScanner, stopScanner } = useQRScanner(handleScan);

  useEffect(() => {
    let ignore = false;
    getRecentAttendanceLogsAction()
      .then((res) => {
        if (ignore) return;
        if (res.data) setLogs(res.data);
      })
      .catch(() => {
        /* sin logs recientes */
      });
    return () => {
      ignore = true;
      stopScanner().catch(console.error);
    };
  }, [stopScanner]);

  const toggleCamera = () => startScanner(facingMode === "user" ? "environment" : "user");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2 sm:p-4 lg:h-[800px]">
      <Card className="lg:col-span-7 p-0 h-full overflow-hidden border border-border/40 shadow-lg bg-card/80 text-foreground dark:text-white flex flex-col">
        <CardHeader className="pb-3 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <IconCamera className={cn("size-6 text-primary", isScanning && "animate-pulse")} />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-foreground dark:text-white">Control de Acceso</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">{facingMode === "environment" ? "Cámara Trasera" : "Cámara Frontal"} • Digital ID</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => window.location.reload()} className="rounded-full" title="Refrescar Motor">
                <IconRefresh className="size-4" />
              </Button>
              {isScanning && (
                <Button variant="outline" size="icon" onClick={toggleCamera} disabled={isChangingCamera} className="rounded-full" title="Girar Cámara">
                  <IconSwitchHorizontal className={cn("size-5", isChangingCamera && "animate-spin")} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent" />
          {isScanning ? (
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 animation-duration-">
              <div className="relative group">
                <div className="absolute -inset-4 border border-primary/10 rounded-[2.5rem] pointer-events-none" />
                <div id="qr-reader" className="w-full border-2 border-primary/30 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] bg-black/95 relative z-10 min-h-[300px]" />
                {isChangingCamera && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 rounded-2xl backdrop-blur-sm">
                    <IconRefresh className="size-12 text-primary animate-spin mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary">Sincronizando Sensor...</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center pt-4">
                <Button variant="destructive" onClick={stopScanner} className="rounded-full px-12 h-14 font-black shadow-lg hover:scale-105 transition-transform">
                  <IconX className="size-5 mr-2" /> DETENER ESCANEO
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-4 animate-in fade-in slide-in-from-bottom-8 animation-duration-">
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative size-32 bg-card/80 rounded-2xl flex items-center justify-center border border-border shadow-lg overflow-hidden group">
                  <IconCamera className="size-16 text-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground dark:text-white uppercase tracking-widest">Listo para Escanear</h3>
              </div>
              <Button onClick={() => startScanner()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-16 h-16 font-bold text-xl tracking-widest uppercase shadow-lg">
                PROCESAR ENTRADA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="lg:col-span-5 h-full animate-in fade-in animation-duration-">
        <LogsSection logs={logs} lastScan={lastScan} />
      </div>
      <style jsx global>{`
        video { border-radius: 2rem !important; object-fit: cover !important; transform: ${facingMode === "user" ? "scaleX(-1)" : "scaleX(1)"} !important; }
        .animate-scan { position: absolute; width: 80%; left: 10%; animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; z-index: 30; height: 4px; border-radius: 999px; }
        @keyframes scan { 0% { top: 15%; opacity: 0.1; } 50% { opacity: 0.8; } 100% { top: 85%; opacity: 0.1; } }
      `}</style>
    </div>
  );
}
