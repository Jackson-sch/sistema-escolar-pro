"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useForm, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  IconCheck,
  IconSelector,
  IconPlus,
} from "@tabler/icons-react";
import {
  Form,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { upsertSeccionAction } from "@/actions/academic-structure";
import { colors, TURNO_OPTIONS } from "@/lib/constants";
import { useFormModal } from "@/components/modals/form-modal-context";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";

const formSchema = z.object({
  seccion: z.string().min(1, "La sección es requerida"),
  gradoId: z.string().min(1, "El grado es requerido"),
  tutorId: z.string().optional().nullable().or(z.literal("")),
  sedeId: z.string().optional().nullable().or(z.literal("")),
  capacidad: z.string().min(1, "La capacidad es requerida"),
  aulaAsignada: z.string().optional().nullable().or(z.literal("")),
  color: z.string().optional().nullable().or(z.literal("")),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"]),
  anioAcademico: z.string().min(4, "Año inválido"),
  institucionId: z.string().min(1),
});

type SeccionFormValues = z.infer<typeof formSchema>;

interface SeccionFormProps {
  initialData?: any;
  grados: { id: string; nombre: string; nivel: { nombre: string } }[];
  tutores: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  }[];
  sedes: {
    id: string;
    nombre: string;
  }[];
  institucionId: string;
  currentAnio?: number;
  onSuccess?: () => void;
}

export function SeccionForm({
  initialData,
  grados,
  tutores,
  sedes,
  institucionId,
  currentAnio,
  onSuccess,
}: SeccionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  // Derive unique niveles from grados
  const niveles = useMemo(
    () => Array.from(new Set(grados.map((g) => g.nivel.nombre))),
    [grados],
  );

  // Resolve initial nivel from initialData or default to first
  const initialNivel = useMemo(() => {
    if (initialData?.gradoId) {
      const match = grados.find((g) => g.id === initialData.gradoId);
      if (match) return match.nivel.nombre;
    }
    return niveles[0] || "";
  }, [initialData, grados, niveles]);

  const [selectedNivel, setSelectedNivel] = useState(initialNivel);

  // Filtered grados based on selected nivel
  const filteredGrados = useMemo(
    () => grados.filter((g) => g.nivel.nombre === selectedNivel),
    [grados, selectedNivel],
  );
  const form = useForm<SeccionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData?.id || initialData?.seccion
      ? {
          seccion: initialData.seccion,
          gradoId: initialData.gradoId,
          tutorId: initialData.tutorId || "",
          sedeId: initialData.sedeId || "",
          capacidad: String(initialData.capacidad),
          aulaAsignada: initialData.aulaAsignada || "",
          color: initialData.color || "",
          turno: initialData.turno,
          anioAcademico: String(initialData.anioAcademico),
          institucionId: initialData.institucionId,
        }
      : {
          seccion: "",
          gradoId: initialData?.gradoId || "",
          tutorId: "",
          sedeId: sedes[0]?.id || "",
          capacidad: "30",
          aulaAsignada: "",
          color: colors[0],
          turno: "MANANA",
          anioAcademico: String(currentAnio || new Date().getFullYear()),
          institucionId: institucionId,
        },
  });

  const { isDirty } = form.formState;
  const watchedAnio = form.watch("anioAcademico");
  const [tutorOpen, setTutorOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // When nivel changes, reset gradoId if the current one doesn't belong to the new nivel
  const handleNivelChange = (nivel: string) => {
    setSelectedNivel(nivel);
    const currentGradoId = form.getValues("gradoId");
    const gradoBelongsToNivel = grados.find(
      (g) => g.id === currentGradoId && g.nivel.nombre === nivel,
    );
    if (!gradoBelongsToNivel) {
      form.setValue("gradoId", "", { shouldDirty: true });
    }
  };

  const onSubmit = (values: SeccionFormValues) => {
    startTransition(async () => {
      const res = await upsertSeccionAction(
        {
          ...values,
          tutorId: values.tutorId === "none" ? null : values.tutorId || null,
          sedeId: values.sedeId === "none" ? null : values.sedeId || null,
          aulaAsignada: values.aulaAsignada || null,
          color: values.color || null,
          capacidad: parseInt(values.capacidad, 10),
          anioAcademico: parseInt(values.anioAcademico, 10),
        } as any,
        initialData?.id,
      );

      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        if (onSuccess) onSuccess();
      }
      if (res.error) toast.error(res.error);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* ── Nivel Segmented Control ── */}
        <LevelSegmentedControl
          levels={niveles}
          value={selectedNivel}
          onChange={handleNivelChange}
        />

        {/* ── Row 1: Grado + Sede ── */}
        <BasicRow
          control={form.control}
          filteredGrados={filteredGrados}
          sedes={sedes}
        />

        {/* ── Row 2: Sección + Año + Tutor ── */}
        <DetailsRow
          control={form.control}
          tutores={tutores}
          tutorOpen={tutorOpen}
          onTutorOpenChange={setTutorOpen}
        />

        {/* ── Row 3: Turno + Capacidad + Aula ── */}
        <ConfigRow control={form.control} />

        {/* ── Color ── */}
        <ColorField
          control={form.control}
          colorInputRef={colorInputRef}
        />

        {/* ── Info Banner ── */}
        <InfoBanner watchedAnio={watchedAnio} />

        {/* ── Actions ── */}
        <FormActions
          isPending={isPending}
          isEditing={!!initialData}
          onCancel={onSuccess}
        />
      </form>
    </Form>
  );
}

/* ─── Sub-components ─── */

