import { useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";

export function useQRScanner(onScan: (decodedText: string) => Promise<void>) {
  const [isScanning, setIsScanning] = useState(false);
  const [isChangingCamera, setIsChangingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current?.isScanning) {
      await html5QrCodeRef.current.stop();
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async (mode: "user" | "environment" = facingMode) => {
    try {
      setIsChangingCamera(true);
      setIsScanning(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const container = document.getElementById("qr-reader");
      if (!container) throw new Error("QR reader container not found");

      if (html5QrCodeRef.current?.isScanning) await html5QrCodeRef.current.stop();

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: mode },
        { fps: 10, qrbox: 250, aspectRatio: 1.0 },
        async (text) => {
          await onScan(text);
        },
        () => {}
      );

      setFacingMode(mode);
    } catch (err) {
      console.error("Scanner error:", err);
      toast.error("No se pudo iniciar la cámara.");
      setIsScanning(false);
    } finally {
      setIsChangingCamera(false);
    }
  }, [facingMode, onScan]);

  return { isScanning, isChangingCamera, facingMode, startScanner, stopScanner };
}
