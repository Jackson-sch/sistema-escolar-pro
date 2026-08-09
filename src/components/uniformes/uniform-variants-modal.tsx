"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useTransition } from "react";
import { upsertUniformeAction } from "@/actions/uniformes";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Home,
  Ruler,
  BadgeDollarSign,
  Package,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormModal } from "@/components/modals/form-modal";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { IconDeviceFloppy } from "@tabler/icons-react";

const variantSchema = z.object({
  id: z.string().optional(),
  sedeId: z.string().min(1, "Selecciona una sede"),
  talla: z.string().min(1, "Ingresa la talla"),
  precio: z.coerce.number().min(0, "Precio inválido"),
  stock: z.coerce.number().min(0, "Stock inválido"),
});

const formSchema = z.object({
  id: z.string(),
  variantes: z.array(variantSchema).min(1, "Agrega al menos una variante"),
});

type UniformVariantsFormValues = z.infer<typeof formSchema>;

interface UniformVariantsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  uniform: any;
  sedes: any[];
}

export function UniformVariantsModal({
  isOpen,
  onOpenChange,
  uniform,
  sedes,
}: UniformVariantsModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UniformVariantsFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      id: uniform?.id || "",
      variantes: uniform?.variantes?.map((v: any) => ({
        id: v.id,
        sedeId: v.sedeId,
        talla: v.talla,
        precio: v.precio,
        stock: v.stock,
      })) || [{ sedeId: "", talla: "", precio: 0, stock: 0 }],
    },
  });

  useEffect(() => {
    if (isOpen && uniform) {
      form.reset({
        id: uniform.id,
        variantes: uniform.variantes?.map((v: any) => ({
          id: v.id,
          sedeId: v.sedeId,
          talla: v.talla,
          precio: v.precio,
          stock: v.stock,
        })) || [{ sedeId: "", talla: "", precio: 0, stock: 0 }],
      });
    }
  }, [uniform, isOpen, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variantes",
  });

  function onSubmit(values: UniformVariantsFormValues) {
    if (!uniform?.id) return;

    startTransition(async () => {
      const res = await upsertUniformeAction({
        id: uniform.id,
        variantes: values.variantes,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Variantes y tallas actualizadas correctamente");
        onOpenChange(false);
      }
    });
  }

  return (
    <FormModal
      title={`Gestionar Tallas: ${uniform?.nombre || ""}`}
      description="Configura los precios por prenda y el stock disponible por cada sede."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-3xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
          <div className="flex items-center justify-between border-b border-border/30 pb-2.5">
            <span className="text-xs font-semibold text-foreground/80">
              Combinaciones de Talla y Sede ({fields.length})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ sedeId: sedes[0]?.id || "", talla: "", precio: 0, stock: 0 })
              }
              className="h-8 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir Talla</span>
            </Button>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-3 bg-background/50 rounded-xl border border-border/40 space-y-3 relative group"
              >
                <div className="grid grid-cols-12 gap-3 items-end">
                  <FormField
                    control={form.control}
                    name={`variantes.${index}.sedeId`}
                    render={({ field }) => (
                      <FormItem className="col-span-12 sm:col-span-4">
                        <FormLabel className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                          <Home className="h-3.5 w-3.5 text-indigo-500" /> Sede
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background border-border/40 h-9 w-full rounded-xl text-xs font-medium">
                              <SelectValue placeholder="Seleccionar sede" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-border/40">
                            {sedes.map((sede) => (
                              <SelectItem
                                key={sede.id}
                                value={sede.id}
                                className="text-xs font-medium"
                              >
                                {sede.nombre}
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
                    name={`variantes.${index}.talla`}
                    render={({ field }) => (
                      <FormItem className="col-span-6 sm:col-span-2">
                        <FormLabel className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                          <Ruler className="h-3.5 w-3.5 text-amber-500" /> Talla
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 4, 6, S, M"
                            {...field}
                            className="bg-background border-border/40 h-9 rounded-xl text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variantes.${index}.precio`}
                    render={({ field }) => (
                      <FormItem className="col-span-6 sm:col-span-3">
                        <FormLabel className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                          <BadgeDollarSign className="h-3.5 w-3.5 text-emerald-500" /> Precio (S/)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.50"
                            {...field}
                            className="bg-background border-border/40 h-9 rounded-xl text-xs font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variantes.${index}.stock`}
                    render={({ field }) => (
                      <FormItem className="col-span-9 sm:col-span-2">
                        <FormLabel className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                          <Package className="h-3.5 w-3.5 text-sky-500" /> Stock
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-background border-border/40 h-9 rounded-xl text-xs font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="col-span-3 sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      title="Eliminar talla"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Guía de Atajos de Teclado */}
          <FormKeyboardHelpBar />

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[170px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" />
                  <span>Guardar Tallas</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
