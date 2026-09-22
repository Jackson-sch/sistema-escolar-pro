"use client";

import { Control } from "react-hook-form";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/constants";
import { SeccionFormValues } from "./seccion-form-types";

export function ColorField({
  control,
  colorInputRef,
}: {
  control: Control<SeccionFormValues>;
  colorInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <FormField<SeccionFormValues>
      control={control}
      name="color"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs font-bold text-foreground">
            Color de Identificación
          </FormLabel>
          <FormControl>
            <div className="flex flex-wrap gap-2 items-center pt-0.5">
              {colors.slice(0, 8).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    field.onChange(field.value === color ? "" : color)
                  }
                  className={cn(
                    "size-6 rounded-lg border transition-all cursor-pointer flex items-center justify-center",
                    field.value === color
                      ? "ring-2 ring-offset-1 ring-primary scale-110 shadow-xs"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {field.value === color && (
                    <IconCheck className="size-3 text-white drop-shadow-xs" />
                  )}
                </button>
              ))}
              {/* Custom color picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    "size-6 rounded-lg border-2 border-dashed transition-all flex items-center justify-center cursor-pointer",
                    field.value && !colors.includes(field.value)
                      ? "ring-2 ring-offset-1 ring-primary scale-110 shadow-xs"
                      : "border-muted-foreground/40 hover:border-foreground/60",
                  )}
                  style={{
                    backgroundColor:
                      field.value && !colors.includes(field.value)
                        ? field.value
                        : undefined,
                  }}
                >
                  {field.value && !colors.includes(field.value) ? (
                    <IconCheck className="size-3 text-white drop-shadow-xs" />
                  ) : (
                    <IconPlus className="size-3 text-muted-foreground" />
                  )}
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  className="sr-only"
                  value={field.value || "#3B82F6"}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </div>
            </div>
          </FormControl>
          <FormMessage className="text-xxs" />
        </FormItem>
      )}
    />
  );
}

export function InfoBanner({ watchedAnio }: { watchedAnio: string }) {
  return (
    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-2.5">
      <div className="size-4 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <span className="text-primary text-[10px] font-bold">i</span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Esta sección se registrará para el{" "}
        <strong className="text-foreground">
          Año Académico {watchedAnio || new Date().getFullYear()}
        </strong>
        . Podrás registrar matrículas y asignar horarios inmediatamente.
      </p>
    </div>
  );
}

export function FormActions({
  isPending,
  isEditing,
  onCancel,
}: {
  isPending: boolean;
  isEditing: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
        disabled={isPending}
      >
        {isPending
          ? "Guardando..."
          : isEditing
            ? "Guardar Cambios"
            : "Crear Sección"}
      </Button>
    </div>
  );
}
