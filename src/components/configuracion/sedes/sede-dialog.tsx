"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createSedeAction, updateSedeAction } from "@/actions/sedes";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/ui/image-upload";
import { LocationPicker } from "./location-picker";
import { FormModal } from "@/components/modals/form-modal";
import { useFormModal } from "@/components/modals/form-modal-context";
import { IconLoader2, IconDeviceFloppy, IconExternalLink } from "@tabler/icons-react";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

const SedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.email("Email inválido").optional().or(z.literal("")),
  director: z.string().optional(),
  codigoIdentifier: z.string().optional(),
  logo: z.string().optional(),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
  activo: z.boolean(),
});

type SedeFormValues = z.infer<typeof SedeSchema>;

interface SedeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sede?: any;
}

export function SedeDialog({ open, onOpenChange, sede }: SedeDialogProps) {
  return (
    <FormModal
      title={sede ? "Editar Sede Institucional" : "Nueva Sede Institucional"}
      description={
        sede?.esPrincipal
          ? "Esta es la sede principal. Sus datos básicos se sincronizan con los Datos Institucionales."
          : sede
            ? "Modifique la información de la sede seleccionada."
            : "Complete los datos para registrar una nueva sede."
      }
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-[620px]"
    >
      <SedeFormContent sede={sede} onSuccess={() => onOpenChange(false)} />
    </FormModal>
  );
}

interface SedeFormContentProps {
  sede?: any;
  onSuccess: () => void;
}

function SedeFormContent({ sede, onSuccess }: SedeFormContentProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const { setIsDirty } = useFormModal();

  const form = useForm<SedeFormValues>({
    resolver: zodResolver(SedeSchema),
    defaultValues: {
      nombre: sede?.nombre || "",
      direccion: sede?.direccion || "",
      telefono: sede?.telefono || "",
      email: sede?.email || "",
      director: sede?.director || "",
      codigoIdentifier: sede?.codigoIdentifier || "",
      logo: sede?.logo || "",
      lat: sede?.lat ?? null,
      lng: sede?.lng ?? null,
      activo: sede?.activo ?? true,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = async (values: SedeFormValues) => {
    setIsPending(true);
    try {
      if (sede) {
        const res = await updateSedeAction(sede.id, values);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Sede actualizada correctamente");
          setIsDirty(false);
          onSuccess();
          router.refresh();
        }
      } else {
        const res = await createSedeAction(values);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Sede creada correctamente");
          setIsDirty(false);
          onSuccess();
          form.reset();
          router.refresh();
        }
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
        <div className="flex justify-center py-1">
          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem className="w-fit">
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    disabled={isPending}
                    className="w-28 h-28"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">Nombre de la Sede</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Sede Central - Av. Los Tulipanes" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="codigoIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Código Modular / Identificador</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 123456" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9 font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Teléfono Directo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. (01) 445-8899" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">Dirección Física</FormLabel>
              <FormControl>
                <Input placeholder="Av. Principal 123, Urb. San Andrés" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Email Oficial de Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="contacto@colegio.edu.pe" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="director"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">Director / Encargado de Sede</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del responsable" {...field} className="bg-background border-border/40 rounded-xl text-xs h-9" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel className="text-xs font-medium text-foreground/80">Geolocalización en Mapa</FormLabel>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
            >
              <IconExternalLink className="size-3" />
              <span>Abrir Google Maps</span>
            </a>
          </div>
          <LocationPicker
            value={
              form.watch("lat") != null && form.watch("lng") != null
                ? { lat: form.watch("lat")!, lng: form.watch("lng")! }
                : null
            }
            onChange={(coords) => {
              form.setValue("lat", coords?.lat ?? null, {
                shouldDirty: true,
              });
              form.setValue("lng", coords?.lng ?? null, {
                shouldDirty: true,
              });
            }}
            disabled={isPending}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <FormField
              control={form.control}
              name="lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] text-muted-foreground font-bold uppercase">
                    Latitud
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="-8.083672"
                      className="bg-background border-border/40 h-8 text-xs font-mono rounded-xl"
                      {...field}
                      value={field.value ?? ""}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData("text").trim();
                        const parts = pasted.split(/[,\s]+/).filter(Boolean);
                        if (parts.length === 2) {
                          const lat = parseFloat(parts[0]);
                          const lng = parseFloat(parts[1]);
                          if (!isNaN(lat) && !isNaN(lng)) {
                            e.preventDefault();
                            form.setValue("lat", lat, {
                              shouldDirty: true,
                            });
                            form.setValue("lng", lng, {
                              shouldDirty: true,
                            });
                          }
                        }
                      }}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] text-muted-foreground font-bold uppercase">
                    Longitud
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="-79.000787"
                      className="bg-background border-border/40 h-8 text-xs font-mono rounded-xl"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        {sede && (
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border/40 p-3 bg-background/50">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs font-semibold cursor-pointer">Sede Operativa Activa</FormLabel>
                  <FormDescription className="text-[11px]">
                    Si se desactiva, la sede no aparecerá en nuevas matrículas.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
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
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{sede ? "Actualizar Sede" : "Guardar Sede"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
