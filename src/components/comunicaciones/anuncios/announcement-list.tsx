"use client";

import { useState, useMemo } from "react";
import {
  IconSearch,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/modals/form-modal";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementForm } from "./announcement-form";

interface AnnouncementListProps {
  initialAnuncios: any[];
}

const CATEGORIES = [
  { id: "all", label: "Todos los Anuncios" },
  { id: "importante", label: "Importantes" },
  { id: "academico", label: "Académico" },
  { id: "eventos", label: "Eventos" },
  { id: "deportes", label: "Deportes" },
];

export function AnnouncementList({ initialAnuncios }: AnnouncementListProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAnuncios = useMemo(() => {
    return initialAnuncios.filter((anuncio) => {
      const matchesSearch =
        anuncio.titulo.toLowerCase().includes(search.toLowerCase()) ||
        (anuncio.resumen || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        anuncio.categoria?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "importante" &&
          (anuncio.urgente || anuncio.importante)) ||
        (selectedCategory === "eventos" &&
          (anuncio.categoria?.toLowerCase() === "eventos" ||
            anuncio.titulo.toLowerCase().includes("evento")));

      return matchesSearch && matchesCategory;
    });
  }, [initialAnuncios, search, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
          <Input
            placeholder="Buscar por título o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-xl px-3.5 h-8 text-xs font-semibold transition-[color,background-color,border-color,box-shadow] cursor-pointer",
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                  : "bg-background/80 hover:bg-muted text-muted-foreground border border-border/30",
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredAnuncios.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] border border-dashed border-border/40 rounded-2xl bg-muted/10 p-8 text-center">
          <div className="size-14 rounded-2xl bg-muted/20 flex items-center justify-center mb-3 text-muted-foreground">
            <IconSearch className="size-7" />
          </div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            No se encontraron publicaciones
          </h3>
          <p className="text-xs text-muted-foreground max-w-xs mb-4">
            Intenta ajustar los términos de búsqueda o cambiar la categoría seleccionada.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="text-xs font-semibold rounded-xl h-8 border-border/40"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnnouncementCard
            isCreateCard
            onCreateClick={() => setIsCreateModalOpen(true)}
          />

          {filteredAnuncios.map((anuncio) => (
            <AnnouncementCard key={anuncio.id} anuncio={anuncio} />
          ))}
        </div>
      )}

      <FormModal
        title="Nuevo Anuncio Institucional"
        description="Publique información relevante para la comunidad educativa."
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        className="sm:max-w-[600px]"
      >
        <AnnouncementForm onSuccess={() => setIsCreateModalOpen(false)} />
      </FormModal>
    </div>
  );
}
