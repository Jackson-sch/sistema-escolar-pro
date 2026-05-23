"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDiscount2 } from "@tabler/icons-react";
import { UseFormReturn } from "react-hook-form";
import { EnrollmentValues } from "@/lib/schemas/enrollment";

const BECA_DISCOUNTS: Record<string, string> = {
  socioeconomica: "20%",
  excelencia: "50%",
  deportiva: "30%",
  hermandad: "15%",
};

interface EnrollmentBenefitsProps {
  form: UseFormReturn<EnrollmentValues>;
}

export function EnrollmentBenefits({ form }: EnrollmentBenefitsProps) {
  const tipoBeca = form.watch("tipoBeca");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-pink-500/5 via-transparent to-transparent p-4 transition-all hover:border-pink-500/10">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 ring-1 ring-inset ring-pink-500/20">
          <IconDiscount2 className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold tracking-widest text-foreground/90">
            Becas y Descuentos
          </h3>
          <p className="text-xs text-muted-foreground">
            Beneficios económicos
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="tipoBeca"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo de Beca
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full rounded-2xl border-white/5 bg-black/20 font-medium transition-all hover:bg-black/30">
                    <SelectValue placeholder="Seleccione beca" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="border-white/10 backdrop-blur-xl">
                  <SelectItem value="ninguna">Sin Beca</SelectItem>
                  <SelectItem value="socioeconomica">
                    Socioeconómica (20%)
                  </SelectItem>
                  <SelectItem value="excelencia">
                    Excelencia Académica (50%)
                  </SelectItem>
                  <SelectItem value="deportiva">
                    Talento Deportivo (30%)
                  </SelectItem>
                  <SelectItem value="hermandad">Hermandad (15%)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {tipoBeca && tipoBeca !== "ninguna" && (
          <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-pink-300">
                Descuento Aplicado
              </span>
              <span className="text-sm font-bold text-pink-400">
                {BECA_DISCOUNTS[tipoBeca] || "0%"}
              </span>
            </div>
            <p className="text-[9px] text-pink-400/50 leading-tight uppercase font-bold tracking-widest">
              * El beneficio se aplicará automáticamente a todas las cuotas del
              año lectivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
