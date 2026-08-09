"use client";

import { useState, useCallback, useEffect, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SedeDialog } from "./sede-dialog";
import {
  IconPlus,
  IconSearch,
  IconChevronRight,
  IconMapPin,
  IconMail,
  IconBuilding,
  IconStar,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import { deleteSedeAction, setSedePrincipalAction } from "@/actions/sedes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SedeMap } from "./sede-map";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface SedesListProps {
  initialData: any[];
}

export function SedesList({ initialData }: SedesListProps) {
  const [open, setOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSedeId, setActiveSedeId] = useState<string | undefined>(
    () => initialData.find((s) => s.esPrincipal)?.id || initialData[0]?.id,
  );
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [confirmPrincipal, setConfirmPrincipal] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingPrincipal, setIsSettingPrincipal] = useState(false);
  const router = useRouter();

  const handleSedeClick = useCallback((id: string) => {
    setActiveSedeId(id);
  }, []);

  // Detección de hidratación sin setState síncrono en el efecto
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const filteredSedes = initialData.filter(
    (sede) =>
      sede.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.direccion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sede.codigoIdentifier?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string, nombre: string) => {
    setConfirmDelete({ id, nombre });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    const res = await deleteSedeAction(confirmDelete.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Sede eliminada correctamente");
      router.refresh();
    }
    setIsDeleting(false);
    setConfirmDelete(null);
  };

  const executeSetPrincipal = async () => {
    if (!confirmPrincipal) return;
    setIsSettingPrincipal(true);
    const res = await setSedePrincipalAction(confirmPrincipal.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Sede establecida como principal");
      router.refresh();
    }
    setIsSettingPrincipal(false);
    setConfirmPrincipal(null);
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-220px)] lg:min-h-[600px] lg:max-h-[850px] border border-border/40 rounded-2xl lg:overflow-hidden bg-background/50 shadow-xl">
      {/* Sidebar List (40%) */}
      <aside className="w-full lg:w-[40%] flex flex-col border-b lg:border-b-0 lg:border-r border-border/40 bg-card/80 z-10">
        <div className="p-4 space-y-3 border-b border-border/30 bg-background/40">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Sedes Institucionales
            </h2>
            <Button
              size="sm"
              className="rounded-xl px-3.5 h-8 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer"
              onClick={() => {
                setSelectedSede(null);
                setOpen(true);
              }}
            >
              <IconPlus className="size-3.5" />
              <span>Nueva Sede</span>
            </Button>
          </div>

          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 lg:overflow-y-auto p-4 space-y-3 min-h-[400px]">
          {filteredSedes.map((sede) => (
            <div
              key={sede.id}
              onClick={() => setActiveSedeId(sede.id)}
              className={cn(
                "p-3.5 rounded-2xl cursor-pointer transition-colors border border-border/30 bg-background/40 hover:bg-background/80 group relative",
                activeSedeId === sede.id
                  ? "border-indigo-500/50 bg-indigo-500/10 shadow-xs"
                  : "hover:border-indigo-500/20",
                !sede.activo && "opacity-50",
              )}
            >
              <div className="flex gap-3">
                <div className="size-16 rounded-xl overflow-hidden shrink-0 relative border border-border/30 bg-muted/20">
                  {sede.logo ? (
                    <Image
                      alt={sede.nombre}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      src={sede.logo}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <IconBuilding className="size-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs text-foreground flex items-center gap-1.5 truncate">
                        <IconBuilding className="size-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{sede.nombre}</span>
                        {sede.esPrincipal && (
                          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1.5 py-0 rounded-md font-bold flex items-center gap-0.5">
                            <IconStar className="size-3 fill-amber-500 text-amber-500" />
                            Principal
                          </Badge>
                        )}
                      </h3>
                      {sede.codigoIdentifier && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-mono uppercase mt-0.5 inline-block">
                          Cod: {sede.codigoIdentifier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!sede.esPrincipal && (
                        <button
                          title="Establecer como Sede Principal"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmPrincipal({ id: sede.id, nombre: sede.nombre });
                          }}
                          className="p-1 hover:bg-amber-500/10 rounded-lg text-amber-500 transition-colors"
                        >
                          <IconStar className="size-3.5" />
                        </button>
                      )}
                      <button
                        title="Editar Sede"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSede(sede);
                          setOpen(true);
                        }}
                        className="p-1 hover:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                      >
                        <IconEdit className="size-3.5" />
                      </button>
                      <button
                        title="Eliminar Sede"
                        disabled={sede.esPrincipal}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sede.id, sede.nombre);
                        }}
                        className={cn(
                          "p-1 rounded-lg transition-colors",
                          sede.esPrincipal
                            ? "text-muted-foreground/30 cursor-not-allowed"
                            : "hover:bg-rose-500/10 text-rose-500",
                        )}
                      >
                        <IconTrash className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                    {sede.direccion && (
                      <div className="flex items-center gap-1.5 truncate">
                        <IconMapPin className="size-3 shrink-0 text-indigo-500" />
                        <span className="truncate">{sede.direccion}</span>
                      </div>
                    )}
                    {sede.email && (
                      <div className="flex items-center gap-1.5 truncate">
                        <IconMail className="size-3 shrink-0 text-indigo-500" />
                        <span className="truncate">{sede.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/20 flex justify-between items-center text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold">
                    Niveles: {sede.nivelesAcademicos?.length || 0}
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
                          <Badge
                            key={nombre}
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 rounded-md bg-indigo-500/10 text-indigo-600 border-none font-semibold"
                          >
                            {nombre}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver en mapa <IconChevronRight className="size-3" />
                </span>
              </div>
            </div>
          ))}

          {filteredSedes.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground/60">
              <IconBuilding className="size-10 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-semibold">No se encontraron sedes</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Map View (60%) */}
      <main className="hidden lg:block lg:flex-1 relative rounded-r-2xl bg-card/20 select-none">
        {isClient ? (
          <SedeMap
            sedes={initialData}
            activeSedeId={activeSedeId}
            onSedeClick={handleSedeClick}
          />
        ) : (
          <div className="w-full h-full bg-muted/10 animate-pulse rounded-2xl" />
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

      {/* Modal de Confirmación para Asignar Sede Principal */}
      <ConfirmModal
        isOpen={!!confirmPrincipal}
        onClose={() => setConfirmPrincipal(null)}
        onConfirm={executeSetPrincipal}
        title="Asignar como Sede Principal"
        description={`¿Desea establecer "${confirmPrincipal?.nombre}" como la Sede Principal? Esta acción actualizará los datos básicos de la institución con la dirección y contacto de esta sede.`}
        loading={isSettingPrincipal}
        variant="warning"
        confirmText="Establecer Principal"
      />

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Eliminar Sede"
        description={`¿Está seguro de eliminar la sede "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        loading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
