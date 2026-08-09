"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import {
  getGradosAction,
  getNivelesAction,
} from "@/actions/academic-structure";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";

const announcementSchema = z.object({
  titulo: z.string().min(4, "El título debe tener al menos 4 caracteres"),
  contenido: z.string().min(5, "El contenido es muy corto"),
  resumen: z.string().optional(),
  imagen: z.string().optional(),
  dirigidoA: z.string().min(1, "Seleccione a quién va dirigido"),
  importante: z.boolean().default(false),
  urgente: z.boolean().default(false),
  fijado: z.boolean().default(false),
  grados: z.array(z.string()).default([]),
  niveles: z.array(z.string()).default([]),
});

interface AnnouncementFormProps {
  onSuccess: () => void;
  initialData?: any;
  id?: string;
  isProfessor?: boolean;
  profesorId?: string;
}

export function AnnouncementForm({
  onSuccess,
  initialData,
  id,
  isProfessor,
  profesorId,
}: AnnouncementFormProps) {
  const [loading, setLoading] = useState(false);
  const [grados, setGrados] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);
  const router = useRouter();
  const { setIsDirty, setOnSubmit } = useFormModal();

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      if (ignore) return;
      const [{ data: gradosRes }, { data: nivelesRes }] = await Promise.all([
        getGradosAction(undefined, isProfessor ? profesorId : undefined),
        getNivelesAction(),
      ]);
      if (ignore) return;
      if (gradosRes) setGrados(gradosRes);
      if (nivelesRes) setNiveles(nivelesRes);
    };
    fetchData();
    return () => {
      ignore = true;
    };
  }, [isProfessor, profesorId]);

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
      grados: (initialData?.grados || []).map((g: any) => g.id),
      niveles: (initialData?.niveles || []).map((n: any) => n.id),
    },
  });

  const onSubmit = async (values: z.infer<typeof announcementSchema>) => {
    setLoading(true);
    try {
      const cleanedValues = {
        ...values,
        imagen: values.imagen || null,
        resumen: values.resumen || null,
      };

      const res = await upsertAnuncioAction({ ...cleanedValues, id });
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        router.refresh();
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3.5">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Título del Anuncio
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Inicio de vacaciones trimestrales"
                      {...field}
                      className="bg-background border-border/40 rounded-xl text-xs h-9"
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
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Resumen corto
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Breve vista previa para la tarjeta"
                      {...field}
                      className="bg-background border-border/40 rounded-xl text-xs h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dirigidoA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Dirigido A
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                        <SelectValue placeholder="Seleccione destinatario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40">
                      <SelectItem value="TODOS" className="text-xs font-medium">Toda la comunidad</SelectItem>
                      <SelectItem value="ESTUDIANTES" className="text-xs font-medium">
                        Solo Estudiantes
                      </SelectItem>
                      <SelectItem value="PROFESORES" className="text-xs font-medium">
                        Solo Profesores
                      </SelectItem>
                      <SelectItem value="PADRES" className="text-xs font-medium">Solo Padres</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch("dirigidoA") === "ESTUDIANTES" ||
              form.watch("dirigidoA") === "PADRES") && (
              <FormField
                control={form.control}
                name="grados"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-foreground/80">
                      Seleccionar Grados Específicos
                    </FormLabel>
                    <ScrollArea className="h-[100px] rounded-xl border border-border/40 bg-background/60 p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {grados.map((grado) => (
                          <FormField
                            key={grado.id}
                            control={form.control}
                            name="grados"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={grado.id}
                                  className="flex flex-row items-center space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(grado.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([
                                            ...current,
                                            grado.id,
                                          ]);
                                        } else {
                                          field.onChange(
                                            current.filter(
                                              (v: string) => v !== grado.id,
                                            ),
                                          );
                                        }
                                      }}
                                      className="rounded-md border-border/40"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-xs font-normal cursor-pointer">
                                    {grado.nombre}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <FormLabel className="text-xs font-medium text-foreground/80">
              Imagen Ilustrativa (Opcional)
            </FormLabel>
            <FormField
              control={form.control}
              name="imagen"
              render={({ field }) => (
                <FormItem className="w-full flex-1 flex items-center justify-center">
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Contenido Completo
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escriba aquí el mensaje detallado..."
                  {...field}
                  className="min-h-[80px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center justify-around gap-4 p-3 rounded-xl bg-background/50 border border-border/40">
          <FormField
            control={form.control}
            name="importante"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
                <FormLabel className="text-xs font-medium cursor-pointer">
                  Importante
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="urgente"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
                <FormLabel className="text-xs font-medium cursor-pointer text-rose-600 dark:text-rose-400">
                  Urgente
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fijado"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
                <FormLabel className="text-xs font-medium cursor-pointer">
                  Fijar Arriba
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{id ? "Actualizar Anuncio" : "Publicar Anuncio Ahora"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
