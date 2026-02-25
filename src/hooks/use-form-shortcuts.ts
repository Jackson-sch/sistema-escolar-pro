"use client";

import { useEffect, useRef } from "react";

interface useFormShortcutsProps {
  onSubmit: () => void;
  isLoading?: boolean;
}

/**
 * Hook para manejar atajos de teclado en formularios.
 * Soporta Ctrl+S para guardar y Enter para enviar.
 * Utiliza una Ref interna para evitar reinicializar el listener con cada render.
 */
export function useFormShortcuts({
  onSubmit,
  isLoading,
}: useFormShortcutsProps) {
  const onSubmitRef = useRef(onSubmit);

  // Actualizar la ref en cada render para tener siempre la última lógica del form
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Evitar que funcione si el formulario está cargando
      if (isLoading) return;

      // Ctrl + S (o Cmd + S en Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        onSubmitRef.current?.();
      }

      // Enter (opcional, ya que el navegador lo maneja por defecto en botones type="submit")
      if (event.key === "Enter" && !event.shiftKey) {
        const target = event.target as HTMLElement;
        if (target.tagName === "TEXTAREA") return;
        // El comportamiento nativo del botón submit suele ser suficiente,
        // pero podrías llamar a onSubmitRef.current() si fuera necesario.
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading]); // Solo reinicia si cambia el estado de carga
}
