"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { registerQRAsistenciaAction, getRecentAttendanceLogsAction } from "@/actions/attendance";
import { useSpeechFeedback } from "@/hooks/use-speech-feedback";
import { useQRScanner } from "@/hooks/use-qr-scanner";
import { playChime } from "@/lib/audio-chime";
import { ScannerStatsBar } from "./scanner-stats-bar";
import { ScannerCameraCard } from "./scanner-camera-card";
import LogsSection from "./logs-section";
import { KioskScannerView } from "./kiosk/kiosk-scanner-view";
import type { ScanLog, ScanStats, ScannerMode } from "./scanner-types";

export function QRScannerDashboard() {
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [lastScan, setLastScan] = useState<ScanLog | null>(null);
  const [stats, setStats] = useState<ScanStats>({ total: 0, puntuales: 0, tardanzas: 0, salidas: 0 });
  const [mode, setMode] = useState<ScannerMode>("ingreso");
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const lastScanTimeRef = useRef<Record<string, number>>({});
  const { speak } = useSpeechFeedback();

  const handleScan = useCallback(
    async (decodedText: string) => {
      const now = Date.now();
      if (now - (lastScanTimeRef.current[decodedText] || 0) < 6000) return;
      lastScanTimeRef.current[decodedText] = now;

      try {
        const result = (await registerQRAsistenciaAction(decodedText, mode)) as any;
        if (result.success && result.data) {
          const { student } = result.data;
          const isSalida = mode === "salida";
          const isLate = Boolean(result.data.tardanza);
          const studentFullName = `${student.name || ""} ${student.apellidoPaterno || ""} ${student.apellidoMaterno || ""}`.trim();
          const effectiveTime = (isSalida ? result.data.horaSalida : result.data.horaLlegada) ||
            new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" });

          const newLog: ScanLog = {
            id: result.data.id || String(now),
            studentName: studentFullName,
            dni: student.dni,
            time: effectiveTime,
            status: isSalida ? "success" : (isLate ? "late" : "success"),
            mode: isSalida ? "salida" : "ingreso",
            horaSalida: result.data.horaSalida,
            image: student.image || undefined,
            aula: student.aula || undefined,
            grado: student.grado || undefined,
            seccion: student.seccion || undefined,
            notification: result.data.notification,
            authorizedGuardians: result.data.authorizedGuardians,
          };

          setLogs((prev) => [newLog, ...prev].slice(0, 50));
          setLastScan(newLog);
          setStats((prev) => ({
            total: prev.total + (isSalida ? 0 : 1),
            puntuales: !isSalida && !isLate ? prev.puntuales + 1 : prev.puntuales,
            tardanzas: !isSalida && isLate ? prev.tardanzas + 1 : prev.tardanzas,
            salidas: isSalida ? (prev.salidas || 0) + 1 : (prev.salidas || 0),
          }));

          if (isAudioEnabled) {
            playChime(isSalida ? "success" : (isLate ? "warning" : "success"));
            speak(
              isSalida
                ? `Salida registrada, hasta luego ${student.name}.`
                : (isLate ? `Acceso registrado, ${student.name}. Tienes una tardanza.` : `Bienvenido ${student.name}, acceso correcto.`)
            );
          }
          const notifSuffix = result.data.notification?.notified
            ? " • Aviso enviado a padres 📲"
            : "";
          toast.success(
            (isSalida
              ? `Salida registrada: ${studentFullName}`
              : (isLate ? `Tardanza: ${studentFullName}` : `Asistencia: ${studentFullName}`)) + notifSuffix
          );
        } else if (result.alreadyMarked) {
          const student = result.data?.student;
          const fullName = student ? `${student.name} ${student.apellidoPaterno || ""}`.trim() : "Estudiante";
          const isSalida = mode === "salida";
          if (isAudioEnabled) {
            playChime("warning");
            speak(
              isSalida
                ? `${fullName}, tu salida ya fue registrada el día de hoy.`
                : `${fullName}, tu asistencia ya fue registrada el día de hoy.`
            );
          }
          toast.warning(isSalida ? `Salida ya registrada hoy: ${fullName}` : `Ya registrado hoy: ${fullName}`);
        } else {
          lastScanTimeRef.current[decodedText] = now - 3000;
          if (isAudioEnabled) playChime("error");
          toast.error(result.error || "Código o DNI no reconocido");
        }
      } catch {
        if (isAudioEnabled) playChime("error");
        toast.error("Error de conexión al registrar asistencia");
      }
    },
    [isAudioEnabled, mode, speak],
  );


  const activeElementId = isKioskOpen ? "kiosk-qr-reader" : "qr-reader";
  const {
    isScanning,
    isChangingCamera,
    permissionDenied,
    facingMode,
    startScanner,
    stopScanner,
  } = useQRScanner(handleScan, activeElementId);

  useEffect(() => {
    let ignore = false;
    getRecentAttendanceLogsAction()
      .then((res: any) => {
        if (ignore) return;
        if (res.data) setLogs(res.data);
        if (res.stats) setStats(res.stats);
      })
      .catch(() => {});
    return () => {
      ignore = true;
      stopScanner().catch(() => {});
    };
  }, [stopScanner]);

  const handleOpenKiosk = async () => {
    if (isScanning) {
      await stopScanner();
    }
    setIsKioskOpen(true);
  };

  const handleCloseKiosk = async () => {
    await stopScanner();
    setIsKioskOpen(false);
  };

  const toggleCamera = () => startScanner(facingMode === "user" ? "environment" : "user");

  const handleManualDni = async (dni: string) => {
    setIsProcessingManual(true);
    try {
      await handleScan(dni);
    } finally {
      setIsProcessingManual(false);
    }
  };

  const handleStartKioskScanner = useCallback(
    async (targetId?: string) => {
      await startScanner(facingMode, targetId || "kiosk-qr-reader");
    },
    [facingMode, startScanner],
  );

  return (
    <div className="space-y-4">
      <ScannerStatsBar
        stats={stats}
        mode={mode}
        onModeChange={setMode}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled((prev) => !prev)}
        onOpenKiosk={handleOpenKiosk}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[560px]">
        <div className="lg:col-span-6 h-full">
          <ScannerCameraCard
            isScanning={isScanning}
            isChangingCamera={isChangingCamera}
            permissionDenied={permissionDenied}
            facingMode={facingMode}
            onStartScanner={() => startScanner()}
            onStopScanner={stopScanner}
            onToggleCamera={toggleCamera}
            onManualSubmit={handleManualDni}
            isProcessingManual={isProcessingManual}
          />
        </div>

        <div className="lg:col-span-6 h-full">
          <LogsSection logs={logs} lastScan={lastScan} />
        </div>
      </div>

      {isKioskOpen && (
        <KioskScannerView
          logs={logs}
          lastScan={lastScan}
          stats={stats}
          mode={mode}
          onModeChange={setMode}
          isAudioEnabled={isAudioEnabled}
          facingMode={facingMode}
          isScanning={isScanning}
          isChangingCamera={isChangingCamera}
          permissionDenied={permissionDenied}
          onToggleAudio={() => setIsAudioEnabled((prev) => !prev)}
          onToggleCamera={toggleCamera}
          onStartScanner={handleStartKioskScanner}
          onStopScanner={stopScanner}
          onClose={handleCloseKiosk}
          onClearLastScan={() => setLastScan(null)}
        />
      )}

      <style jsx global>{`
        video {
          border-radius: 1.25rem !important;
          object-fit: cover !important;
          transform: ${facingMode === "user" ? "scaleX(-1)" : "scaleX(1)"} !important;
        }
      `}</style>
    </div>
  );
}
