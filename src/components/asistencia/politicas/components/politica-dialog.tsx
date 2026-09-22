"use client";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { PoliticaFormFields } from "../politica-form-fields";
import { PoliticaFormState, PoliticaFormAction } from "./politicas-types";

interface PoliticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formState: PoliticaFormState;
  dispatch: React.Dispatch<PoliticaFormAction>;
  niveles: any[];
  isSaving: boolean;
  onSave: () => void;
}

export function PoliticaDialog({
  open,
  onOpenChange,
  formState,
  dispatch,
  niveles,
  isSaving,
  onSave,
}: PoliticaDialogProps) {
  const {
    editingPolitica,
    nombre,
    nivelId,
    turno,
    horaEntrada,
    horaSalida,
    tolerancia,
    activo,
  } = formState;

  return (
    <FormModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title={editingPolitica ? "Editar Política" : "Nueva Política"}
      description="Defina las reglas de horario para este grupo."
      className="sm:w-md"
    >
      <PoliticaFormFields
        nombre={nombre}
        setNombre={(v) => dispatch({ type: "PATCH", patch: { nombre: v } })}
        nivelId={nivelId}
        setNivelId={(v) => dispatch({ type: "PATCH", patch: { nivelId: v } })}
        niveles={niveles}
        turno={turno}
        setTurno={(v) => dispatch({ type: "PATCH", patch: { turno: v } })}
        horaEntrada={horaEntrada}
        setHoraEntrada={(v) =>
          dispatch({ type: "PATCH", patch: { horaEntrada: v } })
        }
        horaSalida={horaSalida}
        setHoraSalida={(v) =>
          dispatch({ type: "PATCH", patch: { horaSalida: v } })
        }
        tolerancia={tolerancia}
        setTolerancia={(v) =>
          dispatch({ type: "PATCH", patch: { tolerancia: v } })
        }
        activo={activo}
        setActivo={(v) => dispatch({ type: "PATCH", patch: { activo: v } })}
      />

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={isSaving}
          className="rounded-xl cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="rounded-xl min-w-[120px] cursor-pointer"
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </FormModal>
  );
}
