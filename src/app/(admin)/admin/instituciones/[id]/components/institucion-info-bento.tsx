"use client";

import {
  IconMapPin,
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconUsers,
  IconSchool,
  IconCalendar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

interface InstitucionInfoBentoProps {
  inst: {
    direccion?: string | null;
    distrito: string;
    provincia: string;
    dre: string;
    ugel: string;
    email?: string | null;
    telefono?: string | null;
    _count: {
      users: number;
      niveles: number;
      sedes: number;
      periodos: number;
    };
  };
}

export function InstitucionInfoBento({ inst }: InstitucionInfoBentoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ubicación Geográfica */}
      <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <IconMapPin className="size-4" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Ubicación Geográfica
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Dirección
            </span>
            <span className="text-foreground font-medium mt-0.5 block">
              {inst.direccion || "No especificada"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Distrito
              </span>
              <span className="text-foreground font-medium mt-0.5 block">
                {inst.distrito}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Provincia
              </span>
              <span className="text-foreground font-medium mt-0.5 block">
                {inst.provincia}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Jerarquía y Contacto */}
      <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <div className="size-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <IconInfoCircle className="size-4" />
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Contacto & Jerarquía
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                DRE
              </span>
              <span className="text-foreground font-medium mt-0.5 block">
                {inst.dre}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                UGEL
              </span>
              <span className="text-foreground font-medium mt-0.5 block">
                {inst.ugel}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Email Institucional
            </span>
            <div className="flex items-center gap-1.5 text-foreground font-medium mt-0.5">
              <IconMail className="size-3.5 text-muted-foreground" />
              <span>{inst.email || "No registrado"}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
