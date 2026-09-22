"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { NotaData } from "../notas-form-types";

export function useNotasDraft({
  evaluacionId,
  notasExistentes,
  notas,
  isDirty,
  onRestore,
}: {
  evaluacionId: string;
  notasExistentes: Record<string, NotaData>;
  notas: Record<string, NotaData>;
  isDirty: boolean;
  onRestore: (notas: Record<string, NotaData>) => void;
}) {
  const [draftToRestore, setDraftToRestore] = useState<Record<
    string,
    NotaData
  > | null>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(`notas_draft_${evaluacionId}`);
    if (!savedDraft) return;
    const timer = setTimeout(() => {
      try {
        const parsed = JSON.parse(savedDraft);
        const isDraftDifferent =
          JSON.stringify(parsed) !== JSON.stringify(notasExistentes);
        if (isDraftDifferent) {
          setDraftToRestore(parsed);
        }
      } catch (err) {
        console.error("Error al cargar el borrador local:", err);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [evaluacionId, notasExistentes]);

  // Guardar borrador local automáticamente ante cada cambio
  useEffect(() => {
    if (isDirty && Object.keys(notas).length > 0) {
      localStorage.setItem(
        `notas_draft_${evaluacionId}`,
        JSON.stringify(notas),
      );
    } else if (!isDirty) {
      localStorage.removeItem(`notas_draft_${evaluacionId}`);
    }
  }, [notas, isDirty, evaluacionId]);

  const restoreDraft = () => {
    if (draftToRestore) {
      onRestore(draftToRestore);
      setDraftToRestore(null);
      toast.success("✓ Borrador local restaurado correctamente");
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(`notas_draft_${evaluacionId}`);
    setDraftToRestore(null);
    toast.info("Borrador local descartado");
  };

  return { draftToRestore, restoreDraft, discardDraft };
}
