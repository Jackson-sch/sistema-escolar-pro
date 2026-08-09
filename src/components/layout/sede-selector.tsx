"use client";

import { useState, useTransition, useEffect } from "react";
import {
  IconBuildingStore,
  IconChevronDown,
  IconCheck,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getActiveSedeAction,
  setActiveSedeAction,
  SedeOption,
} from "@/actions/active-sede";

export function SedeSelector() {
  const [sedes, setSedes] = useState<SedeOption[]>([]);
  const [activeSede, setActiveSede] = useState<SedeOption | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchSedes = () => {
    startTransition(async () => {
      const res = await getActiveSedeAction();
      if (res.success && res.sedes) {
        setSedes(res.sedes);
        setActiveSede(res.activeSede || null);
      }
    });
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleSelectSede = (sede: SedeOption) => {
    if (activeSede?.id === sede.id) return;

    startTransition(async () => {
      const res = await setActiveSedeAction(sede.id);
      if (res.success) {
        setActiveSede(sede);
        toast.success(`Entorno cambiado a: ${sede.nombre}`, {
          description: "Los módulos ahora filtran por esta sede.",
        });
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  if (sedes.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          className="h-9 px-3 gap-2 rounded-xl bg-card border-border/50 hover:bg-accent hover:text-accent-foreground text-xs font-bold shadow-xs transition-colors"
        >
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconBuildingStore className="size-3.5" />
          </div>
          <div className="flex flex-col items-start text-left max-w-[130px] md:max-w-[170px] truncate">
            <span className="truncate text-foreground font-extrabold leading-tight text-[11px]">
              {activeSede?.nombre || "Cargando sede..."}
            </span>
            <span className="text-[9px] text-muted-foreground font-semibold leading-tight truncate">
              {activeSede?.id === "ALL"
                ? "Vista Consolidada"
                : activeSede?.esPrincipal
                ? "Sede Principal"
                : "Sede Operativa"}
            </span>
          </div>
          <IconChevronDown className="size-3.5 text-muted-foreground opacity-60 ml-0.5 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl bg-card border-border/50 p-2 shadow-md"
      >
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 px-2 py-1.5 flex items-center justify-between">
          <span>Sedes de la Institución</span>
          <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-md">
            {sedes.length} {sedes.length === 1 ? "sede" : "sedes"}
          </Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/30 my-1" />

        <div className="space-y-1">
          {sedes.length > 1 && (
            <>
              {(() => {
                const isAllSelected = activeSede?.id === "ALL";
                return (
                  <DropdownMenuItem
                    onClick={() =>
                      handleSelectSede({
                        id: "ALL",
                        nombre: "Todas las Sedes",
                        direccion: "Vista Consolidada",
                        esPrincipal: false,
                      })
                    }
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isAllSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`size-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                          isAllSelected
                            ? "bg-primary text-primary-foreground font-black"
                            : "bg-muted text-muted-foreground font-semibold"
                        }`}
                      >
                        *
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold truncate text-foreground">
                          Todas las Sedes
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate font-normal">
                          Vista Consolidada
                        </span>
                      </div>
                    </div>
                    {isAllSelected && <IconCheck className="size-4 text-primary shrink-0 ml-2" />}
                  </DropdownMenuItem>
                );
              })()}
              <DropdownMenuSeparator className="bg-border/30 my-1" />
            </>
          )}

          {sedes.map((sede) => {
            const isSelected = activeSede?.id === sede.id;

            return (
              <DropdownMenuItem
                key={sede.id}
                onClick={() => handleSelectSede(sede)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-black"
                        : "bg-muted text-muted-foreground font-semibold"
                    }`}
                  >
                    {sede.nombre[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold truncate text-foreground flex items-center gap-1">
                      {sede.nombre}
                      {sede.esPrincipal && (
                        <IconSparkles className="size-3 text-amber-500 shrink-0" />
                      )}
                    </span>
                    {sede.direccion && (
                      <span className="text-[10px] text-muted-foreground truncate flex items-center gap-1 font-normal">
                        <IconMapPin className="size-2.5 shrink-0" />
                        {sede.direccion}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && <IconCheck className="size-4 text-primary shrink-0 ml-2" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
