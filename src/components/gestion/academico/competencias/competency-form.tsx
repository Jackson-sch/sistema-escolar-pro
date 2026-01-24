"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { IconLoader2, IconTarget } from "@tabler/icons-react";
import { toast } from "sonner";

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
}

export function CompetencyForm({
  id,
  initialData,
  onSuccess,
}: CompetencyFormProps) {
  const [isPending, startTransition] = useTransition();
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    getCurricularAreasAction().then((res) => {
      if (res.data) setAreas(res.data);
    });
  }, []);

  const form = useForm<CompetencyValues>({
    resolver: zodResolver(CompetencySchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          areaCurricularId: initialData.areaCurricularId,
        }
      : {
          nombre: "",
          descripcion: "",
          areaCurricularId: "",
        },
  });

  const onSubmit = (values: CompetencyValues) => {
    startTransition(() => {
      upsertCompetencyAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          onSuccess?.();
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="areaCurricularId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Curricular</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <SelectValue placeholder="Seleccione un área..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Competencia</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconTarget className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="Ej: Se comunica oralmente..."
                    className="pl-10 w-full rounded-full"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Defina el alcance de esta competencia..."
                  className="resize-none min-h-[100px] rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={isPending}
          type="submit"
          className="w-full rounded-full"
        >
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Guardar Cambios" : "Crear Competencia"}
        </Button>
      </form>
    </Form>
  );
}
