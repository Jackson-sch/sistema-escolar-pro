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
        toast.success("Variantes actualizadas");
        onOpenChange(false);
      }
    });
  }

  return (
    <FormModal
      title={`Gestionar Tallas: ${uniform?.nombre || ""}`}
      description="Configura los precios y stock disponible por cada sede."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-3xl"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Lista de Variantes
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ sedeId: "", talla: "", precio: 0, stock: 0 })
              }
              className="h-8 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 rounded-lg text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Añadir Talla
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border/40 space-y-4 relative group"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 h-7 w-7 text-muted-foreground/40 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`variantes.${index}.sedeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                          <Home className="h-3 w-3" /> Sede
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-muted/10 border-border/40 h-9 rounded-lg text-xs">
                              <SelectValue placeholder="Sede" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sedes.map((sede) => (
                              <SelectItem
                                key={sede.id}
                                value={sede.id}
                                className="text-xs"
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
                      <FormItem>
                        <FormLabel className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                          <Ruler className="h-3 w-3" /> Talla
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="4, 6, S, M..."
                            {...field}
                            className="bg-muted/10 border-border/40 h-9 rounded-lg text-xs"
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
                      <FormItem>
                        <FormLabel className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                          <BadgeDollarSign className="h-3 w-3" /> Precio (S/)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.50"
                            {...field}
                            className="bg-muted/10 border-border/40 h-9 rounded-lg text-xs"
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
                      <FormItem>
                        <FormLabel className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                          <Package className="h-3 w-3" /> Stock
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-muted/10 border-border/40 h-9 rounded-lg text-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl h-11 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
