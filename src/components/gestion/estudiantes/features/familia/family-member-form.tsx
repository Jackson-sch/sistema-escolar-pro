"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useState, useRef } from "react";
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { upsertFamilyMemberAction } from "@/actions/family";
import { getGuardianByDniAction } from "@/actions/students";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

import {
  familySchema,
  FamilyValues,
  FamilyMemberFormProps,
} from "./components/family-form-types";
import { IdentificacionSection } from "./components/identificacion-section";
import { PermisosSection } from "./components/permisos-section";

export function FamilyMemberForm({
  studentId,
  relationId,
  initialData,
  onSuccess,
}: FamilyMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [isAutofilled, setIsAutofilled] = useState(false);

  const form = useForm<FamilyValues>({
    resolver: zodResolver(familySchema),
    defaultValues: initialData
      ? {
          dni: initialData.padreTutor?.dni || "",
          name: initialData.padreTutor?.name || "",
          apellidoPaterno: initialData.padreTutor?.apellidoPaterno || "",
          apellidoMaterno: initialData.padreTutor?.apellidoMaterno || "",
          telefono: initialData.padreTutor?.telefono || "",
          email: initialData.padreTutor?.email || "",
          parentesco: initialData.parentesco || "",
          contactoPrimario: initialData.contactoPrimario || false,
          autorizadoRecoger: initialData.autorizadoRecoger ?? true,
          viveCon: initialData.viveCon ?? true,
        }
      : {
          dni: "",
          name: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          telefono: "",
          email: "",
          parentesco: "",
          contactoPrimario: false,
          autorizadoRecoger: true,
          viveCon: true,
        },
  });

  const onSubmit = (values: FamilyValues) => {
    startTransition(async () => {
      const res = await upsertFamilyMemberAction(studentId, values, relationId);
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess?.();
      }
    });
  };

  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  const { isDirty } = form.formState;
  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // Observar cambios en el DNI para auto-completar datos existentes
  const dni = form.watch("dni");

  useEffect(() => {
    let ignore = false;
    if (!initialData && dni && dni.length === 8) {
      const searchGuardian = async () => {
        try {
          if (ignore) return;
          const res = await getGuardianByDniAction(dni);
          if (ignore) return;
          if (res?.data) {
            form.setValue("name", res.data.name || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("apellidoPaterno", res.data.apellidoPaterno || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("apellidoMaterno", res.data.apellidoMaterno || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("telefono", res.data.telefono || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("email", res.data.email || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            setIsAutofilled(true);
            toast.success("Familiar registrado previamente. Datos cargados.");
          } else {
            if (!ignore) setIsAutofilled(false);
          }
        } catch {
          if (!ignore) setIsAutofilled(false);
        }
      };
      searchGuardian();
    } else if (!initialData && !dni) {
      setIsAutofilled(false);
      form.setValue("name", "");
      form.setValue("apellidoPaterno", "");
      form.setValue("apellidoMaterno", "");
      form.setValue("telefono", "");
      form.setValue("email", "");
    }
    return () => {
      ignore = true;
    };
  }, [dni, form, initialData]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 px-1 py-1"
      >
        <IdentificacionSection
          control={form.control}
          isAutofilled={isAutofilled}
        />

        <PermisosSection control={form.control} />

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          {onSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40 cursor-pointer"
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            disabled={isPending}
            type="submit"
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px] cursor-pointer"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Guardar Familiar</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export type { FamilyMemberFormProps, FamilyValues };
