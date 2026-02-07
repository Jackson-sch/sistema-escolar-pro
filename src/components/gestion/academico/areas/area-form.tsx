"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  IconLoader2,
  IconHash,
  IconPalette,
  IconArrowUp,
  IconFileDescription,
} from "@tabler/icons-react";

import {
  CurricularAreaSchema,
  CurricularAreaValues,
} from "@/lib/schemas/academic";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { upsertAreaAction } from "@/actions/academic";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { colors } from "@/lib/constants";

interface AreaFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  institucionId: string;
}

export function AreaForm({
  id,
  initialData,
  onSuccess,
  institucionId,
}: AreaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<CurricularAreaValues>({
    resolver: zodResolver(CurricularAreaSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          descripcion: initialData.descripcion || "",
          color: initialData.color || "#3b82f6",
          creditos: initialData.creditos || 0,
          nivelId: initialData.nivelId || "",
          institucionId: initialData.institucionId || institucionId,
        }
      : {
          nombre: "",
          codigo: "",
          descripcion: "",
          orden: 0,
          color: "#3b82f6",
          activa: true,
          creditos: 0,
          nivelId: "",
          institucionId,
        },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = (values: CurricularAreaValues) => {
    startTransition(() => {
      upsertAreaAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          onSuccess?.();
        }
      });
    });
  };



  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del Área */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Área</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconFileDescription className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="Ejem: Ciencia y Tecnología"
                      className="pl-10 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Código */}
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconHash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="CYT-CORE"
                      className="pl-10 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Orden */}
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de Visualización</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconArrowUp className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      className="pl-10 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selector de Color */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etiqueta Visual (Color)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    {/* Colores predefinidos */}
                    <div className="flex flex-wrap gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => field.onChange(c)}
                          className={cn(
                            "size-6 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                            field.value === c
                              ? "ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm"
                              : "border-transparent opacity-60 hover:opacity-100",
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Seleccionar color ${c}`}
                        />
                      ))}
                    </div>
                    {/* Selector personalizado nativo */}
                    <div className="relative group">
                      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 pointer-events-none group-hover:ring-black/20 transition-all" />
                      <Input
                        type="color"
                        {...field}
                        className="size-6 p-0 border-none bg-transparent cursor-pointer rounded-full overflow-hidden opacity-0 absolute inset-0 z-10"
                      />
                      {/* Vista previa del color custom */}
                      <div
                        className="size-6 rounded-full shadow-sm"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
        {/* Descripción */}
        <div className="pt-6 border-b border-muted pb-6">
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción / Propósito Pedagógico</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe los objetivos y el alcance de esta área curricular..."
                  className="resize-none min-h-[60px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full sm:w-auto font-medium rounded-full px-8"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : id ? "Guardar Cambios" : "Crear Área"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
