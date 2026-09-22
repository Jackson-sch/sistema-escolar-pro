"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PermisoItem, MODULE_THEMES } from "./permisos-types";

interface ModuloPermisosCardProps {
  modulo: string;
  permisos: PermisoItem[];
  activePermisoIds: Set<string>;
  onToggle: (permisoId: string, active: boolean) => void;
  onToggleModule: (permisoIds: string[], enableAll: boolean) => void;
  isSaving: boolean;
}

export function ModuloPermisosCard({
  modulo,
  permisos,
  activePermisoIds,
  onToggle,
  onToggleModule,
  isSaving,
}: ModuloPermisosCardProps) {
  const theme = MODULE_THEMES[modulo] || MODULE_THEMES.Académico;
  const ModuleIcon = theme.icon;

  const activeCount = permisos.filter((p) => activePermisoIds.has(p.id)).length;
  const allActive = activeCount === permisos.length;
  const noneActive = activeCount === 0;

  const permisoIds = permisos.map((p) => p.id);

  return (
    <Card
      className={cn(
        "rounded-3xl border transition-all duration-200 bg-card/90 backdrop-blur-md shadow-xs overflow-hidden flex flex-col",
        theme.border
      )}
    >
      {/* Cabecera del Módulo */}
      <div className="p-3.5 sm:p-4 border-b border-border/40 flex items-center justify-between gap-2 flex-wrap bg-muted/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "size-8 sm:size-9 rounded-xl flex items-center justify-center border shadow-xs shrink-0",
              theme.badgeBg,
              theme.border,
              theme.accent
            )}
          >
            <ModuleIcon size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight truncate">
              {modulo}
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {activeCount} de {permisos.length} concedidos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full text-[9px] font-bold px-2 py-0 border",
              allActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : noneActive
                  ? "bg-muted text-muted-foreground border-border/40"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            )}
          >
            {allActive ? "Completo" : noneActive ? "Sin Acceso" : "Parcial"}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            disabled={isSaving}
            onClick={() => onToggleModule(permisoIds, !allActive)}
            className="h-6 px-2 text-[10px] font-bold text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
          >
            {allActive ? "Desactivar" : "Activar todo"}
          </Button>
        </div>
      </div>

      {/* Lista de permisos compacta */}
      <CardContent className="p-3.5 sm:p-4 divide-y divide-border/20 flex-1">
        {permisos.map((permiso) => {
          const isChecked = activePermisoIds.has(permiso.id);

          return (
            <div
              key={permiso.id}
              className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {permiso.nombre}
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] px-1 py-0 border-border/40 text-muted-foreground rounded"
                  >
                    {permiso.codigo}
                  </Badge>
                </div>
                {permiso.descripcion && (
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1 group-hover:line-clamp-none transition-all">
                    {permiso.descripcion}
                  </p>
                )}
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider hidden sm:inline-block",
                    isChecked ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {isChecked ? "Activo" : "No"}
                </span>
                <Switch
                  checked={isChecked}
                  disabled={isSaving}
                  onCheckedChange={(checked) => onToggle(permiso.id, checked)}
                  className="scale-90 cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
