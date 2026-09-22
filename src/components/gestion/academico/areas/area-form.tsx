"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef } from "react";
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
import { upsertAreaAction } from "@/actions/academic";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colors } from "@/lib/constants";
import { IconPicker } from "@/components/ui/icon-picker";

interface AreaFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  institucionId: string;
  niveles: { id: string; nombre: string }[];
  defaultNivelId?: string;
}

function getAreaDefaultValues(
  initialData: any,
  defaultNivelId?: string,
  institucionId?: string
): CurricularAreaValues {
  if (initialData) {
    return {
      ...initialData,
      nombre: initialData.nombre || "",
      codigo: initialData.codigo || "",
      descripcion: initialData.descripcion || "",
      orden: initialData.orden ?? 0,
      color: initialData.color || "#3b82f6",
      icono: initialData.icono || "",
      creditos: initialData.creditos || 0,
      nivelId: initialData.nivelId || defaultNivelId || "",
      institucionId: initialData.institucionId || (institucionId ?? ""),
    };
  }
  return {
    nombre: "",
    codigo: "",
    descripcion: "",
    orden: 0,
    color: "#3b82f6",
    icono: "",
    activa: true,
    creditos: 0,
    nivelId: defaultNivelId || "",
    institucionId: institucionId ?? "",
  };
}

function AreaFormActions({
  isPending,
  isEdit,
  onCancel,
}: {
  isPending: boolean;
  isEdit: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
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
        {isPending ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Área"}
      </Button>
    </div>
  );
}

export function AreaForm({
  id,
  initialData,
  onSuccess,
  institucionId,
  niveles,
  defaultNivelId,
}: AreaFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<CurricularAreaValues>({
    resolver: zodResolver(CurricularAreaSchema),
    defaultValues: getAreaDefaultValues(initialData, defaultNivelId, institucionId),
  });

  useEffect(() => {
    if (!initialData && defaultNivelId) {
      form.setValue("nivelId", defaultNivelId);
    }
  }, [defaultNivelId, initialData, form]);

  const { isDirty } = form.formState;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Área */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Nombre del Área</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconFileDescription className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      {...field}
                      placeholder="Ej: Ciencia y Tecnología"
                      className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-background"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />

          {/* Nivel Educativo */}
          <FormField
            control={form.control}
            name="nivelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Nivel Educativo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-xs font-medium rounded-xl border-border/60 bg-background">
                      <SelectValue placeholder="Seleccione un nivel..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel.id} value={nivel.id} className="text-xs">
                        {nivel.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />

          {/* Código */}
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Código Curricular</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconHash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      {...field}
                      placeholder="CYT-CORE"
                      className="pl-9 h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />

          {/* Orden */}
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Orden en Boleta</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconArrowUp className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                    <Input
                      {...field}
                      type="number"
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                      className="pl-9 h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />

          {/* Selector de Color */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Color Identificador</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2.5 pt-1">
                    {/* Colores predefinidos */}
                    <div className="flex flex-wrap gap-1.5">
                      {colors.slice(0, 7).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => field.onChange(c)}
                          className={cn(
                            "size-5.5 rounded-lg border transition-all cursor-pointer",
                            field.value === c
                              ? "ring-2 ring-offset-1 ring-primary scale-110 shadow-xs"
                              : "border-transparent opacity-70 hover:opacity-100",
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Color ${c}`}
                        />
                      ))}
                    </div>
                    {/* Selector personalizado nativo */}
                    <div className="relative group">
                      <Input
                        type="color"
                        {...field}
                        className="size-6 p-0 border-none bg-transparent cursor-pointer rounded-lg overflow-hidden opacity-0 absolute inset-0 z-10"
                      />
                      <div
                        className="size-6 rounded-lg shadow-2xs border border-border/60"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />

          {/* Selector de Icono */}
          <FormField
            control={form.control}
            name="icono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Icono Representativo</FormLabel>
                <FormControl>
                  <IconPicker
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Descripción / Propósito Pedagógico</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe los objetivos y el alcance de esta área curricular..."
                  rows={2}
                  className="resize-none text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <AreaFormActions
          isPending={isPending}
          isEdit={Boolean(id)}
          onCancel={onSuccess}
        />
      </form>
    </Form>
  );
}
