"use client";

import { useEffect, useRef } from "react";

interface useFormShortcutsProps {
  onSubmit: () => void;
  isLoading?: boolean;
}

/**
 * Hook para manejar atajos de teclado globales en formularios.
 * Soporta:
 * - Ctrl+S / Cmd+S para enviar/guardar el formulario activo.
 * - Enter para avanzar dinámicamente al siguiente campo editable.
 */
export function useFormShortcuts({
  onSubmit,
  isLoading,
}: useFormShortcutsProps) {
  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading) return;

      // Ctrl + S (o Cmd + S en Mac) -> Enviar formulario
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        onSubmitRef.current?.();
        return;
      }

      // Enter -> Avanzar automáticamente al siguiente campo del formulario sin hacer submit directo
      if (event.key === "Enter" && !event.shiftKey) {
        const target = event.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "SELECT")) {
          const form = target.closest("form");
          if (form) {
            const inputs = Array.from(
              form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(
                "input:not([disabled]):not([type='hidden']), select:not([disabled]), button[type='submit']:not([disabled])"
              )
            );
            const index = inputs.indexOf(target as any);
            if (index > -1 && index < inputs.length - 1) {
              const next = inputs[index + 1];
              if (next && next.tagName !== "BUTTON") {
                event.preventDefault();
                next.focus();
                if ("select" in next) (next as any).select();
              }
            }
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading]);
}
