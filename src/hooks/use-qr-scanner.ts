import { useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

async function waitForElement(id: string, maxWaitMs = 1500): Promise<HTMLElement | null> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const el = document.getElementById(id);
    if (el) return el;
    await new Promise((r) => setTimeout(r, 40));
  }
  return null;
}

export function useQRScanner(
  onScan: (decodedText: string) => Promise<void>,
  elementId = "qr-reader",
) {
  const [isScanning, setIsScanning] = useState(false);
  const [isChangingCamera, setIsChangingCamera] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const lastToastTimeRef = useRef(0);

  const stopScanner = useCallback(async () => {
    try {
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.warn("Aviso al detener scanner:", err);
    } finally {
      setIsScanning(false);
      isStartingRef.current = false;
    }
  }, []);

  const startScanner = useCallback(
    async (mode: "user" | "environment" = facingMode, targetElementId?: string) => {
      if (isStartingRef.current) return;
      isStartingRef.current = true;

      const activeId = targetElementId || elementId;
      try {
        setIsChangingCamera(true);
        setPermissionDenied(false);

        const container = await waitForElement(activeId, 1500);
        if (!container) {
          console.warn(`Contenedor #${activeId} aún no listo.`);
          setIsScanning(false);
          isStartingRef.current = false;
          return;
        }

        if (html5QrCodeRef.current?.isScanning) {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        }

        const html5QrCode = new Html5Qrcode(activeId);
        html5QrCodeRef.current = html5QrCode;

        // Detección inteligente de cámaras disponibles
        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        let cameraConfig: string | { facingMode: string } = { facingMode: mode };

        if (cameras && cameras.length > 0) {
          if (cameras.length === 1) {
            // En laptops/PCs con 1 cámara, usar directamente el device ID para evitar error de environment
            cameraConfig = cameras[0].id;
          } else {
            const backCam = cameras.find((c) =>
              /back|rear|trasera|environment/i.test(c.label),
            );
            if (mode === "environment" && backCam) {
              cameraConfig = backCam.id;
            } else {
              cameraConfig = cameras[0].id;
            }
          }
        }

        const qrConfig = {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        try {
          await html5QrCode.start(
            cameraConfig,
            qrConfig,
            async (text) => {
              await onScan(text);
            },
            () => {},
          );
        } catch {
          // Reintento defensivo con cámara básica (user o default)
          await html5QrCode.start(
            cameras && cameras.length > 0 ? cameras[0].id : { facingMode: "user" },
            qrConfig,
            async (text) => {
              await onScan(text);
            },
            () => {},
          );
        }

        setIsScanning(true);
        setFacingMode(mode);
        setPermissionDenied(false);
      } catch (err: unknown) {
        const errorMsg = String(err || "");
        const isDenied =
          (err as { name?: string })?.name === "NotAllowedError" ||
          errorMsg.includes("Permission denied") ||
          errorMsg.includes("NotAllowedError");

        const now = Date.now();
        const canToast = now - lastToastTimeRef.current > 4000;

        if (isDenied) {
          setPermissionDenied(true);
          if (canToast) {
            lastToastTimeRef.current = now;
            toast.error("Permiso de cámara denegado. Habilite el acceso en el navegador.");
          }
        } else {
          console.error("Scanner error:", err);
          if (canToast) {
            lastToastTimeRef.current = now;
            toast.error("No se pudo iniciar la cámara. Verifique los permisos.");
          }
        }
        setIsScanning(false);
      } finally {
        setIsChangingCamera(false);
        isStartingRef.current = false;
      }
    },
    [elementId, facingMode, onScan],
  );

  return {
    isScanning,
    isChangingCamera,
    permissionDenied,
    facingMode,
    startScanner,
    stopScanner,
    setPermissionDenied,
  };
}
