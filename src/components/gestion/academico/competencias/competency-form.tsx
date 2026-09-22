"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition, useRef } from "react";
import { IconLoader2, IconTarget } from "@tabler/icons-react";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";

import { CompetencySchema, CompetencyValues } from "@/lib/schemas/competencies";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertCompetencyAction,
  getCurricularAreasAction,
} from "@/actions/competencies";

interface CompetencyFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  defaultNivelId?: string;
  defaultAreaId?: string;
}

export function CompetencyForm({
  id,
  initialData,
  onSuccess,
  defaultNivelId,
  defaultAreaId,
}: CompetencyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [areas, setAreas] = useState<any[]>([]);
  const { setIsDirty, setOnSubmit } = useFormModal();

  useEffect(() => {
    // Si tenemos defaultNivelId, la accion devolvera solo las areas de ese nivel
    getCurricularAreasAction(defaultNivelId).then((res) => {
      if (res.data) setAreas(res.data);
    });
  }, [defaultNivelId]);

  const form = useForm<CompetencyValues>({
    resolver: zodResolver(CompetencySchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          areaCurricularId: initialData.areaCurricularId || defaultAreaId || "",
        }
      : {
          nombre: "",
          descripcion: "",
          areaCurricularId: defaultAreaId || "",
        },
  });

  useEffect(() => {
    if (!initialData && defaultAreaId) {
       form.setValue("areaCurricularId", defaultAreaId);
    }
  }, [defaultAreaId, initialData, form]);

  const onSubmit = (values: CompetencyValues) => {
    startTransition(() => {
      upsertCompetencyAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          onSuccess?.();
        }
      });
    });
  };

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="areaCurricularId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Área Curricular</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full h-9 text-xs font-medium rounded-xl border-border/60 bg-background">
                    <SelectValue placeholder="Seleccione un área curricular..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id} className="text-xs">
                      {area.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Nombre de la Competencia (CNEB)</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconTarget className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="Ej: Se comunica oralmente en su lengua materna"
                    className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-background"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Descripción / Criterio de Desempeño</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Defina el alcance o criterios de evaluación de esta competencia..."
                  rows={3}
                  className="resize-none text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
          >
            {isPending && <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />}
            {id ? "Guardar Cambios" : "Crear Competencia"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
