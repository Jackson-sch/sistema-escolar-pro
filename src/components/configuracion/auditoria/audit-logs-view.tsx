"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  IconShieldCheck,
  IconSearch,
  IconRefresh,
  IconClipboardCheck,
  IconUserCheck,
  IconShieldLock,
  IconReceipt2,
  IconCalendar,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAuditLogsAction } from "@/actions/audit";
import type { Prisma } from "@prisma/client";

interface AuditLog {
  id: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  usuarioEmail: string | null;
  accion: string;
  entidad: string;
  entidadId: string | null;
  detalles: Prisma.JsonValue | null;
  createdAt: Date | string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const DEFAULT_PAGINATION: PaginationInfo = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

const INFO_CARDS = [
  {
    title: "Notas & Evaluaciones",
    entidadKey: "Nota",
    icon: IconClipboardCheck,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    description:
      "Registra modificaciones de calificaciones masivas o individuales e ingreso de competencias.",
  },
  {
    title: "Estudiantes & Familias",
    entidadKey: "Estudiante",
    icon: IconUserCheck,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    description:
      "Trazabilidad en matrículas, cambio de datos personales y asignaciones de tutores.",
  },
  {
    title: "Personal & Permisos",
    entidadKey: "Staff",
    icon: IconShieldLock,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    description:
      "Control de altas de personal, asignación de roles, permisos y accesos al sistema.",
  },
  {
    title: "Finanzas & Cobranzas",
    entidadKey: "Pago",
    icon: IconReceipt2,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    description:
      "Historial de pagos registrados, vouchers procesados y becas o descuentos aplicados.",
  },
];

function getBadgeVariant(accion: string) {
  switch (accion) {
    case "CREATE":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
    case "UPDATE":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
    case "DELETE":
      return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400";
    case "LOGIN":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:text-gray-400";
  }
}

function formatLogDate(iso: string | Date): string {
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  });
}

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] =
    useState<PaginationInfo>(DEFAULT_PAGINATION);

  const [entidadFilter, setEntidadFilter] = useState("ALL");
  const [accionFilter, setAccionFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const fetchLogs = useCallback(
    (page = 1) => {
      startTransition(async () => {
        const res = await getAuditLogsAction({
          entidad: entidadFilter,
          accion: accionFilter,
          page,
          limit: 20,
        });

        if (res.success && res.data) {
          setLogs(res.data);
          setPagination(res.pagination || DEFAULT_PAGINATION);
        } else if (res.error) {
          toast.error(res.error);
        }
      });
    },
    [entidadFilter, accionFilter],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.usuarioNombre?.toLowerCase().includes(term) ||
      log.usuarioEmail?.toLowerCase().includes(term) ||
      log.entidad.toLowerCase().includes(term) ||
      log.accion.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-300">
      <AuditLogsHeader
        isPending={isPending}
        onRefresh={() => fetchLogs(pagination.page)}
      />

      <ModuleInfoCards
        entidadFilter={entidadFilter}
        onSelect={(entidadKey) =>
          setEntidadFilter(entidadFilter === entidadKey ? "ALL" : entidadKey)
        }
      />

      <AuditLogsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        entidadFilter={entidadFilter}
        onEntidadChange={setEntidadFilter}
        accionFilter={accionFilter}
        onAccionChange={setAccionFilter}
      />

      <AuditLogsTable
        logs={filteredLogs}
        isPending={isPending}
        pagination={pagination}
        onPageChange={(page) => fetchLogs(page)}
      />
    </div>
  );
}

/* ── Subcomponentes ── */

function AuditLogsHeader({
  isPending,
  onRefresh,
}: {
  isPending: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <IconShieldCheck className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Bitácora de Auditoría & Trazabilidad
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Supervisión en tiempo real de operaciones críticas, seguridad e
            historial inmutable del colegio
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isPending}
        className="rounded-xl gap-2 h-9 text-xs font-bold border-border/50 bg-background"
      >
        <IconRefresh className={`size-4 ${isPending ? "animate-spin" : ""}`} />
        Actualizar
      </Button>
    </div>
  );
}

