"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shirt,
  ShoppingCart,
  Minus,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavoritoUniformeAction } from "@/actions/uniformes";
import { formatCurrency } from "@/lib/formats";

// ─── Types ────────────────────────────────────────────────────────────────────

type Variante = {
  id: string;
  talla: string;
  precio: number;
  stock: number;
  sedeId: string;
};

type Uniform = {
  id: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  categoria?: { nombre: string };
  variantes: Variante[];
  favoritos?: any[];
};

type Props = {
  uniform: Uniform;
  onAddToCart: (variante: Variante, qty: number) => void;
  sedeId: string;
  currentUserId: string;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FavoriteButton({
  isFavorite,
  isLoading,
  onClick,
}: {
  isFavorite: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={cn(
        "absolute top-4 right-4 z-10 h-9 w-9 rounded-2xl flex items-center justify-center",
        "shadow-lg transition-all duration-200 active:scale-90",
        "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0",
        isFavorite
          ? "bg-red-500 text-white shadow-red-500/30"
          : "bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-400 backdrop-blur-sm",
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform",
          isLoading && "animate-pulse",
          isFavorite && "fill-current",
        )}
      />
    </button>
  );
}

function SizeButton({
  variante,
  isSelected,
  onClick,
}: {
  variante: Variante;
  isSelected: boolean;
  onClick: () => void;
}) {
  const outOfStock = variante.stock === 0;
  return (
    <button
      onClick={onClick}
      disabled={outOfStock}
      aria-label={`Talla ${variante.talla}${outOfStock ? " - sin stock" : ""}`}
      aria-pressed={isSelected}
      className={cn(
        "relative h-10 min-w-[40px] px-2 flex items-center justify-center rounded-xl text-xs font-black",
        "transition-all duration-150 border",
        isSelected
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md scale-105"
          : outOfStock
            ? "bg-transparent text-slate-300 dark:text-slate-600 border-slate-200 dark:border-white/10 cursor-not-allowed line-through"
            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/30 hover:scale-105",
      )}
    >
      {variante.talla}
      {/* Low stock indicator */}
      {!outOfStock && variante.stock <= 3 && (
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 border border-white dark:border-slate-900" />
      )}
    </button>
  );
}

function QuantityControl({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/6 rounded-xl p-1">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-7 text-center text-sm font-black text-slate-900 dark:text-white tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 disabled:opacity-30 transition-all active:scale-90"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortalUniformCard({
  uniform,
  onAddToCart,
  sedeId,
  currentUserId,
}: Props) {
  const [selectedVarianteId, setSelectedVarianteId] = useState<string | null>(
    null,
  );
  const [cantidad, setCantidad] = useState(1);
  const [isFavorite, setIsFavorite] = useState(
    (uniform.favoritos?.length ?? 0) > 0,
  );
  const [isLiking, setIsLiking] = useState(false);

  // Derived: which variants to show
  const sedeVariantes = useMemo(
    () => uniform.variantes.filter((v) => v.sedeId === sedeId),
    [uniform.variantes, sedeId],
  );
  const displayVariantes =
    sedeVariantes.length > 0 ? sedeVariantes : uniform.variantes;
  const isOutsideSede = sedeVariantes.length === 0;

  // Reset selection when sede changes
  useEffect(() => {
    setSelectedVarianteId(null);
    setCantidad(1);
  }, [sedeId]);

  // Current selected variant — auto-select first with stock
  const currentVariante = useMemo(() => {
    if (selectedVarianteId) {
      return displayVariantes.find((v) => v.id === selectedVarianteId) ?? null;
    }
    return (
      displayVariantes.find((v) => v.stock > 0) ?? displayVariantes[0] ?? null
    );
  }, [selectedVarianteId, displayVariantes]);

  const maxQty = currentVariante?.stock ?? 0;
  const canAddToCart = !!currentVariante && currentVariante.stock > 0;

  const handleSelectVariante = useCallback((id: string) => {
    setSelectedVarianteId(id);
    setCantidad(1); // Reset qty when changing size
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!currentVariante) return;
    onAddToCart(currentVariante, cantidad);
  }, [currentVariante, cantidad, onAddToCart]);

  const handleToggleFavorite = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    const prev = isFavorite;
    setIsFavorite(!prev);
    try {
      const res = await toggleFavoritoUniformeAction(currentUserId, uniform.id);
      if (res.error) setIsFavorite(prev);
    } catch {
      setIsFavorite(prev);
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isFavorite, currentUserId, uniform.id]);

  return (
    <div className="group flex flex-col h-full rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900/60 ring-1 ring-slate-100 dark:ring-white/6 shadow-lg shadow-slate-100 dark:shadow-none hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 hover:-translate-y-1.5 transition-all duration-500">
      {/* ── Image Region ─────────────────────────────────── */}
      <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {uniform.imagen ? (
          <img
            src={uniform.imagen}
            alt={uniform.nombre}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Shirt className="h-16 w-16 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category label */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-white/10">
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            {uniform.categoria?.nombre ?? "General"}
          </span>
        </div>

        {/* Favorite button */}
        <FavoriteButton
          isFavorite={isFavorite}
          isLoading={isLiking}
          onClick={handleToggleFavorite}
        />

        {/* Outside-sede warning */}
        {isOutsideSede && (
          <div className="absolute bottom-4 inset-x-4 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-2 rounded-xl">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            No disponible en tu sede actual
          </div>
        )}

        {/* Quick sizes peek — slides up on hover */}
        {!isOutsideSede && (
          <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl px-3 py-2.5 border border-white/40 dark:border-white/10">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Tallas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {displayVariantes.map((v) => (
                  <span
                    key={v.id}
                    className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-lg",
                      v.stock > 0
                        ? "bg-slate-900/10 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                        : "text-slate-300 dark:text-slate-600 line-through",
                    )}
                  >
                    {v.talla}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Info Region ───────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Name + Price */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug truncate">
              {uniform.nombre}
            </h3>
            {uniform.descripcion && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 line-clamp-1">
                {uniform.descripcion}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(currentVariante?.precio ?? 0)}
            </p>
            {currentVariante && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  currentVariante.stock === 0
                    ? "text-red-400"
                    : currentVariante.stock <= 3
                      ? "text-amber-500"
                      : "text-green-500",
                )}
              >
                {currentVariante.stock === 0
                  ? "Sin stock"
                  : currentVariante.stock <= 3
                    ? `Quedan ${currentVariante.stock}`
                    : `${currentVariante.stock} disp.`}
              </p>
            )}
          </div>
        </div>

        {/* Size selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
            Talla
          </p>
          <div className="flex flex-wrap gap-2">
            {displayVariantes.map((v) => (
              <SizeButton
                key={v.id}
                variante={v}
                isSelected={
                  selectedVarianteId
                    ? v.id === selectedVarianteId
                    : v.id === currentVariante?.id
                }
                onClick={() => handleSelectVariante(v.id)}
              />
            ))}
          </div>
        </div>

        {/* Quantity + CTA */}
        <div className="mt-auto flex items-center gap-3">
          <QuantityControl
            value={cantidad}
            max={maxQty}
            onChange={setCantidad}
          />

          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={cn(
              "flex-1 h-11 rounded-xl font-black text-xs tracking-wide",
              "bg-slate-900 hover:bg-black text-white",
              "dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900",
              "disabled:opacity-30 disabled:cursor-not-allowed",
              "shadow-md shadow-slate-900/10 dark:shadow-white/5",
              "group/btn transition-all duration-150 active:scale-[0.98]",
            )}
          >
            <ShoppingCart className="h-4 w-4 mr-2 group-hover/btn:rotate-6 transition-transform duration-150" />
            {currentVariante?.stock === 0 ? "Sin Stock" : "Agregar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
