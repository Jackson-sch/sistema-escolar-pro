"use client";

import { IconRotateClockwise, IconShieldLock, IconInfoCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CargoItem } from "./permisos-types";

interface CargoActiveBannerProps {
  selectedCargo: CargoItem | undefined;
  isSaving: boolean;
  onResetDefaults: () => void;
}

export function CargoActiveBanner({
  selectedCargo,
  isSaving,
  onResetDefaults,
}: CargoActiveBannerProps) {
  return (
    <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-xs backdrop-blur-md p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <IconShieldLock size={12} />
              Perfil de Acceso
            </Badge>
            <Badge
              variant="outline"
              className="font-mono text-[10px] border-border/60 text-muted-foreground rounded-full"
            >
              ID: {selectedCargo?.codigo}
            </Badge>
            <Badge
              variant="secondary"
              className="text-[10px] font-medium px-2 py-0 rounded-full"
            >
              {selectedCargo?._count.usuarios || 0} usuarios asignados
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {selectedCargo?.nombre}
          </h2>

          <p className="text-xs text-muted-foreground">
            {selectedCargo?.descripcion ||
              "Configuración de privilegios de acceso para este puesto en la institución."}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isSaving}
          onClick={onResetDefaults}
          className="rounded-2xl h-9 px-4 text-xs font-bold border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer shrink-0 shadow-xs"
        >
          <IconRotateClockwise
            size={14}
            className={isSaving ? "animate-spin" : ""}
          />
          <span>Restablecer Recomendados</span>
        </Button>
      </div>

      <div className="mt-4 pt-3.5 border-t border-border/40 flex items-center gap-2 text-[11px] text-muted-foreground">
        <IconInfoCircle size={14} className="text-primary shrink-0" />
        <span>
          Los cambios se guardan al instante y aplican inmediatamente a los colaboradores con cargo de{" "}
          <strong>{selectedCargo?.nombre}</strong>.
        </span>
      </div>
    </Card>
  );
}
