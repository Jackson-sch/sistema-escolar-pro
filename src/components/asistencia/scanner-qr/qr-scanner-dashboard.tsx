"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
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

interface ScanLog {
  id: string;
  studentName: string;
  dni: string;
  time: string;
  status: "success" | "error" | "late";
  image?: string;
}

export function QRScannerDashboard() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<ScanLog | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [isChangingCamera, setIsChangingCamera] = useState(false);
  const { speak } = useSpeechFeedback();

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimeRef = useRef<Record<string, number>>({});

  useEffect(() => {
    loadRecentLogs();
    return () => {
      stopScanner();
    };
  }, []);

  const loadRecentLogs = async () => {
    const res = await getRecentAttendanceLogsAction();
    if (res.data) {
      setLogs(res.data);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    const now = Date.now();
    const lastTime = lastScanTimeRef.current[decodedText] || 0;

    if (now - lastTime < 10000) return;

    lastScanTimeRef.current[decodedText] = now;

    try {
      const result = (await registerQRAsistenciaAction(decodedText)) as any;

      if (result.success && result.data) {
        const student = result.data.student;
        const newLog: ScanLog = {
          id: result.data.id,
          studentName: `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`,
          dni: student.dni,
          time: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: result.data.tardanza ? "late" : "success",
          image: student.image || undefined,
        };

        setLogs((prev) => [newLog, ...prev].slice(0, 50));
        setLastScan(newLog);
        toast.success(`Asistencia registrada: ${newLog.studentName}`);

        // Voice feedback
        const msg = result.data.tardanza
          ? `Acceso registrado, ${student.name}. Tienes una tardanza.`
          : `Bienvenido ${student.name}, acceso correcto.`;
        speak(msg);
      } else if (result.alreadyMarked) {
        const student = result.data.student;
        const warningLog: ScanLog = {
          id: `warn-${Date.now()}`,
          studentName: `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`,
          dni: student.dni,
          time: new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "success",
          image: student.image || undefined,
        };
        setLastScan(warningLog);
        toast.warning(`Ya registrado hoy: ${warningLog.studentName}`);
        speak(`${student.name}, tu asistencia ya fue registrada.`);
      } else {
        lastScanTimeRef.current[decodedText] = now - 5000;
        toast.error(result.error || "Error al procesar QR");
      }
    } catch (err) {
      console.error("Scan processing error:", err);
      toast.error("Error de conexión");
    }
  };

  const startScanner = async (mode: "user" | "environment" = facingMode) => {
    try {
      setIsChangingCamera(true);
      // Primero activamos el estado para que el div aparezca en el DOM
      setIsScanning(true);

      // Esperar a que React renderice el contenedor
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = document.getElementById("qr-reader");
      if (!container) {
        throw new Error("HTML Element with id=qr-reader not found");
      }

      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
        } catch (e) {
          console.warn("Error stopping before restart:", e);
        }
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: mode },
        config,
        onScanSuccess,
        () => {},
      );

      // Forzar video attributes para móviles
      const videoElement = container.querySelector("video") as HTMLVideoElement;
      if (videoElement) {
        videoElement.setAttribute("playsinline", "true");
        videoElement.muted = true;
        await videoElement.play().catch(() => {});
      }

      setFacingMode(mode);
      setIsChangingCamera(false);
    } catch (err) {
      console.error("Scanner startup error:", err);
      toast.error("No se pudo acceder a la cámara. Verifique permisos.");
      setIsScanning(false);
      setIsChangingCamera(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner", err);
        setIsScanning(false);
      }
    } else {
      setIsScanning(false);
    }
  };

  const handleHardReset = () => {
    window.location.reload();
  };

  const toggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startScanner(nextMode);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2 sm:p-4">
      {/* Scanner Section */}
      <Card className="lg:col-span-7 overflow-hidden border-none shadow-xl bg-card dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 text-foreground dark:text-white">
        <CardHeader className="backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                <IconCamera
                  className={cn(
                    "size-6 text-primary",
                    isScanning && "animate-pulse",
                  )}
                />
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-foreground dark:text-white">
                  Control de Acceso
                </CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  {facingMode === "environment"
                    ? "Cámara Trasera"
                    : "Cámara Frontal"}{" "}
                  • Digital ID
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleHardReset}
                className="rounded-full bg-muted border-border hover:bg-accent text-foreground dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:text-white"
                title="Refrescar Motor"
              >
                <IconRefresh className="size-4" />
              </Button>
              {isScanning && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  disabled={isChangingCamera}
                  className="rounded-full bg-primary/20 border-primary/30 hover:bg-primary/30 text-primary dark:bg-primary/20 dark:border-primary/30 dark:hover:bg-primary/30 dark:text-primary"
                  title="Girar Cámara"
                >
                  <IconSwitchHorizontal
                    className={cn("size-5", isChangingCamera && "animate-spin")}
                  />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 lg:p-4 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-primary/20 to-transparent" />

          {isScanning ? (
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative group">
                <div className="absolute -inset-4 border border-primary/10 rounded-[2.5rem] pointer-events-none" />
                <div
                  id="qr-reader"
                  className="w-full border-2 border-primary/30 rounded-[2rem] overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] bg-black/95 relative z-10 min-h-[300px]"
                />

                {isChangingCamera && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 rounded-[2rem] backdrop-blur-sm">
                    <IconRefresh className="size-12 text-primary animate-spin mb-2" />
                    <p className="text-xs font-black uppercase tracking-widest text-primary">
                      Sincronizando Sensor...
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-12">
                  <div className="absolute top-16 left-16 size-8 border-t-4 border-l-4 border-primary rounded-tl-lg shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <div className="absolute top-16 right-16 size-8 border-t-4 border-r-4 border-primary rounded-tr-lg shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <div className="absolute bottom-16 left-16 size-8 border-b-4 border-l-4 border-primary rounded-bl-lg shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <div className="absolute bottom-16 right-16 size-8 border-b-4 border-r-4 border-primary rounded-br-lg shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                  <div className="w-full h-1 bg-linear-to-r from-transparent via-primary to-transparent animate-scan shadow-[0_0_20px_rgba(var(--primary),0.8)] opacity-70" />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  variant="destructive"
                  onClick={stopScanner}
                  className="rounded-full px-12 h-14 font-black shadow-2xl hover:scale-105 transition-all group border-2 border-white/10"
                >
                  <IconX className="size-5 mr-2 group-hover:rotate-90 transition-transform" />
                  DETENER ESCANEO
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-8 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="relative flex justify-center">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="relative size-32 bg-card/40 dark:bg-card/40 backdrop-blur-2xl rounded-[3rem] flex items-center justify-center border border-border dark:border-white/10 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />
                  <IconCamera className="size-16 text-primary group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-black text-foreground dark:text-white uppercase tracking-widest">
                  {" "}
                  Listo para Escanear
                </h3>
                <p className="text-muted-foreground max-w-[320px] mx-auto text-sm leading-relaxed font-medium">
                  Sistema optimizado para registro móvil. Presione el botón
                  principal para abrir el sensor trasero.
                </p>

                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFacingMode(
                        facingMode === "user" ? "environment" : "user",
                      )
                    }
                    className="rounded-xl bg-muted border-border text-[10px] font-black uppercase tracking-widest h-10 px-6 dark:bg-white/5 dark:border-white/10 dark:text-white"
                  >
                    <IconSwitchHorizontal className="size-4 mr-2" />
                    {facingMode === "environment"
                      ? "Usar Frontal"
                      : "Usar Trasera"}
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => startScanner()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-16 h-16 font-black text-xl tracking-widest uppercase shadow-lg dark:shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] hover:-translate-y-1 transition-all"
              >
                PROCESAR ENTRADA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Section */}
      <div className="lg:col-span-5 space-y-6 animate-in fade-in duration-1000">
        <LogsSection logs={logs} lastScan={lastScan} />
      </div>

      <style jsx global>{`
        video {
          border-radius: 2rem !important;
          object-fit: cover !important;
          transform: ${facingMode === "user"
            ? "scaleX(-1)"
            : "scaleX(1)"} !important;
        }

        @keyframes scan {
          0% {
            top: 15%;
            opacity: 0.1;
          }
          20% {
            opacity: 0.8;
          }
          80% {
            opacity: 0.8;
          }
          100% {
            top: 85%;
            opacity: 0.1;
          }
        }

        .animate-scan {
          position: absolute;
          width: 80%;
          left: 10%;
          animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          z-index: 30;
          height: 4px;
          border-radius: 999px;
        }

        #qr-reader {
          background: black !important;
        }
      `}</style>
    </div>
  );
}
