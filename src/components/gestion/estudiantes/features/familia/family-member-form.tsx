"use client";

import { useForm } from "react-hook-form";
import type { Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useState, useRef } from "react";
import {
  IconId,
  IconPhone,
  IconLoader2,
  IconDeviceFloppy,
  IconMail,
  IconSparkles,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import * as z from "zod";

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
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const familySchema = z.object({
  dni: z.string().min(8, "DNI debe tener 8 caracteres"),
  name: z.string().min(2, "Nombre es requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno es requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno es requerido"),
  telefono: z.string().optional(),
  email: z.email("Email inválido").optional().or(z.literal("")),
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

// ─── Subcomponentes presentacionales ─────────────────────────────────────────

interface FormSectionHeaderProps {
  icon: typeof IconUser;
  iconClassName: string;
  title: string;
  description: string;
  badge?: React.ReactNode;
}

function FormSectionHeader({
  icon: Icon,
  iconClassName,
  title,
  description,
  badge,
}: FormSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-2.5 border-b border-border/30">
      <div className="flex items-center gap-2.5">
        <div
          className={`size-8 rounded-xl border flex items-center justify-center shrink-0 ${iconClassName}`}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      {badge}
    </div>
  );
}

function IdentificacionSection({
  control,
  isAutofilled,
  readOnlyDni,
}: {
  control: Control<FamilyValues>;
  isAutofilled: boolean;
  readOnlyDni: boolean;
}) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={IconUser}
        iconClassName="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Identificación y Contacto"
        description="Datos de identidad, parentesco e información de comunicación."
        badge={
          isAutofilled && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold gap-1 rounded-md px-2 py-0.5">
              <IconSparkles className="size-3" />
              Cargado por DNI
            </Badge>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                DNI / Documento Identidad
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconId className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="01234567"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                    maxLength={8}
                    disabled={readOnlyDni}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="parentesco"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Parentesco con el Alumno
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar parentesco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {PARENTESCO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombres
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Juan Alberto"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="apellidoPaterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Paterno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Pérez"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="apellidoMaterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Materno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="García"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Teléfono / WhatsApp
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="987 654 321"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Correo Electrónico (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="familiar@ejemplo.com"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function PermisosSection({ control }: { control: Control<FamilyValues> }) {
  return (
    <div className="space-y-4 pt-2">
      <FormSectionHeader
        icon={IconShieldCheck}
        iconClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="2. Configuración de Permisos y Convivencia"
        description="Designación de contacto primario, entrega escolar y residencia."
      />

      <div className="space-y-3">
        <FormField
          control={control}
          name="contactoPrimario"
          render={({ field }) => (
            <FormItem>
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                  field.value
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-background border-border/40 hover:bg-muted/40",
                )}
              >
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      field.value
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-foreground",
                    )}
                  >
                    Contacto Primario de la Institución
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Recibirá notificaciones prioritarias, comunicados y citaciones.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </label>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            control={control}
            name="autorizadoRecoger"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      Autorizado a Recoger
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Retiro del alumno en puerta
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </label>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="viveCon"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-foreground",
                      )}
                    >
                      Vive con el Alumno
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Residencia compartida
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </label>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export function FamilyMemberForm({
  studentId,
  relationId,
  initialData,
  onSuccess,
}: FamilyMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [isAutofilled, setIsAutofilled] = useState(false);

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

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // Observar cambios en el DNI para auto-completar datos existentes
  const dni = form.watch("dni");

  useEffect(() => {
    let ignore = false;
    if (!initialData && dni && dni.length === 8) {
      const searchGuardian = async () => {
        try {
          if (ignore) return;
          const res = await getGuardianByDniAction(dni);
          if (ignore) return;
          if (res?.data) {
            form.setValue("name", res.data.name || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("apellidoPaterno", res.data.apellidoPaterno || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("apellidoMaterno", res.data.apellidoMaterno || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("telefono", res.data.telefono || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("email", res.data.email || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            setIsAutofilled(true);
            toast.success("Familiar registrado previamente. Datos cargados.");
          } else {
            if (!ignore) setIsAutofilled(false);
          }
        } catch (error) {
          console.error("Error searching guardian:", error);
          if (!ignore) setIsAutofilled(false);
        }
      };
      searchGuardian();
    } else if (!initialData && !dni) {
      setIsAutofilled(false);
      form.setValue("name", "");
      form.setValue("apellidoPaterno", "");
      form.setValue("apellidoMaterno", "");
      form.setValue("telefono", "");
      form.setValue("email", "");
    }
    return () => {
      ignore = true;
    };
  }, [dni, form, initialData]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-1">
        <IdentificacionSection
          control={form.control}
          isAutofilled={isAutofilled}
          readOnlyDni={!!initialData}
        />

        <PermisosSection control={form.control} />

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          {onSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            disabled={isPending}
            type="submit"
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Guardar Familiar</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
