"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import {
  IconUser,
  IconId,
  IconPhone,
  IconCheck,
  IconLoader2,
  IconDeviceFloppy,
  IconSearch,
  IconMail,
} from "@tabler/icons-react";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { upsertFamilyMemberAction } from "@/actions/family";
import { getGuardianByDniAction } from "@/actions/students";
import { PARENTESCO_OPTIONS } from "@/lib/constants";
import { useFormModal } from "@/components/modals/form-modal-context";

const familySchema = z.object({
  dni: z.string().min(8, "DNI debe tener 8 caracteres"),
  name: z.string().min(2, "Nombre es requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno es requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno es requerido"),
  telefono: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  parentesco: z.string().min(1, "Seleccione parentesco"),
  contactoPrimario: z.boolean(),
  autorizadoRecoger: z.boolean(),
  viveCon: z.boolean(),
});

type FamilyValues = z.infer<typeof familySchema>;

interface FamilyMemberFormProps {
  studentId: string;
  relationId?: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function FamilyMemberForm({
  studentId,
  relationId,
  initialData,
  onSuccess,
}: FamilyMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<FamilyValues>({
    resolver: zodResolver(familySchema),
    defaultValues: initialData
      ? {
          dni: initialData.padreTutor?.dni || "",
          name: initialData.padreTutor?.name || "",
          apellidoPaterno: initialData.padreTutor?.apellidoPaterno || "",
          apellidoMaterno: initialData.padreTutor?.apellidoMaterno || "",
          telefono: initialData.padreTutor?.telefono || "",
          email: initialData.padreTutor?.email || "",
          parentesco: initialData.parentesco || "",
          contactoPrimario: initialData.contactoPrimario || false,
          autorizadoRecoger: initialData.autorizadoRecoger ?? true,
          viveCon: initialData.viveCon ?? true,
        }
      : {
          dni: "",
          name: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          telefono: "",
          email: "",
          parentesco: "",
          contactoPrimario: false,
          autorizadoRecoger: true,
          viveCon: true,
        },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const dni = form.watch("dni");

  useEffect(() => {
    if (dni && dni.length === 8 && !initialData) {
      const searchGuardian = async () => {
        try {
          const res = await getGuardianByDniAction(dni);
          if (res?.data) {
            let n = res.data.name || "";
            let ap = res.data.apellidoPaterno || "";
            let am = res.data.apellidoMaterno || "";

            // Si los apellidos están vacíos pero el nombre tiene varias palabras,
            // intentamos dividirlo para el usuario (UX helper)
            if (!ap && !am && n.trim().split(/\s+/).length >= 2) {
              const parts = n.trim().split(/\s+/);
              if (parts.length === 2) {
                n = parts[0];
                ap = parts[1];
              } else if (parts.length >= 3) {
                am = parts.pop() || "";
                ap = parts.pop() || "";
                n = parts.join(" ");
              }
            }

            form.setValue("name", n, { shouldValidate: true });
            form.setValue("apellidoPaterno", ap, { shouldValidate: true });
            form.setValue("apellidoMaterno", am, { shouldValidate: true });
            form.setValue("telefono", res.data.telefono || "", {
              shouldValidate: true,
            });
            form.setValue("email", res.data.email || "", {
              shouldValidate: true,
            });
            toast.success("Usuario encontrado, datos cargados.");
          }
        } catch (error) {
          console.error("Error searching guardian:", error);
        }
      };
      searchGuardian();
    }
  }, [dni, form, initialData]);

  const onSubmit = (values: FamilyValues) => {
    startTransition(async () => {
      const res = await upsertFamilyMemberAction(studentId, values, relationId);
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess?.();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  DNI / Documento
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="00000000"
                      className="pl-10 bg-muted/5 border-border/40 rounded-full"
                      maxLength={8}
                      disabled={!!initialData}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentesco"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Parentesco
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-muted/5 border-border/40 rounded-full w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PARENTESCO_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Nombres
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nombres"
                    className="bg-muted/5 border-border/40 rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellidoPaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Ap. Paterno
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Paterno"
                    className="bg-muted/5 border-border/40 rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apellidoMaterno"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Ap. Materno
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Materno"
                    className="bg-muted/5 border-border/40 rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Teléfono
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder="999000111"
                      className="pl-10 bg-muted/5 border-border/40 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold tracking-wider text-muted-foreground/70 ml-1">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="pl-10 bg-muted/5 border-border/40 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 pt-2">
          <FormField
            control={form.control}
            name="contactoPrimario"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border/40 p-3 bg-muted/5">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-bold">
                    Contacto Primario
                  </FormLabel>
                  <FormDescription className="text-[11px]">
                    ¿Es la persona principal de contacto?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="autorizadoRecoger"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-full border border-border/40 p-3 bg-muted/5">
                  <FormLabel className="text-xs font-bold">
                    Autorizado a Recoger
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="viveCon"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-full border border-border/40 p-3 bg-muted/5">
                  <FormLabel className="text-xs font-bold">
                    Vive con el Alumno
                  </FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full sm:w-auto rounded-full px-8"
          >
            {isPending ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <>
                <IconDeviceFloppy className="size-4 mr-2" />
                Guardar Familiar
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
