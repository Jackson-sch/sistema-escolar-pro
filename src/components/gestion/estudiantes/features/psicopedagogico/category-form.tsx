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
              <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                Nombre de la Categoría
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconCategory className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="Ej. Seguimiento Académico"
                    className="pl-10 bg-muted/5 border-border/40 rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                Descripción (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconFileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    {...field}
                    placeholder="Breve descripción del propósito de esta categoría..."
                    className="pl-10 min-h-24 bg-muted/5 border-border/40 rounded-xl resize-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={isPending}
          type="submit"
          className="w-full rounded-full"
        >
          {isPending ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <>
              <IconDeviceFloppy className="mr-2" /> Guardar Categoría
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
