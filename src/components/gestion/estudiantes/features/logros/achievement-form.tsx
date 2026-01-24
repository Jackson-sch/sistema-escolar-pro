"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  IconTrophy,
  IconCalendar,
  IconBookmark,
  IconBuildingCommunity,
  IconFileDescription,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  achievementSchema,
  AchievementValues,
} from "@/lib/validations/achievement";
import { createAchievementAction } from "@/actions/achievement";

interface AchievementFormProps {
  studentId: string;
  onSuccess?: () => void;
}

export function AchievementForm({
  studentId,
  onSuccess,
}: AchievementFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<AchievementValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      //@ts-ignore
      fecha: new Date(),
      categoria: "ACADEMICO",
      institucion: "",
      adjunto: "",
    },
  });

  const onSubmit = (values: AchievementValues) => {
    startTransition(async () => {
      try {
        const res = await createAchievementAction(studentId, values);
        if (res.success) {
          toast.success(res.success);
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      } catch (error) {
        toast.error("Error al guardar el logro");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                TÍTULO DEL LOGRO
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconTrophy className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-amber-500" />
                  <Input
                    {...field}
                    placeholder="Ej. Primer puesto en Matemáticas"
                    className="pl-10 bg-muted/5 border-border/40 rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  CATEGORÍA
                </FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-muted/5 border-border/40 rounded-xl h-11">
                      <div className="flex items-center gap-2">
                        <IconBookmark className="size-4 text-violet-500" />
                        <SelectValue placeholder="Seleccionar" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 bg-popover/95 backdrop-blur-xl">
                    <SelectItem value="ACADEMICO">Académico</SelectItem>
                    <SelectItem value="DEPORTIVO">Deportivo</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="VALORES">Valores</SelectItem>
                    <SelectItem value="OTROS">Otros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1 mb-2">
                  FECHA
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-11 bg-muted/5 border-border/40 rounded-xl hover:bg-muted/10",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <IconCalendar className="mr-2 h-4 w-4 text-blue-500" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-border/40"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="institucion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                INSTITUCIÓN / ORGANIZADOR
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconBuildingCommunity className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                  <Input
                    {...field}
                    placeholder="Ej. Ministerio de Educación"
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
                DESCRIPCIÓN ADICIONAL
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconFileDescription className="absolute left-3 top-3 size-4 text-muted-foreground/50" />
                  <Textarea
                    {...field}
                    placeholder="Detalles sobre el logro..."
                    className="pl-10 min-h-[100px] bg-muted/5 border-border/40 rounded-xl resize-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            disabled={isPending}
            type="submit"
            className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 h-11"
          >
            {isPending ? (
              <IconLoader2 className="animate-spin mr-2" />
            ) : (
              <IconDeviceFloppy className="mr-2 size-4" />
            )}
            Guardar Logro
          </Button>
        </div>
      </form>
    </Form>
  );
}
