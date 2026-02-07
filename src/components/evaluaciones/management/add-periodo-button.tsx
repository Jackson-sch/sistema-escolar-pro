"use client";

import { useState, useTransition } from "react";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { upsertPeriodoAction } from "@/actions/evaluations";
import { FormModal } from "@/components/modals/form-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddPeriodoButtonProps {
  institucionId: string;
}

export function AddPeriodoButton({ institucionId }: AddPeriodoButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      nombre: "",
      tipo: "BIMESTRE",
      numero: 1,
      fechaInicio: new Date(),
      fechaFin: new Date(),
      anioEscolar: new Date().getFullYear(),
      activo: true,
      institucionId,
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertPeriodoAction(values);
      if (res.success) {
        toast.success(res.success);
        form.reset({
          ...form.getValues(),
          nombre: "",
          numero: (form.getValues().numero as number) + 1,
        });
        setOpen(false);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            <IconPlus className="mr-2 size-4" />
            Agregar Periodo
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-pretty">
          Define la estructura temporal del año escolar (Bimestres, Trimestres,
          etc).
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Nuevo Periodo"
        description="Define la estructura temporal del año escolar (Bimestres, Trimestres, etc)."
        isOpen={open}
        onOpenChange={setOpen}
        className="w-sm"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Nombre del Periodo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: I Bimestre 2025"
                      {...field}
                      className="bg-muted/5 border-border/40 focus:ring-blue-500/20 rounded-full px-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Tipo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="BIMESTRE">Bimestre</SelectItem>
                        <SelectItem value="TRIMESTRE">Trimestre</SelectItem>
                        <SelectItem value="SEMESTRE">Semestre</SelectItem>
                        <SelectItem value="ANUAL">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Número
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="anioEscolar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Año Escolar
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={2030}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="fechaInicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Fecha Inicio
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-full px-4",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Seleccionar"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  <FormItem className="flex flex-col ">
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Fecha Fin
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal rounded-full px-4",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? format(field.value, "dd/MM/yyyy")
                              : "Seleccionar"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

            <Button
              type="submit"
              className="w-full font-semibold shadow-xl transition-all active:scale-[0.98] rounded-full"
              disabled={isPending}
            >
              {isPending ? "Procesando..." : "Crear Periodo"}
            </Button>
          </form>
        </Form>
      </FormModal>
    </>
  );
}
