"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { upsertAnuncioAction } from "@/actions/communications";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

const announcementSchema = z.object({
  titulo: z.string().min(4, "El título debe tener al menos 4 caracteres"),
  contenido: z.string().min(5, "El contenido es muy corto"),
  resumen: z.string().optional(),
  imagen: z.string().optional(),
  dirigidoA: z.string().min(1, "Seleccione a quién va dirigido"),
  importante: z.boolean().default(false),
  urgente: z.boolean().default(false),
  fijado: z.boolean().default(false),
});

interface AnnouncementFormProps {
  onSuccess: () => void;
  initialData?: any;
  id?: string;
}

export function AnnouncementForm({
  onSuccess,
  initialData,
  id,
}: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false);
  const { setIsDirty } = useFormModal();

  const form = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema) as any,
    defaultValues: {
      titulo: initialData?.titulo || "",
      contenido: initialData?.contenido || "",
      resumen: initialData?.resumen || "",
      imagen: initialData?.imagen || "",
      dirigidoA: initialData?.dirigidoA || "TODOS",
      importante: initialData?.importante || false,
      urgente: initialData?.urgente || false,
      fijado: initialData?.fijado || false,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    setLoading(true);
    try {
      const cleanedValues = {
        ...values,
        imagen: values.imagen || null,
        resumen: values.resumen || null,
      };

      const res = await upsertAnuncioAction(cleanedValues, id);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    Título del Anuncio
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Inicio de vacaciones trimestrales"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resumen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    Resumen corto
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Una breve descripción para la tarjeta"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    Aparecerá en la vista previa de la tarjeta.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dirigidoA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-muted-foreground/70">
                    Dirigido A
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-full w-full border-border/40 bg-background/50">
                        <SelectValue placeholder="Seleccione destinatario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                      <SelectItem value="TODOS">Toda la comunidad</SelectItem>
                      <SelectItem value="ESTUDIANTES">
                        Solo Estudiantes
                      </SelectItem>
                      <SelectItem value="PROFESORES">
                        Solo Profesores
                      </SelectItem>
                      <SelectItem value="PADRES">Solo Padres</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col items-center justify-center space-y-2">
            <FormLabel className="text-xs font-bold text-muted-foreground/70 self-start">
              Imagen del Anuncio (Opcional)
            </FormLabel>
            <FormField
              control={form.control}
              name="imagen"
              render={({ field }) => (
                <FormItem className="w-full h-full flex items-center justify-center">
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      onRemove={() => field.onChange("")}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="contenido"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-muted-foreground/70">
                Contenido Completo
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escriba aquí el mensaje detallado..."
                  {...field}
                  className="min-h-[100px] rounded-2xl border-border/40 bg-background/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4 p-2 rounded-2xl bg-muted/5 border border-border/40">
          <FormField
            control={form.control}
            name="importante"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center gap-2 space-y-0">
                <FormLabel className="text-[10px] font-bold uppercase tracking-tighter">
                  Importante
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-75"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urgente"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center gap-2 space-y-0">
                <FormLabel className="text-[10px] font-bold uppercase tracking-tighter">
                  Urgente
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-75"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fijado"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center gap-2 space-y-0">
                <FormLabel className="text-[10px] font-bold uppercase tracking-tighter">
                  Fijar
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="scale-75"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="default"
            className="w-full sm:w-auto rounded-full px-8"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : id
                ? "Actualizar Anuncio"
                : "Publicar Anuncio Ahora"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
