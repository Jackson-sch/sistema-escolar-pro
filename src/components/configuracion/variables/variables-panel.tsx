"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  upsertVariableAction,
  deleteVariableAction,
} from "@/actions/variables";
import { VariableForm } from "./variable-form";
import { VariableList } from "./variable-list";
import { VariableSistema } from "./types";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { ComprobanteFormatConfig } from "./comprobante-format-config";
import { FORMATO_COMPROBANTE_KEY } from "@/lib/comprobante-constants";

interface VariablesPanelProps {
  initialData: VariableSistema[];
}

export function VariablesPanel({ initialData }: VariablesPanelProps) {
  const [variables, setVariables] =
    React.useState<VariableSistema[]>(initialData);

  const formatoComprobante =
    initialData.find((v) => v.clave === FORMATO_COMPROBANTE_KEY)?.valor || "A4";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [variableToDeleteId, setVariableToDeleteId] = React.useState<
    string | null
  >(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleVariableSaved = (variable: VariableSistema) => {
    setVariables((prev) => {
      const exists = prev.find((p) => p.clave === variable.clave);
      if (exists) {
        return prev.map((p) => (p.clave === variable.clave ? variable : p));
      }
      return [variable, ...prev];
    });
  };

  const handleUpdateVariable = async (variable: VariableSistema) => {
    const result = await upsertVariableAction({
      clave: variable.clave,
      valor: variable.valor,
      tipo: variable.tipo,
      descripcion: variable.descripcion || undefined,
      seccion: variable.seccion || undefined,
      activo: variable.activo,
    });

    if (result.data) {
      setVariables((prev) =>
        prev.map((v) => (v.id === variable.id ? result.data : v)),
      );
    } else {
      toast.error(result.error || "Error al actualizar la variable");
    }
  };

  const handleDeleteClick = (id: string) => {
    setVariableToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!variableToDeleteId) return;

    setIsDeleting(true);
    const result = await deleteVariableAction(variableToDeleteId);

    if (result.success) {
      setVariables((prev) => prev.filter((v) => v.id !== variableToDeleteId));
      toast.success("Variable eliminada correctamente");
    } else {
      toast.error(result.error || "Error al eliminar la variable");
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setVariableToDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <ComprobanteFormatConfig currentValue={formatoComprobante} />
      <VariableForm onVariableSaved={handleVariableSaved} />
      <VariableList
        variables={variables}
        onUpdateVariable={handleUpdateVariable}
        onDeleteVariable={handleDeleteClick}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="Eliminar Variable"
        description="¿Estás seguro de que deseas eliminar esta variable? Esta acción no se puede deshacer."
        variant="danger"
      />
    </div>
  );
}
