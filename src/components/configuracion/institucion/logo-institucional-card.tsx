"use client";

import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type InstitucionFormControl } from "./types";
import { Button } from "@/components/ui/button";
import { IconPhoto } from "@tabler/icons-react";

interface LogoInstitucionalCardProps {
  control: InstitucionFormControl;
  disabled?: boolean;
}

export function LogoInstitucionalCard({
  control,
  disabled,
}: LogoInstitucionalCardProps) {
  return (
    <Card className="rounded-2xl border-border/60 p-4 sm:p-5 flex flex-col justify-between h-full bg-card shadow-xs">
      <div className="flex items-center gap-3 mb-2">
        <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <IconPhoto className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            Logo Institucional
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Identidad visual y escudo oficial.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2">
        <FormField
          control={control}
          name="logo"
          render={({ field }) => (
            <FormItem className="w-full flex flex-col items-center justify-center">
              <FormLabel className="sr-only">Logo Institucional</FormLabel>
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
        type="button"
        variant="outline"
        className="w-full rounded-xl border-border/60 text-xs font-bold h-9 cursor-pointer hover:bg-muted/40"
        onClick={() =>
          document
            .querySelector<HTMLInputElement>('input[type="file"]')
            ?.click()
        }
        disabled={disabled}
      >
        Cambiar Escudo / Logo
      </Button>
    </Card>
  );
}