/* Row 1: Grado + Sede */
function BasicRow({
  control,
  filteredGrados,
  sedes,
}: {
  control: Control<SeccionFormValues>;
  filteredGrados: { id: string; nombre: string }[];
  sedes: { id: string; nombre: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField<SeccionFormValues>
        control={control}
        name="gradoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grado</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="w-full rounded-full">
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {filteredGrados.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    No hay grados para este nivel
                  </div>
                ) : (
                  filteredGrados.map((grado) => (
                    <SelectItem key={grado.id} value={grado.id}>
                      {grado.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField<SeccionFormValues>
        control={control}
        name="sedeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Sede (Institución)</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger className="w-full rounded-full">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Sin sede específica</SelectItem>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/* Row 2: Sección + Año + Tutor (combobox) */
function DetailsRow({
  control,
  tutores,
  tutorOpen,
  onTutorOpenChange,
}: {
  control: Control<SeccionFormValues>;
  tutores: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  }[];
  tutorOpen: boolean;
  onTutorOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-4">
      <FormField<SeccionFormValues>
        control={control}
        name="seccion"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-3">
            <FormLabel>Sección</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: A"
                {...field}
                value={field.value ?? ""}
                className="rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField<SeccionFormValues>
        control={control}
        name="anioAcademico"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-3">
            <FormLabel>Año Académico</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                value={field.value ?? ""}
                className="rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* ── Tutor (Combobox) ── */}
      <FormField<SeccionFormValues>
        control={control}
        name="tutorId"
        render={({ field }) => {
          const selectedTutor = tutores.find((t) => t.id === field.value);
          return (
            <FormItem className="col-span-2 sm:col-span-6 flex flex-col">
              <FormLabel>Tutor (Opcional)</FormLabel>
              <Popover open={tutorOpen} onOpenChange={onTutorOpenChange}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tutorOpen}
                      className={cn(
                        "w-full justify-between rounded-full font-normal capitalize",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {selectedTutor
                        ? `${selectedTutor.apellidoPaterno} ${selectedTutor.apellidoMaterno}, ${selectedTutor.name}`
                        : "Buscar tutor..."}
                      <IconSelector className="ml-auto size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Buscar por nombre..." />
                    <CommandList>
                      <CommandEmpty>
                        No se encontraron tutores.
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="sin-tutor"
                          onSelect={() => {
                            field.onChange("none");
                            onTutorOpenChange(false);
                          }}
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-4",
                              field.value === "none" || !field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          Sin tutor
                        </CommandItem>
                        {tutores.map((tutor) => {
                          const fullName = `${tutor.apellidoPaterno} ${tutor.apellidoMaterno}, ${tutor.name}`;
                          return (
                            <CommandItem
                              key={tutor.id}
                              value={fullName}
                              onSelect={() => {
                                field.onChange(tutor.id);
                                onTutorOpenChange(false);
                              }}
                              className="capitalize"
                            >
                              <IconCheck
                                className={cn(
                                  "mr-2 size-4",
                                  field.value === tutor.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {fullName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}

/* Row 3: Turno + Capacidad + Aula */
function ConfigRow({
  control,
}: {
  control: Control<SeccionFormValues>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-4">
      <FormField<SeccionFormValues>
        control={control}
        name="turno"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-4">
            <FormLabel>Turno</FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value ?? ""}
            >
              <FormControl>
                <SelectTrigger className="w-full rounded-full">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TURNO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField<SeccionFormValues>
        control={control}
        name="capacidad"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-4">
            <FormLabel>Capacidad</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? ""}
                className="rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* ── Aula ── */}
      <FormField<SeccionFormValues>
        control={control}
        name="aulaAsignada"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-4">
            <FormLabel>Aula (Opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Aula 101"
                {...field}
                value={field.value ?? ""}
                className="rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/* Selector de color + color personalizado */
function ColorField({
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
          <FormLabel>Color (Opcional)</FormLabel>
          <FormControl>
            <div className="flex flex-wrap gap-2 items-center">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() =>
                    field.onChange(field.value === color ? "" : color)
                  }
                  className={cn(
                    "size-8 rounded-full border-2 transition-[border-color,box-shadow,transform] duration-200 flex items-center justify-center",
                    field.value === color
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-transparent hover:scale-105 hover:border-border",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {field.value === color && (
                    <IconCheck className="size-4 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
              {/* Custom color picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    "size-8 rounded-full border-2 border-dashed transition-[border-color,box-shadow,transform] duration-200 flex items-center justify-center",
                    field.value && !colors.includes(field.value)
                      ? "border-foreground scale-110 shadow-lg"
                      : "border-muted-foreground/40 hover:border-foreground/60 hover:scale-105",
                  )}
                  style={{
                    backgroundColor:
                      field.value && !colors.includes(field.value)
                        ? field.value
                        : undefined,
                  }}
                >
                  {field.value && !colors.includes(field.value) ? (
                    <IconCheck className="size-4 text-white drop-shadow-md" />
                  ) : (
                    <IconPlus className="size-4 text-muted-foreground" />
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/* Banner informativo */
function InfoBanner({ watchedAnio }: { watchedAnio: string }) {
  return (
    <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-3">
      <div className="size-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <span className="text-primary text-xs">i</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Esta sección será creada para el{" "}
        <span className="text-foreground font-semibold">
          Año Académico {watchedAnio || new Date().getFullYear()}
        </span>
        . Podrás matricular alumnos inmediatamente después de guardar.
      </p>
    </div>
  );
}

/* Acciones */
function FormActions({
  isPending,
  isEditing,
  onCancel,
}: {
  isPending: boolean;
  isEditing: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/30">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50 hover:scale-105"
        disabled={isPending}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        className="w-full sm:w-auto rounded-full px-8 hover:scale-105"
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
