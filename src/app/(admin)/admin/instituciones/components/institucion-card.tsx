"use client";

import Link from "next/link";
import Image from "next/image";
import {
  IconSchool,
  IconMapPin,
  IconHash,
  IconUsers,
  IconCalendarEvent,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InstitucionDeleteButton } from "./institucion-delete-button";

export interface InstitucionItem {
  id: string;
  logo?: string | null;
  nombreInstitucion: string;
  distrito: string;
  provincia: string;
  codigoModular: string;
  createdAt: string | Date;
  _count: { users: number };
}

export function InstitucionCard({ inst }: { inst: InstitucionItem }) {
  const isActiva = inst._count.users > 0;

  return (
    <Card className="group relative rounded-2xl border border-border/60 bg-card shadow-xs overflow-hidden flex flex-col justify-between transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
      {/* Header del Card */}
      <div className="p-5 border-b border-border/40 bg-muted/20 flex items-start justify-between">
        <div className="flex items-center gap-3.5">
          <div className="size-13 rounded-2xl bg-card border border-border/60 flex items-center justify-center relative overflow-hidden shadow-2xs">
            {inst.logo ? (
              <Image
                src={inst.logo}
                alt={inst.nombreInstitucion}
                width={40}
                height={40}
                className="size-10 object-contain rounded-xl"
              />
            ) : (
              <IconSchool className="size-6 text-primary/70" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {inst.nombreInstitucion}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <IconMapPin className="size-3.5 text-primary" />
              <span>
                {inst.distrito}, {inst.provincia}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <InstitucionDeleteButton
            instId={inst.id}
            instName={inst.nombreInstitucion}
          />
          <Badge
            variant="outline"
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 ${
              isActiva
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {isActiva ? "Activa" : "Configurando"}
          </Badge>
        </div>
      </div>

      {/* Métricas del Colegio */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Cód. Modular
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground mt-0.5">
              <IconHash className="size-3.5 text-primary" />
              <span>{inst.codigoModular}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/20 border border-border/40">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Comunidad
            </span>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground mt-0.5">
              <IconUsers className="size-3.5 text-primary" />
              <span>{inst._count.users} usuarios</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <IconCalendarEvent className="size-3.5 text-muted-foreground" />
            <span>
              Registrado {new Date(inst.createdAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })}
            </span>
          </div>

          <Link
            href={`/admin/instituciones/${inst.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline underline-offset-4 cursor-pointer"
          >
            <span>Detalles</span>
            <IconArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
