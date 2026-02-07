"use client";

import { MagicCard } from "@/components/ui/magic-card";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { type InstitucionFormControl } from "./types";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface LogoInstitucionalCardProps {
  control: InstitucionFormControl;
  disabled?: boolean;
}

export function LogoInstitucionalCard({
  control,
  disabled,
}: LogoInstitucionalCardProps) {
  // We use a ref to try to trigger the file input of the ImageUpload if possible,
  // but since ImageUpload encapsulates its input, we mainly perform layout here.
  // The functionality relies on ImageUpload inner logic.

  return (
    <MagicCard className="rounded-2xl p-6 bg-card/30 border-border/40 overflow-hidden flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-bold text-foreground">
          Logo Institucional
        </h3>
        <p className="text-xs text-muted-foreground/80">
          Identidad visual de la plataforma.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
        {/* Dashed container background effect is handled by ImageUpload */}
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem className="w-full flex justify-center">
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={(url) => field.onChange(url)}
                  onRemove={() => field.onChange("")}
                  disabled={disabled}
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Button
        variant="ghost"
        className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs h-10 transition-all active:scale-95"
        // This button is decorative/secondary call to action, mainly relying on ImageUpload's click area
        // In a real scenario we might pass a ref to ImageUpload to trigger click from here
        onClick={() =>
          document
            .querySelector<HTMLInputElement>('input[type="file"]')
            ?.click()
        }
        disabled={disabled}
      >
        Cambiar Logo
      </Button>
    </MagicCard>
  );
}