function ModuleInfoCards({
  entidadFilter,
  onSelect,
}: {
  entidadFilter: string;
  onSelect: (entidadKey: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {INFO_CARDS.map((card) => {
        const Icon = card.icon;
        const isSelected = entidadFilter === card.entidadKey;

        return (
          <button
            key={card.title}
            type="button"
            onClick={() => onSelect(card.entidadKey)}
            className={`group relative w-full p-4 rounded-2xl border text-left transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer ${
              isSelected
                ? "bg-primary/5 border-primary/40 shadow-xs"
                : "bg-card/80 border-border/50 hover:border-border shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div
                className={`size-9 rounded-xl flex items-center justify-center border ${card.color}`}
              >
                <Icon className="size-5" />
              </div>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase tracking-wider rounded-md border-border/40"
              >
                {isSelected ? "Filtrado" : "Ver módulo"}
              </Badge>
            </div>
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {card.title}
            </h3>
            <p className="text-[11px] text-muted-foreground font-normal leading-relaxed mt-1">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function AuditLogsFilters({
  searchTerm,
  onSearchChange,
  entidadFilter,
  onEntidadChange,
  accionFilter,
  onAccionChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  entidadFilter: string;
  onEntidadChange: (value: string) => void;
  accionFilter: string;
  onAccionChange: (value: string) => void;
}) {
  return (
    <div className="bg-card/80 border border-border/50 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="w-full sm:w-80">
        <InputGroup className="bg-background rounded-xl border-border/50">
          <InputGroupAddon align="inline-start">
            <IconSearch className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Buscar por usuario o acción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-xs"
          />
        </InputGroup>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Entidad Filter */}
        <Select value={entidadFilter} onValueChange={onEntidadChange}>
          <SelectTrigger className="w-full sm:w-44 h-9 text-xs rounded-xl bg-background border-border/50 font-medium">
            <SelectValue placeholder="Entidad" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">Todas las entidades</SelectItem>
            <SelectItem value="Nota">Notas / Calificaciones</SelectItem>
            <SelectItem value="Estudiante">Estudiantes</SelectItem>
            <SelectItem value="Staff">Personal / Usuarios</SelectItem>
            <SelectItem value="Pago">Pagos & Finanzas</SelectItem>
          </SelectContent>
        </Select>

        {/* Accion Filter */}
        <Select value={accionFilter} onValueChange={onAccionChange}>
          <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl bg-background border-border/50 font-medium">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="ALL">Todas las acciones</SelectItem>
            <SelectItem value="CREATE">Creación</SelectItem>
            <SelectItem value="UPDATE">Modificación</SelectItem>
            <SelectItem value="DELETE">Eliminación</SelectItem>
            <SelectItem value="LOGIN">Inicio de sesión</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AuditLogsTable({
  logs,
  isPending,
  pagination,
  onPageChange,
}: {
  logs: AuditLog[];
  isPending: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/40 border-b border-border/50 font-black uppercase text-muted-foreground/70 tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Fecha / Hora</th>
              <th className="px-5 py-3.5">Usuario</th>
              <th className="px-5 py-3.5">Acción</th>
              <th className="px-5 py-3.5">Entidad / Módulo</th>
              <th className="px-5 py-3.5">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30 font-medium">
            {isPending ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  Cargando registros de auditoría...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-12 text-center text-muted-foreground"
                >
                  No se encontraron registros de auditoría.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground/80">
                      <IconCalendar className="size-3.5 text-muted-foreground/60" />
                      {formatLogDate(log.createdAt)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                        {log.usuarioNombre?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {log.usuarioNombre || "Usuario Sistema"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {log.usuarioEmail || log.usuarioId || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge
                      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-lg border ${getBadgeVariant(log.accion)}`}
                    >
                      {log.accion}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-foreground">
                    {log.entidad}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate">
                    {log.detalles ? JSON.stringify(log.detalles) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/50 bg-muted/20 text-xs font-semibold">
        <div className="text-muted-foreground">
          Mostrando página {pagination.page} de {pagination.totalPages} (
          {pagination.total} registros totales)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || isPending}
            onClick={() => onPageChange(pagination.page - 1)}
            className="h-8 rounded-lg text-xs"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || isPending}
            onClick={() => onPageChange(pagination.page + 1)}
            className="h-8 rounded-lg text-xs"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
