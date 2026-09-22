"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { IconEdit, IconLoader2, IconCalendar } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { upsertPeriodoAction } from "@/actions/evaluations/periodos";

interface EditPeriodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodo: {
    id: string;
    nombre: string;
    tipo: string;
    numero: number;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    anioEscolar: number;
    activo: boolean;
    institucionId?: string;
  };
}

export function EditPeriodoDialog({
  open,
  onOpenChange,
  periodo,
}: EditPeriodoDialogProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm({
    defaultValues: {
      nombre: periodo.nombre,
      tipo: periodo.tipo,
      numero: periodo.numero,
      fechaInicio: new Date(periodo.fechaInicio),
      fechaFin: new Date(periodo.fechaFin),
      anioEscolar: periodo.anioEscolar,
      activo: periodo.activo,
      institucionId: periodo.institucionId,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        nombre: periodo.nombre,
        tipo: periodo.tipo,
        numero: periodo.numero,
        fechaInicio: new Date(periodo.fechaInicio),
        fechaFin: new Date(periodo.fechaFin),
        anioEscolar: periodo.anioEscolar,
        activo: periodo.activo,
        institucionId: periodo.institucionId,
      });
    }
  }, [open, periodo, form]);

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertPeriodoAction({
        values,
        id: periodo.id,
      });

      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-5 border-border/50">
        <DialogHeader className="pb-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <IconEdit className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold tracking-tight">
                Editar Periodo Académico
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {periodo.tipo} N° {periodo.numero} · Año Escolar {periodo.anioEscolar}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground/80">
                    Nombre del Periodo
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="rounded-xl text-xs h-9 bg-background border-border/50 font-medium"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold text-foreground/80">
                      Fecha Inicio
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-xl text-xs h-9 border-border/50",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Seleccionar"}
                            <IconCalendar className="size-3.5 ml-auto opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-border/40" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fechaFin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-xs font-bold text-foreground/80">
                      Fecha Fin
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-xl text-xs h-9 border-border/50",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Seleccionar"}
                            <IconCalendar className="size-3.5 ml-auto opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl border-border/40" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2 border-t border-border/40 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-xl text-xs h-9"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="rounded-xl text-xs h-9 font-bold shadow-sm"
              >
                {isPending && <IconLoader2 className="size-3.5 animate-spin mr-1.5" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
