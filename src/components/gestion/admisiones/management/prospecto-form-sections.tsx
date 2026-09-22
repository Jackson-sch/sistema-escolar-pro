"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconId,
  IconSchool,
  IconCalendar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";

const inputClass =
  "rounded-xl border-border/40 bg-background pl-9 h-9 text-xs transition-shadow focus-visible:ring-primary/25";
const labelClass =
  "text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1";

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

interface ProspectoPersonalFieldsProps {
  form: UseFormReturn<any>;
}

export function ProspectoPersonalFields({ form }: ProspectoPersonalFieldsProps) {
  return (
    <>
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

      <Section title="Datos del Estudiante">
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
    </>
  );
}

interface ProspectoApplicationSectionProps {
  form: UseFormReturn<any>;
  nivelesDisponibles: string[];
  selectedNivel: string;
  onNivelChange: (nivel: string) => void;
  filteredGrados: any[];
}

export function ProspectoApplicationSection({
  form,
  nivelesDisponibles,
  selectedNivel,
  onNivelChange,
  filteredGrados,
}: ProspectoApplicationSectionProps) {
  return (
    <Section title="Postulación">
      <LevelSegmentedControl
        levels={nivelesDisponibles}
        value={selectedNivel}
        onChange={onNivelChange}
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
  );
}
