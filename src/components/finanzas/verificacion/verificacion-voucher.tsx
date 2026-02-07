"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  IconReceipt,
  IconPlus,
  IconMinus,
  IconRefresh,
  IconMaximize,
} from "@tabler/icons-react";

interface VerificacionVoucherProps {
  archivoUrl: string;
}

export function VerificacionVoucher({ archivoUrl }: VerificacionVoucherProps) {
  const [zoomScale, setZoomScale] = useState(1);

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 1));
  const handleResetZoom = () => setZoomScale(1);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    }
  };

  return (
    <div className="sticky top-0">
      <h3 className="text-sm font-semibold uppercase text-zinc-400 mb-4 flex items-center gap-2">
        <IconReceipt className="size-4" /> Comprobante Adjunto
      </h3>

      <div className="group relative aspect-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-500">
        {/* Interactive Image Container */}
        <div
          className="absolute inset-0 overflow-hidden bg-zinc-100 dark:bg-zinc-950/50"
          onWheel={handleWheel}
        >
          <motion.div
            drag={zoomScale > 1}
            dragConstraints={{
              left: -(zoomScale - 1) * 400,
              right: (zoomScale - 1) * 400,
              top: -(zoomScale - 1) * 600,
              bottom: (zoomScale - 1) * 600,
            }}
            dragElastic={0.05}
            dragMomentum={false}
            animate={{
              scale: zoomScale,
              x: zoomScale === 1 ? 0 : undefined,
              y: zoomScale === 1 ? 0 : undefined,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full flex items-center justify-center cursor-move"
          >
            <motion.img
              src={archivoUrl}
              alt="Payment Receipt"
              className="max-w-full max-h-full object-contain pointer-events-none"
            />
          </motion.div>
        </div>
        {/* Inline Controls (Vertical) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white"
            onClick={handleZoomIn}
          >
            <IconPlus className="size-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1}
          >
            <IconMinus className="size-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="size-10 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-xl hover:scale-105 active:scale-95 transition-all text-zinc-900 dark:text-white"
            onClick={handleResetZoom}
          >
            <IconRefresh className="size-5" />
          </Button>
        </div>

        {/* Zoom Info Label */}
        {zoomScale > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 bg-zinc-900/90 backdrop-blur-xl text-white text-[10px] font-bold rounded-full border border-white/10 shadow-2xl pointer-events-none uppercase">
            Zoom {Math.round(zoomScale * 100)}% • Arrastra para explorar
          </div>
        )}

        {/* Initial Instruction Overlay */}
        {zoomScale === 1 && (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-3xl px-5 py-2.5 rounded-full border shadow-xl shadow-primary/5">
              <IconMaximize className="size-4 text-muted" />
              <span className="text-[10px] text-muted font-bold tracking-tight uppercase">
                Usar botones para Zoom
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
