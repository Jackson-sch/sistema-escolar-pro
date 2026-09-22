"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconKeyboard, IconCommand } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StudentKeyboardLegendProps {
  className?: string;
  variant?: "button" | "footer";
}

const FULL_SHORTCUTS = [
  {
    category: "Navegación y Foco",
    items: [
      { key: "↑ / ↓  o  J / K", description: "Mover el cursor entre estudiantes" },
      { key: "↵ Enter / Espacio", description: "Abrir Expediente 360° (Quick Peek)" },
      { key: "Ctrl + K  o  /", description: "Foco rápido en la barra de búsqueda" },
      { key: "Esc", description: "Cerrar paneles o limpiar foco" },
    ],
  },
  {
    category: "Acciones Rápidas del Alumno Activo",
    items: [
      { key: "Ctrl + M  o  M", description: "Abrir formulario de Inscripción / Matrícula" },
      { key: "Ctrl + E  o  E", description: "Abrir formulario de Edición de datos" },
      { key: "W", description: "Iniciar chat de WhatsApp con el apoderado principal" },
    ],
  },
  {
    category: "Controles Globales",
    items: [
      { key: "Shift + N", description: "Abrir modal de Nuevo Estudiante" },
      { key: "V", description: "Alternar entre Vista Tabla y Vista Directorio" },
      { key: "?", description: "Mostrar esta guía de atajos de teclado" },
    ],
  },
];

export function StudentKeyboardLegend({
  className,
  variant = "button",
}: StudentKeyboardLegendProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);


  return (
    <>
      {variant === "button" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsHelpOpen(true)}
          className={cn(
            "h-9 px-2.5 rounded-xl border-border/60 bg-background text-xs font-bold text-muted-foreground hover:text-foreground shadow-2xs gap-1.5 cursor-pointer",
            className
          )}
          title="Ver atajos de teclado (Presiona ?)"
        >
          <IconKeyboard className="size-4 text-primary" />
          <span className="hidden sm:inline">Atajos</span>
          <kbd className="px-1 py-0.2 rounded-md bg-muted border border-border/60 text-[10px] font-mono font-bold text-muted-foreground">
            ?
          </kbd>
        </Button>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-muted-foreground/80 bg-muted/15 border-t border-border/40 rounded-b-2xl select-none",
            className
          )}
        >
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <IconKeyboard className="size-3.5 text-primary" />
              Teclado:
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-background border border-border/60 font-mono text-[10px] font-bold text-foreground">
                  ↑↓
                </kbd>{" "}
                Navegar
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-background border border-border/60 font-mono text-[10px] font-bold text-foreground">
                  ↵ Enter
                </kbd>{" "}
                Ficha 360°
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-background border border-border/60 font-mono text-[10px] font-bold text-foreground">
                  Ctrl+M
                </kbd>{" "}
                Matricular
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-background border border-border/60 font-mono text-[10px] font-bold text-foreground">
                  W
                </kbd>{" "}
                WhatsApp
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="text-[10px] font-bold text-primary hover:underline shrink-0 ml-auto cursor-pointer"
          >
            Ver todos (?)
          </button>
        </div>
      )}

      {/* Modal Completo de Ayuda de Atajos */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border/60 p-0 overflow-hidden">
          <DialogHeader className="p-5 pb-3 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-2 text-primary">
              <IconCommand className="size-5" />
              <DialogTitle className="text-base font-bold text-foreground">
                Atajos de Teclado del Padrón
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Optimice su flujo de trabajo gestionando alumnos y matrículas sin soltar el teclado.
            </DialogDescription>
          </DialogHeader>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {FULL_SHORTCUTS.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {cat.category}
                </h5>
                <div className="space-y-1.5">
                  {cat.items.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-muted/20 border border-border/30 text-xs"
                    >
                      <span className="font-medium text-foreground text-xs">
                        {item.description}
                      </span>
                      <kbd className="px-2 py-1 rounded-lg bg-background border border-border/60 font-mono text-[11px] font-bold text-foreground shrink-0 shadow-2xs">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-muted/10 border-t border-border/40 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsHelpOpen(false)}
              className="h-8 rounded-xl font-bold text-xs cursor-pointer"
            >
              Entendido (Esc)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
