"use client";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import { UniformBasicModal } from "./uniform-basic-modal";
import { UniformVariantsModal } from "./uniform-variants-modal";

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

  const filteredUniforms = uniforms.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || u.categoriaId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar uniformes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/10 border-border/40 focus:bg-muted/20 transition-all rounded-xl"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 bg-muted/10 border-border/40 rounded-xl text-foreground">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground/60" />
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="bg-card/90 backdrop-blur-xl border-border/40 rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todas las categorías
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
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
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95 rounded-xl h-10 px-5 font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          />
        ))}

        {filteredUniforms.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
            <AlertCircle className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">No se encontraron uniformes</p>
            <p className="text-sm">
              Intenta con otros términos de búsqueda o filtros
            </p>
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
    </div>
  );
}

function UniformCard({
  uniform,
  onEdit,
  onManageVariants,
}: {
  uniform: any;
  onEdit: () => void;
  onManageVariants: () => void;
}) {
  const totalStock =
    uniform.variantes?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0;
  const variantCount = uniform.variantes?.length || 0;

  return (
    <Card className="group overflow-hidden border-border/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-card/40 backdrop-blur-xl rounded-3xl animate-in fade-in zoom-in-95">
      <div className="aspect-4/3 relative bg-muted/10 overflow-hidden">
        {uniform.imagen ? (
          <img
            src={uniform.imagen}
            alt={uniform.nombre}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Shirt className="h-16 w-16" />
          </div>
        )}
        <Badge className="absolute top-4 right-4 bg-background/80 text-foreground border-border/40 shadow-lg backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-wider">
          {uniform.categoria?.nombre}
        </Badge>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 h-1/2 flex items-end p-4">
          <div className="flex gap-2 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md rounded-xl font-bold h-10"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Info
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onManageVariants}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md rounded-xl font-bold h-10"
            >
              <Ruler className="h-4 w-4 mr-2" />
              Tallas
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 bg-rose-500/80 hover:bg-rose-500 text-white border-none backdrop-blur-md rounded-xl shadow-lg"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-lg font-black text-foreground line-clamp-1 tracking-tight">
          {uniform.nombre}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs font-medium text-muted-foreground/60 min-h-10 mt-1">
          {uniform.descripcion || "Sin descripción disponible"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 pt-5 flex justify-between items-center border-t border-border/40 mt-5 bg-muted/5">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">
            Stock Total
          </span>
          <div className="flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-primary" />
            <span
              className={`text-sm font-black ${totalStock <= 5 ? "text-amber-500" : "text-foreground"}`}
            >
              {totalStock} unidades
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black">
            Variantes
          </span>
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground/40" />
            <span className="text-sm font-bold text-muted-foreground/80">
              {variantCount} tallas
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
