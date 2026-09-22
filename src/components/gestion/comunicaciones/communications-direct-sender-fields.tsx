"use client";

import {
  IconSearch,
  IconLoader2,
  IconUser,
  IconX,
  IconMail,
  IconMessage,
  IconBrandWhatsapp,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

interface StudentSearchSelectorProps {
  selectedStudent: any | null;
  onSelectStudent: (student: any) => void;
  onClearStudent: () => void;
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  searchResults: any[];
  searching: boolean;
}

export function StudentSearchSelector({
  selectedStudent,
  onSelectStudent,
  onClearStudent,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searching,
}: StudentSearchSelectorProps) {
  return (
    <div className="space-y-1.5 relative">
      <span className="text-xs font-medium text-foreground/80">
        Seleccionar Estudiante Destinatario
      </span>
      {selectedStudent ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2.5">
            <IconUser className="size-5 text-indigo-500" />
            <div>
              <div className="font-bold text-xs text-foreground capitalize">
                {selectedStudent.apellidoPaterno} {selectedStudent.apellidoMaterno},{" "}
                {selectedStudent.name}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span>DNI: {selectedStudent.dni}</span>
                {selectedStudent.nivelAcademico?.grado && (
                  <span>
                    • {selectedStudent.nivelAcademico.grado.nombre} &quot;
                    {selectedStudent.nivelAcademico.seccion}&quot;
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Deseleccionar estudiante"
            className="rounded-lg size-7 hover:bg-rose-500/10 hover:text-rose-500"
            onClick={onClearStudent}
          >
            <IconX className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
          <Input
            placeholder="Escriba nombre, apellido o DNI del alumno..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
          />
          {searching && (
            <div className="absolute right-3 top-2.5">
              <IconLoader2 className="animate-spin text-muted-foreground/60 size-4" />
            </div>
          )}
        </div>
      )}

      {/* Resultados flotantes */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <LazyMotion features={domAnimation}>
            <m.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute z-50 left-0 right-0 top-16 rounded-xl border border-border/40 bg-background shadow-lg overflow-hidden max-h-56 overflow-y-auto"
            >
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="w-full text-left p-3 hover:bg-indigo-500/10 border-b border-border/20 last:border-b-0 transition-colors flex justify-between items-center group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-foreground group-hover:text-indigo-600">
                      {student.apellidoPaterno} {student.apellidoMaterno},{" "}
                      {student.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      DNI: {student.dni} —{" "}
                      {student.nivelAcademico?.grado?.nombre || "Sin Sección"}{" "}
                      &quot;{student.nivelAcademico?.seccion || ""}&quot;
                    </div>
                  </div>
                  <IconChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </m.div>
          </LazyMotion>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ChannelSelectorButtonsProps {
  selectedChannels: ("EMAIL" | "SMS" | "WHATSAPP")[];
  onToggleChannel: (channel: "EMAIL" | "SMS" | "WHATSAPP") => void;
}

export function ChannelSelectorButtons({
  selectedChannels,
  onToggleChannel,
}: ChannelSelectorButtonsProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-foreground/80">
        Canales de Envío Simultáneo
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Email */}
        <button
          type="button"
          onClick={() => onToggleChannel("EMAIL")}
          className={cn(
            "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
            selectedChannels.includes("EMAIL")
              ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
              : "bg-background border-border/40 hover:bg-muted/40"
          )}
        >
          <IconMail
            className={cn(
              "size-4 shrink-0",
              selectedChannels.includes("EMAIL")
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-muted-foreground"
            )}
          />
          <div>
            <span className="font-bold block text-xs">Correo Electrónico</span>
            <span className="text-[10px] text-muted-foreground">Resend API</span>
          </div>
        </button>

        {/* SMS */}
        <button
          type="button"
          onClick={() => onToggleChannel("SMS")}
          className={cn(
            "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
            selectedChannels.includes("SMS")
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
              : "bg-background border-border/40 hover:bg-muted/40"
          )}
        >
          <IconMessage
            className={cn(
              "size-4 shrink-0",
              selectedChannels.includes("SMS")
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-foreground"
            )}
          />
          <div>
            <span className="font-bold block text-xs">SMS de Texto</span>
            <span className="text-[10px] text-muted-foreground">Twilio Engine</span>
          </div>
        </button>

        {/* WhatsApp */}
        <button
          type="button"
          onClick={() => onToggleChannel("WHATSAPP")}
          className={cn(
            "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
            selectedChannels.includes("WHATSAPP")
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
              : "bg-background border-border/40 hover:bg-muted/40"
          )}
        >
          <IconBrandWhatsapp
            className={cn(
              "size-4 shrink-0",
              selectedChannels.includes("WHATSAPP")
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            )}
          />
          <div>
            <span className="font-bold block text-xs">WhatsApp</span>
            <span className="text-[10px] text-muted-foreground">Twilio Gateway</span>
          </div>
        </button>
      </div>
    </div>
  );
}
