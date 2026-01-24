"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook para copiar texto al portapapeles con feedback de estado y notificación.
 * @ param duration - Tiempo en ms para mantener el estado 'copied' (default 2000)
 */
export function useCopyToClipboard(duration = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string, successMessage = "Copiado al portapapeles") => {
      if (!text) return false;

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (successMessage) {
          toast.success(successMessage);
        }

        setTimeout(() => {
          setCopied(false);
        }, duration);

        return true;
      } catch (error) {
        console.error("Error al copiar al portapapeles:", error);
        toast.error("No se pudo copiar el texto");
        setCopied(false);
        return false;
      }
    },
    [duration]
  );

  return { copied, copy };
}
