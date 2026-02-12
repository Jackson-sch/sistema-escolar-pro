"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SedeDialog } from "./sede-dialog";
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconSettings,
  IconChevronRight,
  IconMapPin,
  IconMail,
  IconPhone,
  IconBuilding,
  IconStar,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { deleteSedeAction } from "@/actions/sedes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SedeMap } from "./sede-map";
import { cn } from "@/lib/utils";

interface SedesListProps {
  initialData: any[];
}

export function SedesList({ initialData }: SedesListProps) {
  const [open, setOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSedeId, setActiveSedeId] = useState<string | undefined>(
    initialData.find((s) => s.esPrincipal)?.id || initialData[0]?.id,
  );
  const router = useRouter();

  const handleSedeClick = useCallback((id: string) => {
    setActiveSedeId(id);
  }, []);

  // Client-side mount guard for the map
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const filteredSedes = initialData.filter(
    (sede) =>
      sede.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.direccion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.codigoIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: string, nombre: string) => {
    if (
      confirm(
        `¿Está seguro de eliminar la sede "${nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      const res = await deleteSedeAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Sede eliminada correctamente");
        router.refresh();
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-200px)] lg:min-h-[600px] lg:max-h-[850px] border border-border/40 rounded-3xl lg:overflow-hidden bg-background/50 backdrop-blur-sm shadow-2xl">
      {/* Sidebar List (40%) */}
      <aside className="w-full lg:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r-0 border-border/40 bg-card/20 z-10 transition-all duration-300">
        <div className="p-6 space-y-4 border-b border-border/40 bg-background/30">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-bold tracking-tight">
              Sedes Institucionales
            </h2>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
              onClick={() => {
                setSelectedSede(null);
                setOpen(true);
              }}
            >
              <IconPlus className="h-3.5 w-3.5" strokeWidth={3} />
              Nueva Sede
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 glass h-11 rounded-2xl flex items-center px-4 gap-3 focus-within:ring-2 ring-primary/40 transition-all">
              <IconSearch className="h-4 w-4 text-muted-foreground" />
              <input
                className="bg-transparent border-none outline-none focus:ring-0 text-sm w-full placeholder:text-muted-foreground/60"
                placeholder="Buscar por nombre, código..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 glass h-11 px-4 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
              <IconFilter className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-5 space-y-4 min-h-[400px]">
          {filteredSedes.map((sede) => (
            <div
              key={sede.id}
              onClick={() => setActiveSedeId(sede.id)}
              className={cn(
                "glass p-4 rounded-2xl cursor-pointer transition-all duration-300 group hover:scale-[1.01] border-l-4",
                activeSedeId === sede.id
                  ? "active-card border-l-primary scale-[1.01]"
                  : "border-l-transparent hover:border-l-primary/30",
                !sede.activo && "opacity-60",
              )}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 relative border border-border/20">
                  {sede.logo ? (
                    <img
                      alt={sede.nombre}
                      className="w-full h-full object-cover"
                      src={sede.logo}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <IconBuilding className="h-8 w-8 text-primary/30" />
                    </div>
                  )}
                  {sede.esPrincipal && (
                    <div className="absolute inset-0 bg-primary/5"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg flex items-center gap-2 truncate">
                        <IconBuilding className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">{sede.nombre}</span>
                        {sede.esPrincipal && (
                          <IconStar className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </h3>
                      {sede.codigoIdentifier && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-foreground/5 text-muted-foreground font-mono uppercase">
                          Cod: {sede.codigoIdentifier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSede(sede);
                          setOpen(true);
                        }}
                        className="p-1.5 hover:bg-primary/10 rounded-lg text-blue-500 transition-colors"
                      >
                        <IconEdit className="h-4 w-4" />
                      </button>
                      <button
                        disabled={sede.esPrincipal}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sede.id, sede.nombre);
                        }}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          sede.esPrincipal
                            ? "text-muted-foreground/30"
                            : "hover:bg-red-500/10 text-red-500",
                        )}
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {sede.direccion && (
                      <div className="flex items-center gap-2 truncate">
                        <IconMapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{sede.direccion}</span>
                      </div>
                    )}
                    {sede.email && (
                      <div className="flex items-center gap-2 truncate">
                        <IconMail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{sede.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/20 flex justify-between items-center text-[11px] text-muted-foreground/60">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">
                    Niveles asociados: {sede.nivelesAcademicos?.length || 0}
                  </span>
                  {sede.nivelesAcademicos?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Array.from(
                        new Set(
                          sede.nivelesAcademicos.map(
                            (na: any) => na.nivel?.nombre,
                          ),
                        ),
                      )
                        .filter(Boolean)
                        .map((nombre: any) => (
                          <span
                            key={nombre}
                            className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary/70 border border-primary/10"
                          >
                            {nombre}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <span className="text-primary font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver detalles{" "}
                  <IconChevronRight className="h-3 w-3" strokeWidth={3} />
                </span>
              </div>
            </div>
          ))}

          {filteredSedes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <IconBuilding className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">
                No se encontraron sedes
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Map View (60%) */}
      <main className="hidden lg:block lg:flex-1 relative rounded-r-3xl bg-card/20 select-none">
        {isClient ? (
          <SedeMap
            sedes={initialData}
            activeSedeId={activeSedeId}
            onSedeClick={handleSedeClick}
          />
        ) : (
          <div className="w-full h-full bg-muted/10 animate-pulse rounded-3xl" />
        )}
      </main>

      <SedeDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setSelectedSede(null);
        }}
        sede={selectedSede}
      />
    </div>
  );
}
