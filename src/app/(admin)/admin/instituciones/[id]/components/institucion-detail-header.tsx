"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconSchool,
  IconChevronLeft,
  IconFingerprint,
  IconCalendar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InstitucionDetailHeaderProps {
  inst: {
    nombreInstitucion: string;
    logo?: string | null;
    codigoModular: string;
    createdAt: string | Date;
    _count: { users: number };
  };
}

export function InstitucionDetailHeader({
  inst,
}: InstitucionDetailHeaderProps) {
  const isActiva = inst._count.users > 0;

  return (
    <div className="space-y-4">
      {/* Botón de retorno y título */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/instituciones"
          className="size-9 rounded-xl border border-border/60 bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
        >
          <IconChevronLeft className="size-4.5" />
        </Link>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {inst.nombreInstitucion}
          </h1>
          <p className="text-xs text-muted-foreground">
            Ficha institucional y supervisión de sede.
          </p>
        </div>
      </div>

      {/* Tarjeta de Encabezado Principal */}
      <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-muted/30 border border-border/60 flex items-center justify-center relative overflow-hidden shadow-2xs">
              {inst.logo ? (
                <Image
                  src={inst.logo}
                  alt={inst.nombreInstitucion}
                  fill
                  sizes="64px"
                  className="size-12 object-contain p-1"
                />
              ) : (
                <IconSchool className="size-8 text-primary/70" />
              )}
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground">
                {inst.nombreInstitucion}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconFingerprint className="size-3.5 text-primary" />
                  <span className="font-mono font-bold text-foreground">
                    Cód. Modular: {inst.codigoModular}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <IconCalendar className="size-3.5 text-muted-foreground" />
                  <span>
                    Registrado {new Date(inst.createdAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Badge
              variant="outline"
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 ${
                isActiva
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              }`}
            >
              {isActiva ? "Sede Activa" : "En Configuración"}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
