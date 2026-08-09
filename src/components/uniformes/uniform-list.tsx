"use client";

import Image from "next/image";

import { useTransition, useState } from "react";
import {
  Shirt,
  Trash2,
  Edit2,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Package,
  Layers,
  Ruler,
} from "lucide-react";
import { toast } from "sonner";
import { deleteUniformeAction } from "@/actions/uniformes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { UniformBasicModal } from "./uniform-basic-modal";
import { UniformVariantsModal } from "./uniform-variants-modal";
import { cn } from "@/lib/utils";

interface UniformListProps {
  uniforms: any[];
  categories: any[];
  sedes: any[];
}

export function UniformList({ uniforms, categories, sedes }: UniformListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [editingUniform, setEditingUniform] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uniformToDelete, setUniformToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUniforms = uniforms.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || u.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteClick = (uniform: any) => {
    setUniformToDelete(uniform);
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!uniformToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteUniformeAction(uniformToDelete.id);
      if (result.success) {
        toast.success("Uniforme eliminado correctamente");
        setIsDeleteModalOpen(false);
        setUniformToDelete(null);
      } else {
        toast.error(result.error || "Error al eliminar el uniforme");
      }
    } catch (error) {
      toast.error("Error inesperado al eliminar");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros y Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-background/50 p-3.5 rounded-2xl border border-border/40 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar prendas por nombre o detalle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
          />
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground/60" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="all" className="text-xs">
                Todas las categorías
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs">
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setEditingUniform(null);
              setIsBasicModalOpen(true);
            }}
            className="rounded-xl px-4 h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Prenda</span>
          </Button>
        </div>
      </div>

      {/* Grid de Uniformes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUniforms.map((uniform) => (
          <UniformCard
            key={uniform.id}
            uniform={uniform}
            onEdit={() => {
              setEditingUniform(uniform);
              setIsBasicModalOpen(true);
            }}
            onManageVariants={() => {
              setEditingUniform(uniform);
              setIsVariantsModalOpen(true);
            }}
            onDelete={() => handleDeleteClick(uniform)}
          />
        ))}

        {filteredUniforms.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground/60 bg-background/40 rounded-2xl border border-dashed border-border/40 space-y-2">
            <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-xs font-semibold text-foreground">No se encontraron prendas registradas</p>
            <p className="text-[11px]">Intenta modificar los términos de búsqueda o filtros.</p>
          </div>
        )}
      </div>

      <UniformBasicModal
        isOpen={isBasicModalOpen}
        onOpenChange={setIsBasicModalOpen}
        uniform={editingUniform}
        categories={categories}
      />

      <UniformVariantsModal
        isOpen={isVariantsModalOpen}
        onOpenChange={setIsVariantsModalOpen}
        uniform={editingUniform}
        sedes={sedes}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="Eliminar Uniforme"
        description={`¿Estás seguro de que deseas eliminar "${uniformToDelete?.nombre}"? Esta acción borrará la prenda y sus datos asociados.`}
        variant="danger"
      />
    </div>
  );
}

function UniformCard({
  uniform,
  onEdit,
  onManageVariants,
  onDelete,
}: {
  uniform: any;
  onEdit: () => void;
  onManageVariants: () => void;
  onDelete: () => void;
}) {
  const totalStock =
    uniform.variantes?.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
  const variantCount = uniform.variantes?.length || 0;

  return (
    <Card className="group overflow-hidden p-0 border-border/40 transition-[box-shadow,transform] duration-300 hover:shadow-xl hover:-translate-y-0.5 bg-card/80 rounded-2xl">
      <div className="aspect-4/3 relative bg-muted/10 overflow-hidden">
        {uniform.imagen ? (
          <Image
            src={uniform.imagen}
            alt={uniform.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted/20">
            <Shirt className="h-12 w-12" />
          </div>
        )}
        <Badge className="absolute top-3 right-3 bg-background/90 text-foreground border-border/40 shadow-xs px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider rounded-lg">
          {uniform.categoria?.nombre || "General"}
        </Badge>

        {/* Acciones flotantes en Hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-1/2 flex items-end p-3">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 bg-background/90 hover:bg-background border-border/40 rounded-xl text-xs font-semibold h-8"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1 text-indigo-500" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onManageVariants}
              className="flex-1 bg-background/90 hover:bg-background border-border/40 rounded-xl text-xs font-semibold h-8"
            >
              <Ruler className="h-3.5 w-3.5 mr-1 text-amber-500" />
              Tallas
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              className="size-8 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border-rose-500/30 rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-sm font-bold text-foreground line-clamp-1">
          {uniform.nombre}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs font-normal text-muted-foreground/80 min-h-8 mt-1">
          {uniform.descripcion || "Sin descripción disponible"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-3 flex justify-between items-center border-t border-border/30 mt-3 bg-background/30">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
            Stock Físico
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Package className="h-3.5 w-3.5 text-indigo-500" />
            <Badge 
              variant="outline" 
              className={cn(
                "rounded-md text-[10px] font-bold px-1.5 py-0 border-none",
                totalStock === 0 && "bg-rose-500/10 text-rose-600",
                totalStock > 0 && totalStock <= 5 && "bg-amber-500/10 text-amber-600",
                totalStock > 5 && "bg-emerald-500/10 text-emerald-600"
              )}
            >
              {totalStock === 0 ? "Agotado" : `${totalStock} unids`}
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
            Tallas
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold font-mono text-foreground">
              {variantCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
