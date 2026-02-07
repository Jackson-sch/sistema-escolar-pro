"use client";

import { useState, useMemo } from "react";
import {
  IconSpeakerphone,
  IconSearch,
  IconAdjustmentsHorizontal,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils";
import { FormModal } from "@/components/modals/form-modal";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementForm } from "./announcement-form";

interface AnnouncementListProps {
  initialAnuncios: any[];
}

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "importante", label: "Importante" },
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
          (anuncio.urgente || anuncio.importante));

      return matchesSearch && matchesCategory;
    });
  }, [initialAnuncios, search, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-muted/30 p-4 rounded-3xl border border-border/40">
        <div className="relative flex-1 max-w-md group">
          <InputGroup className="rounded-full">
            <InputGroupAddon>
              <IconSearch className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar anuncios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2 pb-2 lg:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "secondary"}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full px-4 text-xs font-bold transition-all",
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-background hover:bg-muted border border-border/40 text-muted-foreground",
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredAnuncios.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-border/40 rounded-3xl bg-muted/5 text-muted-foreground/40 p-12 text-center">
          <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <IconSearch className="size-10" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground/40">
            No se encontraron resultados
          </h3>
          <p className="text-sm max-w-sm">
            Intenta ajustar tus términos de búsqueda o filtros para encontrar lo
            que buscas.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="mt-4 text-primary font-bold rounded-full"
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Create Button Card */}
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
