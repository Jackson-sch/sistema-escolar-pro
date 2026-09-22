"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { IconId, IconPrinter, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BatchCardsPreview } from "./batch-cards-preview";
import { BatchCardsLayoutSelector } from "./batch-cards-layout-selector";
import { BatchCardsFilters } from "./batch-cards-filters";

interface BatchCardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nivelesAcademicos?: any[];
  defaultNivel?: string;
  defaultGrado?: string;
}

const DEFAULT_NIVELES: any[] = [];

export function BatchCardsDialog({
  open,
  onOpenChange,
  nivelesAcademicos = DEFAULT_NIVELES,
  defaultNivel,
  defaultGrado,
}: BatchCardsDialogProps) {
  const [selectedNivel, setSelectedNivel] = useState<string>(
    defaultNivel && defaultNivel !== "ALL" ? defaultNivel : ""
  );
  const [selectedGrado, setSelectedGrado] = useState<string>(
    defaultGrado && defaultGrado !== "ALL" ? defaultGrado : "ALL"
  );
  const [selectedSeccionId, setSelectedSeccionId] = useState<string>("ALL");
  const [layout, setLayout] = useState<"grid8" | "duplex">("grid8");
  const [isPending, startTransition] = useTransition();

  // Extraer niveles únicos soportando relaciones directas y anidadas
  const availableNiveles = useMemo(() => {
    const set = new Set<string>();
    nivelesAcademicos.forEach((n) => {
      const nombre = n.nivel?.nombre || n.grado?.nivel?.nombre;
      if (nombre) set.add(nombre);
    });
    return Array.from(set).sort();
  }, [nivelesAcademicos]);

  // Asegurar un nivel seleccionado por defecto para evitar sobrecarga de opciones
  useEffect(() => {
    if (availableNiveles.length > 0) {
      if (!selectedNivel || selectedNivel === "ALL" || !availableNiveles.includes(selectedNivel)) {
        const initial =
          defaultNivel && availableNiveles.includes(defaultNivel)
            ? defaultNivel
            : availableNiveles[0];
        setSelectedNivel(initial);
      }
    }
  }, [availableNiveles, defaultNivel, selectedNivel]);

  // Grados filtrados por el nivel seleccionado
  const availableGrados = useMemo(() => {
    const map = new Map<string, { id: string; nombre: string; orden: number }>();
    nivelesAcademicos.forEach((n) => {
      const nivelNombre = n.nivel?.nombre || n.grado?.nivel?.nombre;
      if (selectedNivel === "ALL" || nivelNombre === selectedNivel) {
        if (n.grado?.id && n.grado?.nombre) {
          map.set(n.grado.id, {
            id: n.grado.id,
            nombre: n.grado.nombre,
            orden: n.grado.orden ?? 0,
          });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.orden - b.orden);
  }, [nivelesAcademicos, selectedNivel]);

  // Secciones filtradas por grado y nivel
  const availableSecciones = useMemo(() => {
    return nivelesAcademicos
      .filter((n) => {
        const nivelNombre = n.nivel?.nombre || n.grado?.nivel?.nombre;
        const matchesNivel =
          selectedNivel === "ALL" || nivelNombre === selectedNivel;
        const matchesGrado =
          selectedGrado === "ALL" || n.grado?.id === selectedGrado || n.gradoId === selectedGrado;
        return matchesNivel && matchesGrado;
      })
      .sort((a, b) => {
        const ordA = a.grado?.orden ?? 0;
        const ordB = b.grado?.orden ?? 0;
        if (ordA !== ordB) return ordA - ordB;
        return (a.seccion || "").localeCompare(b.seccion || "");
      });
  }, [nivelesAcademicos, selectedNivel, selectedGrado]);

  const handleNivelChange = (val: string) => {
    setSelectedNivel(val);
    setSelectedGrado("ALL");
    setSelectedSeccionId("ALL");
  };

  const handleGradoChange = (val: string) => {
    setSelectedGrado(val);
    setSelectedSeccionId("ALL");
  };

  const handleGeneratePdf = () => {
    startTransition(() => {
      try {
        const params = new URLSearchParams();
        params.set("layout", layout);

        if (selectedSeccionId !== "ALL") {
          params.set("nivelAcademicoId", selectedSeccionId);
        } else if (selectedGrado !== "ALL") {
          params.set("gradoId", selectedGrado);
        } else if (selectedNivel !== "ALL") {
          const match = nivelesAcademicos.find(
            (n) => (n.nivel?.nombre || n.grado?.nivel?.nombre) === selectedNivel
          );
          const nivelId = match?.nivel?.id || match?.nivelId || match?.grado?.nivel?.id;
          if (nivelId) {
            params.set("nivelId", nivelId);
          }
        }

        const url = `/api/documentos/carnets-lote?${params.toString()}`;
        window.open(url, "_blank");

        toast.success("Generando lote de carnets para imprimir", {
          description: "El PDF optimizado se abrirá en una nueva pestaña.",
        });
        onOpenChange(false);
      } catch {
        toast.error("Error al generar los carnets");
      }
    });
  };

  const previewAula = useMemo(() => {
    if (selectedSeccionId !== "ALL") {
      const sec = nivelesAcademicos.find((n) => n.id === selectedSeccionId);
      return sec ? `${sec.grado?.nombre} "${sec.seccion}"` : "Sección Seleccionada";
    }
    if (selectedGrado !== "ALL") {
      const gr = availableGrados.find((g) => g.id === selectedGrado);
      return gr ? `${gr.nombre} (Todas las secciones)` : "Grado Seleccionado";
    }
    if (selectedNivel !== "ALL") {
      return `${selectedNivel} (Todos los grados)`;
    }
    return "Toda la Institución";
  }, [selectedSeccionId, selectedGrado, selectedNivel, nivelesAcademicos, availableGrados]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconId className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Generador de Carnets Escolares con QR
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Emisión masiva de credenciales estudiantiles oficiales en PDF listo para imprimir.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-2">
          <div className="md:col-span-7 space-y-4">
            <BatchCardsFilters
              selectedNivel={selectedNivel}
              selectedGrado={selectedGrado}
              selectedSeccionId={selectedSeccionId}
              availableNiveles={availableNiveles}
              availableGrados={availableGrados}
              availableSecciones={availableSecciones}
              onNivelChange={handleNivelChange}
              onGradoChange={handleGradoChange}
              onSeccionChange={setSelectedSeccionId}
            />
            <BatchCardsLayoutSelector layout={layout} onLayoutChange={setLayout} />
          </div>

          <div className="md:col-span-5">
            <BatchCardsPreview layout={layout} previewAula={previewAula} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-semibold cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isPending}
            className="rounded-xl text-xs font-bold gap-2 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            {isPending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconPrinter className="size-4" />
            )}
            Descargar PDF para Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
