"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const SedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  direccion: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  director: z.string().optional(),
  codigoIdentifier: z.string().optional(),
  activo: z.boolean(),
});

type SedeFormValues = z.infer<typeof SedeSchema>;

interface SedeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sede?: any;
}

export function SedeDialog({ open, onOpenChange, sede }: SedeDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const form = useForm<SedeFormValues>({
    resolver: zodResolver(SedeSchema),
    defaultValues: {
      nombre: "",
      direccion: "",
      telefono: "",
      email: "",
      director: "",
      codigoIdentifier: "",
      activo: true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nombre: sede?.nombre || "",
        direccion: sede?.direccion || "",
        telefono: sede?.telefono || "",
        email: sede?.email || "",
        director: sede?.director || "",
        codigoIdentifier: sede?.codigoIdentifier || "",
        activo: sede?.activo ?? true,
      });
    }
  }, [open, sede, form]);

  const onSubmit = async (values: SedeFormValues) => {
    setIsPending(true);
    try {
      if (sede) {
        const res = await updateSedeAction(sede.id, values);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Sede actualizada correctamente");
          onOpenChange(false);
          router.refresh();
        }
      } else {
        const res = await createSedeAction(values);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Sede creada correctamente");
          onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{sede ? "Editar Sede" : "Nueva Sede"}</DialogTitle>
          <DialogDescription>
            {sede
              ? "Modifique los datos de la sede aquí."
              : "Ingrese los datos de la nueva sede."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
