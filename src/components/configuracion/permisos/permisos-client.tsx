"use client";

import { useState, useMemo } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  toggleCargoPermissionAction,
  toggleModulePermissionsAction,
  resetDefaultCargoPermissionsAction,
  getPermissionsMatrixAction,
} from "@/actions/permissions/permissions-actions";
import { CargoItem, PermisoItem } from "./permisos-types";
import { CargosSidebarSelector } from "./cargos-sidebar-selector";
import { CargoActiveBanner } from "./cargo-active-banner";
import { ModuloPermisosCard } from "./modulo-permisos-card";
import { ModulosTabsFilter, ModuloTabInfo } from "./modulos-tabs-filter";

interface PermisosClientProps {
  cargos: CargoItem[];
  permisos: PermisoItem[];
}

export function PermisosClient({
  cargos: initialCargos,
  permisos,
}: PermisosClientProps) {
  const [selectedCargoId, setSelectedCargoId] = useState<string>(
    initialCargos[0]?.id || ""
  );
  const [cargos, setCargos] = useState<CargoItem[]>(initialCargos);
  const [selectedModulo, setSelectedModulo] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedCargo =
    cargos.find((c) => c.id === selectedCargoId) || cargos[0];

  const activePermisoIds = useMemo(
    () => new Set(selectedCargo?.permisos.map((p) => p.permisoId) || []),
    [selectedCargo]
  );

  // Agrupar permisos por módulo
  const modulosMap = useMemo(() => {
    const map = new Map<string, PermisoItem[]>();
    permisos.forEach((p) => {
      const modKey = p.modulo || "General";
      const list = map.get(modKey) || [];
      list.push(p);
      map.set(modKey, list);
    });
    return map;
  }, [permisos]);

  // Información de cada tab con contadores
  const modulosTabs = useMemo<ModuloTabInfo[]>(() => {
    const totalActive = permisos.filter((p) => activePermisoIds.has(p.id)).length;
    const allTab: ModuloTabInfo = {
      id: "all",
      nombre: "Todos",
      totalCount: permisos.length,
      activeCount: totalActive,
    };

    const specificTabs: ModuloTabInfo[] = Array.from(modulosMap.entries()).map(
      ([modName, modPermisos]) => ({
        id: modName,
        nombre: modName,
        totalCount: modPermisos.length,
        activeCount: modPermisos.filter((p) => activePermisoIds.has(p.id)).length,
      })
    );

    return [allTab, ...specificTabs];
  }, [modulosMap, permisos, activePermisoIds]);

  // Filtrado de módulos según pestaña seleccionada y búsqueda
  const filteredModulos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result: [string, PermisoItem[]][] = [];

    modulosMap.forEach((modPermisos, modName) => {
      if (selectedModulo !== "all" && selectedModulo !== modName && !query) {
        return;
      }

      let matchedPermisos = modPermisos;
      if (query) {
        matchedPermisos = modPermisos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(query) ||
            p.codigo.toLowerCase().includes(query) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(query)) ||
            modName.toLowerCase().includes(query)
        );
      }

      if (matchedPermisos.length > 0) {
        result.push([modName, matchedPermisos]);
      }
    });

    return result;
  }, [modulosMap, selectedModulo, searchQuery]);

  // Alternar permiso individual
  const handleToggle = async (permisoId: string, active: boolean) => {
    if (!selectedCargo) return;

    setCargos((prev) =>
      prev.map((cargo) => {
        if (cargo.id !== selectedCargo.id) return cargo;
        let newPermisos = [...cargo.permisos];
        if (active) {
          const pData = permisos.find((p) => p.id === permisoId);
          newPermisos.push({
            permisoId,
            permiso: {
              id: permisoId,
              codigo: pData?.codigo || "",
              modulo: pData?.modulo || "",
            },
          });
        } else {
          newPermisos = newPermisos.filter((p) => p.permisoId !== permisoId);
        }
        return { ...cargo, permisos: newPermisos };
      })
    );

    try {
      const res = await toggleCargoPermissionAction({
        cargoId: selectedCargo.id,
        permisoId,
        active,
      });
      if (res.error) toast.error(res.error);
      else toast.success(active ? "Permiso habilitado" : "Permiso revocado");
    } catch {
      toast.error("Error al actualizar permiso");
    }
  };

  // Alternar todos los permisos de un módulo
  const handleToggleModule = async (permisoIds: string[], enableAll: boolean) => {
    if (!selectedCargo) return;
    setIsSaving(true);

    setCargos((prev) =>
      prev.map((cargo) => {
        if (cargo.id !== selectedCargo.id) return cargo;
        let newPermisos = cargo.permisos.filter(
          (p) => !permisoIds.includes(p.permisoId)
        );
        if (enableAll) {
          permisoIds.forEach((pid) => {
            const pData = permisos.find((p) => p.id === pid);
            newPermisos.push({
              permisoId: pid,
              permiso: {
                id: pid,
                codigo: pData?.codigo || "",
                modulo: pData?.modulo || "",
              },
            });
          });
        }
        return { ...cargo, permisos: newPermisos };
      })
    );

    try {
      const res = await toggleModulePermissionsAction({
        cargoId: selectedCargo.id,
        permisoIds,
        enableAll,
      });
      if (res.error) toast.error(res.error);
      else toast.success(enableAll ? "Módulo activado" : "Módulo desactivado");
    } catch {
      toast.error("Error al guardar módulo");
    } finally {
      setIsSaving(false);
    }
  };

  // Restablecer valores recomendados por defecto
  const handleResetDefaults = async () => {
    if (!selectedCargo) return;
    setIsSaving(true);
    try {
      const res = await resetDefaultCargoPermissionsAction({
        cargoId: selectedCargo.id,
        cargoCodigo: selectedCargo.codigo,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Plantilla aplicada a ${selectedCargo.nombre}`);
        const fresh = await getPermissionsMatrixAction({});
        if (fresh.success?.cargos) {
          setCargos(fresh.success.cargos as CargoItem[]);
        }
      }
    } catch {
      toast.error("No se pudo restablecer");
    } finally {
      setIsSaving(false);
    }
  };

  const totalFilteredCount = filteredModulos.reduce(
    (acc, [, pList]) => acc + pList.length,
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in duration-300 min-w-0">
      <CargosSidebarSelector
        cargos={cargos}
        selectedCargoId={selectedCargoId}
        onSelectCargo={setSelectedCargoId}
        totalPermisosCount={permisos.length}
      />

      <div className="flex-1 min-w-0 space-y-4">
        <CargoActiveBanner
          selectedCargo={selectedCargo}
          isSaving={isSaving}
          onResetDefaults={handleResetDefaults}
        />

        {/* Barra de Herramientas: Cabecera con Buscador y Tabs */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Módulos del Sistema
              </span>
              <Badge variant="outline" className="text-[10px] font-mono px-2 py-0 border-border/50">
                {totalFilteredCount} {totalFilteredCount === 1 ? "privilegio" : "privilegios"}
              </Badge>
            </div>

            <div className="relative w-full sm:w-64">
              <IconSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar privilegio o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 h-8 text-xs rounded-2xl bg-card border-border/60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <IconX size={13} />
                </button>
              )}
            </div>
          </div>

          <ModulosTabsFilter
            modulos={modulosTabs}
            selectedModulo={selectedModulo}
            onSelectModulo={setSelectedModulo}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Tarjetas de Módulos: En Grid de 2 Columnas o Foco Individual */}
        {filteredModulos.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border/60 rounded-3xl bg-card/50">
            <p className="text-xs text-muted-foreground">
              No se encontraron privilegios que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          <div
            className={
              selectedModulo === "all" && !searchQuery
                ? "grid grid-cols-1 xl:grid-cols-2 gap-4"
                : "grid grid-cols-1 gap-4"
            }
          >
            {filteredModulos.map(([modulo, modPermisos]) => (
              <ModuloPermisosCard
                key={modulo}
                modulo={modulo}
                permisos={modPermisos}
                activePermisoIds={activePermisoIds}
                onToggle={handleToggle}
                onToggleModule={handleToggleModule}
                isSaving={isSaving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
