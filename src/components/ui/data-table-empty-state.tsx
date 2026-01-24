"use client";

import * as React from "react";
import { IconSearch, IconFilterOff, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableEmptyStateProps {
  title?: string;
  description?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onViewAll?: () => void;
  className?: string;
}

export function DataTableEmptyState({
  title,
  description,
  hasFilters = false,
  onClearFilters,
  onViewAll,
  className,
}: DataTableEmptyStateProps) {
  const defaultTitle = hasFilters
    ? "No se encontraron resultados"
    : "No hay datos disponibles";
  const defaultDescription = hasFilters
    ? "No pudimos encontrar nada que coincida con tus términos de búsqueda o los filtros aplicados."
    : "Aún no se ha registrado información en esta sección.";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-700",
        className,
      )}
    >
      {/* Animated Animated Illustration */}
      <div className="relative mb-8">
        {/* Background Decorative Circles */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 -m-8 rounded-full bg-primary/5 blur-2xl"
        />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative size-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden"
        >
          {/* Internal gradient/shimmer */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent" />

          <div className="relative">
            <IconSearch className="size-10 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Small floating detail icons like in the reference */}
        <motion.div
          animate={{
            y: [0, -5, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-6 size-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm"
        >
          <div className="size-1.5 rounded-full bg-primary/40" />
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-[420px]"
      >
        <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
          {title || defaultTitle}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-10 text-pretty">
          {description || defaultDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasFilters && onClearFilters && (
            <Button
              onClick={onClearFilters}
              size="lg"
              className="rounded-full px-8 h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95"
            >
              <IconFilterOff className="mr-2 size-4" />
              Limpiar Filtros
            </Button>
          )}

          {onViewAll && (
            <Button
              variant="outline"
              onClick={onViewAll}
              size="lg"
              className="rounded-full px-8 h-11 border-border/60 bg-background/50 backdrop-blur-sm hover:bg-muted/80 transition-all active:scale-95 text-muted-foreground"
            >
              Ver Todos
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
