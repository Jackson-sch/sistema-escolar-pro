"use client";

import React from "react";
import { IconQrcode, IconSparkles } from "@tabler/icons-react";

interface BatchCardsPreviewProps {
  layout: "grid8" | "duplex";
  previewAula: string;
}

export function BatchCardsPreview({
  layout,
  previewAula,
}: BatchCardsPreviewProps) {
  return (
    <div className="flex flex-col justify-between p-3.5 rounded-xl bg-muted/40 border border-border/50">
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <IconSparkles className="size-3 text-amber-500" />
            Vista Previa del Carnet
          </span>
          <span className="text-[9px] text-muted-foreground/80 font-medium">
            {layout === "grid8" ? "8 en A4 (Recomendado)" : "Plegable (4 en A4)"}
          </span>
        </div>

        {/* Simulación Realista de Carnet Escolar */}
        <div className="bg-card rounded-lg overflow-hidden border border-border shadow-xs text-foreground">
          {/* Header Ejecutivo Nordic Slate */}
          <div className="bg-[#090d16] text-white px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded bg-indigo-950 border border-indigo-500 flex items-center justify-center text-[8px] font-black text-white">
                IE
              </div>
              <div>
                <div className="text-[8.5px] font-extrabold tracking-wide uppercase leading-tight text-white">
                  Casita de Sorpresas High School
                </div>
                <div className="text-[6.5px] text-indigo-300 font-medium">
                  FORMACIÓN INTEGRAL Y VALORES
                </div>
              </div>
            </div>
            <div className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-700/60 text-[6.5px] font-bold text-indigo-200">
              DIC 2026
            </div>
          </div>
          <div className="h-0.5 bg-indigo-600" />

          {/* Contenido Carnet */}
          <div className="p-2 flex items-center gap-2.5 bg-white dark:bg-slate-900">
            {/* Foto + DNI */}
            <div className="flex flex-col items-center shrink-0">
              <div className="size-12 rounded border border-slate-300 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center">
                <div className="size-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-300 flex items-center justify-center">
                  <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-300">O</span>
                </div>
                <span className="text-[5.5px] text-muted-foreground/80 font-bold mt-0.5">ESTUDIANTE</span>
              </div>
              <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[6.5px] font-bold w-12 text-center tracking-wider">
                DNI 62345679
              </div>
            </div>

            {/* Datos Académicos */}
            <div className="flex-1 min-w-0 space-y-1">
              <div>
                <div className="text-[6.5px] font-bold uppercase text-slate-500 tracking-wider">
                  Apellidos y Nombres
                </div>
                <div className="text-[9.5px] font-black leading-tight text-slate-900 dark:text-white truncate">
                  CARRANZA VASQUEZ, OLIVER
                </div>
              </div>

              {/* Cardlet Grado & Nivel */}
              <div className="p-1 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[5.5px] font-bold text-slate-500 uppercase block">Aula / Sección</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-900 text-white text-[7px] font-black">
                    {previewAula}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[5.5px] font-bold text-slate-500 uppercase block">Nivel</span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 text-indigo-700 dark:text-indigo-300 text-[6.5px] font-extrabold">
                    PRIMARIA
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[6.5px] font-bold">
                <span className="text-indigo-600 dark:text-indigo-400">AÑO LECTIVO 2026</span>
                <span className="text-slate-400">Vigencia DIC 2026</span>
              </div>
            </div>

            {/* QR Box */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="p-1 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                <IconQrcode className="size-9 text-slate-900 dark:text-white" />
              </div>
              <div className="mt-1 px-1 py-0.5 rounded bg-indigo-600 text-white text-[5.5px] font-extrabold tracking-wide w-full text-center">
                CONTROL ASISTENCIA
              </div>
              <span className="text-[5px] text-slate-400 mt-0.5">ESCANEAR AL INGRESO</span>
            </div>
          </div>

          {/* Footer Carnet */}
          <div className="bg-[#090d16] text-white px-2 py-1 flex items-center justify-between text-[6.5px]">
            <span className="font-semibold text-slate-300">DOCUMENTO DE IDENTIFICACIÓN ESCOLAR</span>
            <span className="text-indigo-300 font-mono">CÓD: 1234567</span>
          </div>
        </div>
      </div>

      <div className="mt-3 p-2.5 rounded-lg bg-background/80 border border-border/40 text-[11px] text-muted-foreground space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Destino:</span>
          <span className="text-primary truncate max-w-[150px]">{previewAula}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Guías de corte:</span>
          <span className="font-medium text-foreground">Líneas punteadas de guillotina</span>
        </div>
      </div>
    </div>
  );
}
