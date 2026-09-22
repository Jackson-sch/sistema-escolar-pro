"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import * as z from "zod";
import {
  IconFileText,
  IconCategory,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createIncidentCategoryAction } from "@/actions/discipline";

const categorySchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSuccess?: (category: any) => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  });

  const onSubmit = (values: CategoryValues) => {
    startTransition(async () => {
      const res = await createIncidentCategoryAction(values);
      if (res.error) {
        toast.error(res.error);
      }
      if (res.success) {
        toast.success(res.success);
        onSuccess?.(res.data);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">
                Nombre de la Categoría
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconCategory className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="Ej. Seguimiento Académico / Conductual"
                    className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-background"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">
                Descripción (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconFileText className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                  <Textarea
                    {...field}
                    placeholder="Breve descripción del propósito de esta categoría..."
                    rows={3}
                    className="pl-9 text-xs rounded-xl border-border/60 bg-background resize-none"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            disabled={isPending}
            type="submit"
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
          >
            {isPending ? (
              <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <IconDeviceFloppy className="mr-1.5 size-3.5" />
            )}
            Guardar Categoría
          </Button>
        </div>
      </form>
    </Form>
  );
}
