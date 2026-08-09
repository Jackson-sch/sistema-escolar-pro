"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { upsertProspectoAction } from "@/actions/admissions";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";
import { OCRButton } from "@/components/gestion/admisiones/components/ocr-button";
import { prospectoSchema } from "@/lib/schemas/gestion/admision/prospectoSchema";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconId,
  IconSchool,
  IconCalendar,
  IconScan,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface ProspectoFormProps {
  grados: any[];
  instituciones: any[];
  onSuccess: () => void;
  initialData?: any;
  id?: string;
}

// ── Shared styles (EduNova Pro) ───────────────────────────────────────────────
const inputClass =
  "rounded-xl border-border/40 bg-background pl-9 h-9 text-xs transition-shadow focus-visible:ring-primary/25";
const labelClass =
  "text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1";

// ── Field wrapper with leading icon ──────────────────────────────────────────
function FieldIcon({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50 pointer-events-none z-10" />
      {children}
    </div>
  );
}

// ── Section divider ───────────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
        <span className="h-px flex-1 bg-border/30" />
        {title}
        <span className="h-px flex-1 bg-border/30" />
      </p>
      {children}
    </div>
  );
}

export function ProspectoForm({
  grados,
  instituciones,
  onSuccess,
  initialData,
  id,
}: ProspectoFormProps) {
  const [loading, setLoading] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<z.infer<typeof prospectoSchema>>({
    resolver: zodResolver(prospectoSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      apellidoPaterno: initialData?.apellidoPaterno || "",
      apellidoMaterno: initialData?.apellidoMaterno || "",
      dni: initialData?.dni || "",
      email: initialData?.email || "",
      telefono: initialData?.telefono || "",
      direccion: initialData?.direccion || "",
      gradoInteresId: initialData?.gradoInteresId || "",
      anioPostulacion:
        initialData?.anioPostulacion || new Date().getFullYear() + 1,
      institucionId: initialData?.institucionId || instituciones[0]?.id || "",
    },
  });

  // ── Hierarchical Level Selection ───────────────────────────────────────────
  
  // Derive unique levels from fixed list or from data
  const nivelesDisponibles = useMemo(() => {
    return Array.from(new Set(grados.map((g) => g.nivel.nombre))).sort();
  }, [grados]);

  // Determine initial level based on initial data or default to first available
  const initialNivel = useMemo(() => {
    if (initialData?.gradoInteresId) {
      const match = grados.find((g) => g.id === initialData.gradoInteresId);
      if (match) return match.nivel.nombre;
    }
    return nivelesDisponibles[0] || "";
  }, [initialData, grados, nivelesDisponibles]);

  const [selectedNivel, setSelectedNivel] = useState(initialNivel);

  // Filtered grades based on level
  const filteredGrados = useMemo(() => {
    return grados.filter((g) => g.nivel.nombre === selectedNivel);
  }, [grados, selectedNivel]);

  // When level changes, reset grade if it's not in the new level
  const handleNivelChange = (nivel: string) => {
    setSelectedNivel(nivel);
    const currentGradoId = form.getValues("gradoInteresId");
    const belongsToNewLevel = grados.find(
      (g) => g.id === currentGradoId && g.nivel.nombre === nivel
    );
    if (!belongsToNewLevel) {
      form.setValue("gradoInteresId", "", { shouldDirty: true });
    }
  };

  const onSubmit = async (values: z.infer<typeof prospectoSchema>) => {
    setLoading(true);
    try {
      const res = await upsertProspectoAction({ values, id });
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
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

  const handleOCRComplete = (data: any) => {
    if (data.dni) form.setValue("dni", data.dni);
    if (data.nombre) form.setValue("nombre", data.nombre);
    if (data.apellidoPaterno) form.setValue("apellidoPaterno", data.apellidoPaterno);
    if (data.apellidoMaterno) form.setValue("apellidoMaterno", data.apellidoMaterno);
    if (data.direccion) form.setValue("direccion", data.direccion);
    toast.info("Formulario actualizado con los datos del DNI");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* ── OCR Banner ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <IconScan className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Registro automático con OCR
              </p>
              <p className="text-[10px] text-muted-foreground">
                Escanea el DNI para rellenar los datos del postulante
              </p>
            </div>
          </div>
          <OCRButton onScanComplete={handleOCRComplete} />
        </div>

        {/* ── Identificación ─────────────────────────────────────────────── */}
        <Section title="Identificación">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>DNI</FormLabel>
                  <FormControl>
                    <FieldIcon icon={IconId}>
                      <Input
                        placeholder="00000000"
                        {...field}
                        className={inputClass}
                        maxLength={8}
                      />
                    </FieldIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Teléfono</FormLabel>
                  <FormControl>
                    <FieldIcon icon={IconPhone}>
                      <Input
                        placeholder="987 654 321"
                        {...field}
                        className={inputClass}
                      />
                    </FieldIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* ── Datos del Estudiante ───────────────────────────────────────── */}
        <Section title="Datos del Estudiante">
          {/* Nombres en una sola fila */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Nombres</FormLabel>
                <FormControl>
                  <FieldIcon icon={IconUser}>
                    <Input
                      placeholder="Nombres completos"
                      {...field}
                      className={inputClass}
                    />
                  </FieldIcon>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Apellidos en dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Ap. Paterno</FormLabel>
                  <FormControl>
                    <FieldIcon icon={IconUser}>
                      <Input
                        placeholder="Primer apellido"
                        {...field}
                        className={inputClass}
                      />
                    </FieldIcon>
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
                  <FormLabel className={labelClass}>Ap. Materno</FormLabel>
                  <FormControl>
                    <FieldIcon icon={IconUser}>
                      <Input
                        placeholder="Segundo apellido"
                        {...field}
                        className={inputClass}
                      />
                    </FieldIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email de contacto</FormLabel>
                <FormControl>
                  <FieldIcon icon={IconMail}>
                    <Input
                      placeholder="correo@ejemplo.com"
                      {...field}
                      className={inputClass}
                    />
                  </FieldIcon>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* ── Postulación ────────────────────────────────────────────────── */}
        <Section title="Postulación">
          <LevelSegmentedControl
            levels={nivelesDisponibles}
            value={selectedNivel}
            onChange={handleNivelChange}
            className="mb-3"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="gradoInteresId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Grado de Interés</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "rounded-xl border-border/40 bg-background h-9 text-xs w-full",
                          "transition-shadow focus:ring-primary/25",
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <IconSchool className="size-3.5 shrink-0 text-muted-foreground/50" />
                          <SelectValue placeholder="Seleccione grado" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-border/50 bg-popover shadow-md rounded-xl">
                      {filteredGrados.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-muted-foreground italic">
                          No hay grados para este nivel
                        </div>
                      ) : (
                        filteredGrados.map((g) => (
                          <SelectItem key={g.id} value={g.id} className="text-xs rounded-lg">
                            {g.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="anioPostulacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Año de Postulación</FormLabel>
                  <FormControl>
                    <FieldIcon icon={IconCalendar}>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className={inputClass}
                      />
                    </FieldIcon>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Section>

        {/* ── Keyboard Shortcuts ───────────────────────────────────────────── */}
        <FormKeyboardHelpBar />

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[170px]"
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{id ? "Actualizar Prospecto" : "Guardar Prospecto"}</span>
              </>
            )}
          </Button>
        </div>

      </form>
    </Form>
  );
}