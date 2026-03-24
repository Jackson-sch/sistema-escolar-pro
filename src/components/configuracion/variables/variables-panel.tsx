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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Cloudy } from "lucide-react";

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
      <Alert className="bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <Cloudy className="h-4 w-4" />
          Configuración de Almacenamiento (Cloudinary)
        </AlertTitle>
        <AlertDescription className="text-blue-700/80 dark:text-blue-400/80">
          Para habilitar el almacenamiento en la nube y evitar el uso del disco
          local, registre las siguientes variables de sistema:
          <ul className="list-disc list-inside mt-2 font-mono text-xs space-y-1">
            <li>CLOUDINARY_CLOUD_NAME</li>
            <li>CLOUDINARY_API_KEY</li>
            <li>CLOUDINARY_API_SECRET</li>
          </ul>
          <p className="mt-2 text-xs italic">
            * Si estas variables no están configuradas o están inactivas, el
            sistema utilizará automáticamente la carpeta local{" "}
            <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">
              /public/uploads
            </code>
            .
          </p>
        </AlertDescription>
      </Alert>

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
