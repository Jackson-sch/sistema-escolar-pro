"use client";

import Link from "next/link";
import {
  IconDatabase,
  IconFileTypePdf,
  IconCloudCheck,
  IconShieldCheck,
  IconPlus,
  IconUserPlus,
  IconSchool,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    name: "Motor de Base de Datos PostgreSQL",
    icon: IconDatabase,
    status: "Operativo",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Generación de Boletas y Reportes PDF",
    icon: IconFileTypePdf,
    status: "100% Disponible",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Servicios de Almacenamiento & CDN",
    icon: IconCloudCheck,
    status: "Conectado",
    badgeClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
];

export function AdminSystemHealthBento() {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Estado General del Sistema */}
      <Card className="lg:col-span-8 p-6 rounded-2xl border border-border/60 bg-card shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IconShieldCheck className="size-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Estado de los Servicios de Infraestructura
                </h3>
                <p className="text-xs text-muted-foreground">
                  Monitoreo en tiempo real de componentes centrales
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            >
              Todos los sistemas OK
            </Badge>
          </div>

          <div className="space-y-3">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                      {s.name}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${s.badgeClass}`}
                  >
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Panel de Acciones Rápidas */}
      <Card className="lg:col-span-4 p-6 rounded-2xl border border-border/60 bg-card shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            Acciones Rápidas
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Operaciones directas de administración global
          </p>

          <div className="space-y-2.5">
            <Button
              asChild
              className="w-full justify-start gap-2 h-10 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/admin/instituciones">
                <IconSchool className="size-4" />
                <span>Explorar Colegios</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-2 h-10 rounded-xl text-xs font-bold border-border/60 hover:bg-muted/40"
            >
              <Link href="/admin/usuarios">
                <IconUserPlus className="size-4 text-primary" />
                <span>Registrar Director</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
          Superadmin autorizado para gestión multi-tenant.
        </div>
      </Card>
    </div>
  );
}
