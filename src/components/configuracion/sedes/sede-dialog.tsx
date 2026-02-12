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
import { IconLoader2 } from "@tabler/icons-react";

const SedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
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
      title={sede ? "Editar Sede" : "Nueva Sede"}
      description={
        sede?.esPrincipal
          ? "Esta es la sede principal. Sus datos básicos se sincronizan con los Datos Institucionales."
          : sede
            ? "Modifique los datos de la sede aquí."
            : "Ingrese los datos de la nueva sede."
      }
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-[600px]"
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center py-2">
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
                    className="w-32 h-32"
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
              <FormLabel>Nombre de la Sede</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Sede Central" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigoIdentifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código Modular/Local</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 123456" {...field} />
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
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. 999888777" {...field} />
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
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Principal 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email de Contacto</FormLabel>
                <FormControl>
                  <Input placeholder="contacto@sede.com" {...field} />
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
                <FormLabel>Director / Encargado</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del responsable" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Ubicación en el Mapa</FormLabel>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Buscar en Google Maps
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

          {/* Manual lat/lng inputs */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] text-muted-foreground">
                    Latitud
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. -8.083672"
                      className="h-8 text-xs font-mono"
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
                  <FormLabel className="text-[11px] text-muted-foreground">
                    Longitud
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. -79.000787"
                      className="h-8 text-xs font-mono"
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
          <p className="text-[10px] text-muted-foreground/60">
            Haz clic en el mapa, busca una dirección, o pega las coordenadas
            desde Google Maps.
          </p>
        </div>

        {sede && (
          <FormField
            control={form.control}
            name="activo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Sede Activa</FormLabel>
                  <FormDescription>
                    Desactivar para ocultar esta sede en nuevos registros
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

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
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
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto rounded-full px-8"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sede ? "Actualizar Sede" : "Crear Sede"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
