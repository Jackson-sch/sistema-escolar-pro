"use client";

import { useState, useTransition, useEffect } from "react";
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
import { upsertPeriodoAction } from "@/actions/evaluations/periodos";
import { FormModal } from "@/components/modals/form-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddPeriodoButtonProps {
  institucionId?: string;
  existingCount?: number;
}

const ROMAN_NUMERALS: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
  5: "V",
  6: "VI",
};

export function AddPeriodoButton({
  institucionId,
  existingCount = 0,
}: AddPeriodoButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentYear = new Date().getFullYear();

  const nextNumber = existingCount > 0 ? existingCount + 1 : 1;
  const roman = ROMAN_NUMERALS[nextNumber] || `${nextNumber}`;

  const form = useForm({
    defaultValues: {
      nombre: `${roman} Bimestre - ${currentYear}`,
      tipo: "BIMESTRE",
      numero: nextNumber,
      fechaInicio: new Date(),
      fechaFin: new Date(),
      anioEscolar: currentYear,
      activo: true,
      institucionId: institucionId || "",
    },
  });

  // Actualizar valores por defecto al abrir o si cambia la cantidad existente
  useEffect(() => {
    if (open) {
      const num = existingCount + 1;
      const r = ROMAN_NUMERALS[num] || `${num}`;
      const tipo = form.getValues("tipo") || "BIMESTRE";
      const tipoLabel =
        tipo === "BIMESTRE"
          ? "Bimestre"
          : tipo === "TRIMESTRE"
          ? "Trimestre"
          : tipo === "SEMESTRE"
          ? "Semestre"
          : "Periodo";

      form.reset({
        ...form.getValues(),
        numero: num,
        nombre: `${r} ${tipoLabel} - ${form.getValues("anioEscolar") || currentYear}`,
        institucionId: institucionId || "",
      });
    }
  }, [open, existingCount, institucionId, currentYear, form]);

  const onSubmit = (values: any) => {
    startTransition(async () => {
      // Envía tanto formato plano como anidado (soportado por el servidor)
      const res = await upsertPeriodoAction(values);
      if (res.success) {
        toast.success(res.success);
        form.reset({
          ...form.getValues(),
          nombre: "",
          numero: (form.getValues().numero as number) + 1,
        });
        setOpen(false);
      } else if (res.error) {
        toast.error(res.error);
      }
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
            className="rounded-xl h-9 text-xs font-bold border-border/60 bg-card cursor-pointer shadow-2xs"
          >
            <IconPlus className="mr-1.5 size-3.5" />
            <span>Agregar Periodo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[220px] text-pretty text-xs">
          Configura un nuevo periodo académico (Bimestre, Trimestre, etc.) para el año escolar.
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Nuevo Periodo Académico"
        description="Define la estructura temporal del año escolar para registrar evaluaciones y calificaciones."
        isOpen={open}
        onOpenChange={setOpen}
        className="w-full max-w-md"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      placeholder="Ej: III Bimestre - 2026"
                      {...field}
                      className="rounded-xl text-xs h-9 bg-background border-border/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground/80">
                      Tipo
                    </FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        const num = form.getValues("numero") || 1;
                        const r = ROMAN_NUMERALS[num] || `${num}`;
                        const label =
                          val === "BIMESTRE"
                            ? "Bimestre"
                            : val === "TRIMESTRE"
                            ? "Trimestre"
                            : val === "SEMESTRE"
                            ? "Semestre"
                            : "Periodo";
                        form.setValue("nombre", `${r} ${label} - ${form.getValues("anioEscolar")}`);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-xl text-xs h-9 border-border/50">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl border-border/50">
                        <SelectItem value="BIMESTRE" className="text-xs">Bimestre</SelectItem>
                        <SelectItem value="TRIMESTRE" className="text-xs">Trimestre</SelectItem>
                        <SelectItem value="SEMESTRE" className="text-xs">Semestre</SelectItem>
                        <SelectItem value="ANUAL" className="text-xs">Anual</SelectItem>
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
                    <FormLabel className="text-xs font-bold text-foreground/80">
                      Número (1 al 6)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={6}
                        {...field}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10) || 1;
                          field.onChange(n);
                          const r = ROMAN_NUMERALS[n] || `${n}`;
                          const tipo = form.getValues("tipo");
                          const label =
                            tipo === "BIMESTRE"
                              ? "Bimestre"
                              : tipo === "TRIMESTRE"
                              ? "Trimestre"
                              : "Periodo";
                          form.setValue("nombre", `${r} ${label} - ${form.getValues("anioEscolar")}`);
                        }}
                        className="rounded-xl text-xs h-9 border-border/50"
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
                  <FormLabel className="text-xs font-bold text-foreground/80">
                    Año Escolar
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={2020}
                      max={2035}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value, 10) || currentYear)
                      }
                      className="rounded-xl text-xs h-9 border-border/50"
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

            <Button
              type="submit"
              className="w-full font-bold shadow-md rounded-xl text-xs h-9.5 mt-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Guardando..." : "Crear Periodo"}
            </Button>
          </form>
        </Form>
      </FormModal>
    </>
  );
}
