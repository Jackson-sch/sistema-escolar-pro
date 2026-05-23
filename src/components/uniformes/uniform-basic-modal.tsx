"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useTransition } from "react";
import { upsertUniformeAction } from "@/actions/uniformes";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { FormModal } from "@/components/modals/form-modal";

const formSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  categoriaId: z.string().min(1, "Selecciona una categoría"),
  genero: z.enum(["MASCULINO", "FEMENINO", "UNISEX"]),
  imagen: z.string().optional(),
});

type UniformBasicFormValues = z.infer<typeof formSchema>;

interface UniformBasicModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  uniform?: any;
  categories: any[];
}

export function UniformBasicModal({
  isOpen,
  onOpenChange,
  uniform,
  categories,
}: UniformBasicModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UniformBasicFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: uniform?.id || "",
      nombre: uniform?.nombre || "",
      descripcion: uniform?.descripcion || "",
      categoriaId: uniform?.categoriaId || "",
      genero: uniform?.genero || "UNISEX",
      imagen: uniform?.imagen || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        id: uniform?.id || "",
        nombre: uniform?.nombre || "",
        descripcion: uniform?.descripcion || "",
        categoriaId: uniform?.categoriaId || "",
        genero: uniform?.genero || "UNISEX",
        imagen: uniform?.imagen || "",
      });
    }
  }, [uniform, isOpen, form]);

  function onSubmit(values: UniformBasicFormValues) {
    startTransition(async () => {
      const res = await upsertUniformeAction(values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(uniform ? "Información actualizada" : "Uniforme creado");
        onOpenChange(false);
        form.reset();
      }
    });
  }

  return (
    <FormModal
      title={uniform ? "Editar Uniforme" : "Nuevo Uniforme"}
      description="Completa la información básica de la prenda para el catálogo."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg max-w-full bg-card"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground/80 ml-1">
                  Nombre del producto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Camisa Blanca Manga Larga"
                    {...field}
                    className="bg-muted/10 border-border/40 focus:bg-muted/20 transition-all h-11 rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground/80 ml-1">
                    Categoría
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/10 border-border/40 w-full h-11 rounded-full">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
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
              name="genero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground/80 ml-1">
                    Género
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/10 border-border/40 w-full h-11 rounded-full">
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MASCULINO">Masculino</SelectItem>
                      <SelectItem value="FEMENINO">Femenino</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground/80 ml-1">
                  Descripción (Opcional)
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Material, cuidado de la prenda, etc."
                    className="resize-none bg-muted/10 border-border/40 h-16 rounded-xl p-4"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imagen"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4 bg-muted/5 p-4 rounded-3xl border border-dashed border-border/40">
                <FormLabel className="text-muted-foreground/80 w-full text-left ml-1">
                  Imagen de la prenda
                </FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    onRemove={() => field.onChange("")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl h-11 font-bold hover:scale-105"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20 hover:scale-105"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar Información"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
