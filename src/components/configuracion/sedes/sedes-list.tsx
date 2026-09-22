"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SedeDialog } from "./sede-dialog";
import {
  IconPlus,
  IconSearch,
  IconBuilding,
} from "@tabler/icons-react";
import { deleteSedeAction, setSedePrincipalAction } from "@/actions/sedes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SedeMap } from "./sede-map";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { SedeCardItem } from "./sede-card-item";

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
            <SedeCardItem
              key={sede.id}
              sede={sede}
              isActive={activeSedeId === sede.id}
              onSelect={() => setActiveSedeId(sede.id)}
              onEdit={() => {
                setSelectedSede(sede);
                setOpen(true);
              }}
              onDelete={() => handleDelete(sede.id, sede.nombre)}
              onSetPrincipal={() =>
                setConfirmPrincipal({ id: sede.id, nombre: sede.nombre })
              }
            />
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
