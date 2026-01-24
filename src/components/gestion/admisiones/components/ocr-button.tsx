"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconScan, IconLoader2, IconSparkles } from "@tabler/icons-react";
import { toast } from "sonner";

interface OCRButtonProps {
  onScanComplete: (data: {
    dni?: string;
    nombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    direccion?: string;
  }) => void;
}

export function OCRButton({ onScanComplete }: OCRButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, sube una imagen del documento.");
      return;
    }

    setIsScanning(true);
    const toastId = toast.loading("La IA está leyendo el documento...");

    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok)
        throw new Error("Error en el procesamiento de la imagen");

      const data = await response.json();
      onScanComplete(data);
      toast.success("¡Datos extraídos con éxito!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("No se pudo leer el documento. Inténtalo de nuevo.", {
        id: toastId,
      });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="h-10 px-4 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 hover:text-blue-700 font-bold gap-2 rounded-full transition-all active:scale-95"
      >
        {isScanning ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconSparkles className="size-4" />
        )}
        <span className="text-[11px] uppercase tracking-wider">
          {isScanning ? "Escaneando..." : "Escanear DNI con IA"}
        </span>
      </Button>
    </div>
  );
}
