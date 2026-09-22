"use client";

import Link from "next/link";
import {
  IconClock,
  IconChartBar,
  IconReceipt,
  IconShirt,
  IconId,
  IconFileCertificate,
} from "@tabler/icons-react";

interface QuickAccessGridProps {
  studentId: string;
}

export function QuickAccessGrid({ studentId }: QuickAccessGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      <Link
        href="/portal/horario"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconClock size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Horario</p>
          <p className="text-[10px] text-muted-foreground truncate">Clases de hoy</p>
        </div>
      </Link>

      <Link
        href="/portal/notas"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconChartBar size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Notas</p>
          <p className="text-[10px] text-muted-foreground truncate">Libreta CNEB</p>
        </div>
      </Link>

      <Link
        href="/portal/deudas"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconReceipt size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Pensiones</p>
          <p className="text-[10px] text-muted-foreground truncate">Pagos y recibos</p>
        </div>
      </Link>

      <Link
        href="/portal/uniformes"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconShirt size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Uniformes</p>
          <p className="text-[10px] text-muted-foreground truncate">Tienda escolar</p>
        </div>
      </Link>

      {/* Carnet Digital */}
      <a
        href={`/api/documentos/carnet?estudianteId=${studentId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconId size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Carnet</p>
          <p className="text-[10px] text-muted-foreground truncate">Con código QR</p>
        </div>
      </a>

      {/* Constancia de Matrícula */}
      <a
        href={`/api/documentos/constancia?estudianteId=${studentId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors shadow-2xs group"
      >
        <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <IconFileCertificate size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight">Constancia</p>
          <p className="text-[10px] text-muted-foreground truncate">PDF Oficial</p>
        </div>
      </a>
    </div>
  );
}
