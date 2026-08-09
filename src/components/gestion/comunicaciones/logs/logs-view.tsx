"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  IconMail, 
  IconMessage, 
  IconBrandWhatsapp,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
  IconRefresh,
  IconSearch
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormModal } from "@/components/modals/form-modal";
import { toast } from "sonner";

interface LogsViewProps {
  initialData: any;
  currentPage: number;
  currentTipo: string;
  currentEstado: string;
}

export function LogsView({ 
  initialData, 
  currentPage, 
  currentTipo, 
  currentEstado 
}: LogsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Historial de auditoría actualizado");
    }, 600);
  };

  const { logs, total, totalPages } = initialData || { logs: [], total: 0, totalPages: 0 };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1");
    setLoading(true);
    router.push(`?${params.toString()}`);
    setLoading(false);
  };

  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    setLoading(true);
    router.push(`?${params.toString()}`);
    setLoading(false);
  };

  const filteredLogs = logs.filter((log: any) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      log.destinatario?.toLowerCase().includes(query) ||
      log.asunto?.toLowerCase().includes(query) ||
      log.mensaje?.toLowerCase().includes(query) ||
      log.user?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-xs">
        <div className="relative flex-1 max-w-sm w-full">
          <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
          <Input
            placeholder="Buscar por destinatario o asunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <Select 
            value={currentTipo} 
            onValueChange={(v) => updateFilters("tipo", v)}
          >
            <SelectTrigger className="rounded-xl bg-background border-border/40 h-9 text-xs font-medium w-[150px]">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="ALL" className="text-xs">Todos los Canales</SelectItem>
              <SelectItem value="EMAIL" className="text-xs">Correo Electrónico</SelectItem>
              <SelectItem value="SMS" className="text-xs">SMS de Texto</SelectItem>
              <SelectItem value="WHATSAPP" className="text-xs">WhatsApp</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={currentEstado} 
            onValueChange={(v) => updateFilters("estado", v)}
          >
            <SelectTrigger className="rounded-xl bg-background border-border/40 h-9 text-xs font-medium w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="ALL" className="text-xs">Cualquier Estado</SelectItem>
              <SelectItem value="SENT" className="text-xs">Enviados</SelectItem>
              <SelectItem value="FAILED" className="text-xs">Errores</SelectItem>
              <SelectItem value="PARTIAL" className="text-xs">Parciales</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl h-9 px-3 gap-1.5 border-border/40 text-xs font-semibold bg-background cursor-pointer"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
          >
            <IconRefresh className={cn("size-3.5", isRefreshing && "animate-spin text-indigo-500")} />
            <span>{isRefreshing ? "Actualizando..." : "Refrescar"}</span>
          </Button>
        </div>
      </div>

      {/* Tabla de Auditoría */}
      <Card className="border-border/40 overflow-hidden rounded-2xl bg-card/80 shadow-xl">
        <ScrollArea className="h-[calc(100vh-380px)]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-border/20">
                <TableHead className="w-[80px] h-10 px-4 text-xs font-semibold">Canal</TableHead>
                <TableHead className="h-10 text-xs font-semibold">Destinatario / Emisor</TableHead>
                <TableHead className="h-10 text-xs font-semibold">Asunto y Mensaje</TableHead>
                <TableHead className="h-10 text-xs font-semibold">Fecha y Hora</TableHead>
                <TableHead className="h-10 text-xs font-semibold">Estado</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-right px-4">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground/60">
                      <IconAlertTriangle className="size-8" />
                      <p className="text-xs font-semibold">No se encontraron registros de auditoría</p>
                      <p className="text-[11px]">Modifique los filtros o el criterio de búsqueda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log: any) => (
                  <TableRow 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-indigo-500/5 transition-colors border-border/20 cursor-pointer group"
                  >
                    <TableCell className="px-4">
                      <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center border",
                        log.tipo === "EMAIL" && "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
                        log.tipo === "SMS" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        log.tipo === "WHATSAPP" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      )}>
                        {log.tipo === "EMAIL" && <IconMail className="size-4" />}
                        {log.tipo === "SMS" && <IconMessage className="size-4" />}
                        {log.tipo === "WHATSAPP" && <IconBrandWhatsapp className="size-4" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-foreground max-w-[180px] truncate">
                        {log.destinatario}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Emisor: {log.user?.name || "Sistema"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="font-semibold text-xs truncate text-foreground">
                        {log.asunto || "Notificación de Alerta"}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {log.mensaje}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "rounded-md text-[10px] font-semibold px-2 py-0.5 border-none",
                          log.estado === "SENT" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          log.estado === "FAILED" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                          log.estado === "PARTIAL" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {log.estado === "SENT" ? "Enviado" : log.estado === "FAILED" ? "Fallido" : "Parcial"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-4">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="size-7 rounded-lg text-muted-foreground group-hover:text-indigo-600"
                      >
                        <IconInfoCircle className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border/30 flex items-center justify-between bg-background/50 text-xs">
            <p className="text-muted-foreground font-medium">
              Página <span className="text-foreground font-semibold">{currentPage}</span> de <span className="text-foreground font-semibold">{totalPages}</span> ({total} registros)
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8 px-2.5 border-border/40 text-xs"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <IconChevronLeft className="size-3.5 mr-1" /> Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-8 px-2.5 border-border/40 text-xs"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                Siguiente <IconChevronRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Detalle Técnico del Log */}
      {selectedLog && (
        <FormModal
          isOpen={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
          title={`Detalle de Notificación (${selectedLog.tipo})`}
          description={`ID: ${selectedLog.id}`}
          className="sm:max-w-[500px]"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-background/50 border border-border/40">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Destinatario</span>
                <p className="text-xs font-semibold text-foreground truncate">{selectedLog.destinatario}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Fecha de Despacho</span>
                <p className="text-xs font-semibold font-mono">
                  {format(new Date(selectedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-foreground/80">Asunto / Encabezado</span>
              <div className="p-3 rounded-xl bg-background/40 border border-border/30 text-xs font-semibold text-foreground">
                {selectedLog.asunto || "Sin asunto especificado"}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-foreground/80">Contenido del Mensaje</span>
              <div className="p-3 rounded-xl bg-background/40 border border-border/30 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {selectedLog.mensaje}
              </div>
            </div>

            {selectedLog.error && (
              <div className="space-y-1 min-w-0">
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <IconAlertTriangle className="size-3.5" /> Detalle del Error Técnico
                </span>
                <pre className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                  {(() => {
                    try {
                      const parsed = typeof selectedLog.error === "object" ? selectedLog.error : JSON.parse(selectedLog.error);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return selectedLog.error;
                    }
                  })()}
                </pre>
              </div>
            )}
          </div>
        </FormModal>
      )}
    </div>
  );
}
