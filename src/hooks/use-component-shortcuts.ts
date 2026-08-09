"use client";

import { useEffect, useRef } from "react";

interface UseComponentShortcutsProps {
  onNew?: () => void;
  onSearch?: () => void;
  disabled?: boolean;
}

/**
 * Hook para manejar atajos de teclado a nivel de componente.
 * Soporta:
 * - Shift + N: Para disparar acciones de "Nuevo" (creación).
 * - Ctrl + K: Para disparar acciones de "Buscar" o paleta de comandos.
 */
export function useComponentShortcuts({
  onNew,
  onSearch,
  disabled = false,
}: UseComponentShortcutsProps) {
  const onNewRef = useRef(onNew);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onNewRef.current = onNew;
    onSearchRef.current = onSearch;
  }, [onNew, onSearch]);

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Shift + N (Nuevo) - solo si no está en un input
      if (!isInputFocused && event.shiftKey && event.key.toLowerCase() === "n") {
        if (onNewRef.current) {
          event.preventDefault();
          onNewRef.current();
        }
      }

      // Ctrl + K (Buscar / Paleta) - Funciona SIEMPRE globalmente
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        if (onSearchRef.current) {
          event.preventDefault();
          onSearchRef.current();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled]);
}
