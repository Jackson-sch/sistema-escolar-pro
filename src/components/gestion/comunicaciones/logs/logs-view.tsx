"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  IconMail, 
  IconMessage, 
  IconCheck, 
  IconX, 
  IconAlertTriangle,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const { logs, total, totalPages } = initialData || { logs: [], total: 0, totalPages: 0 };

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1"); // Reset a página 1 al filtrar
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

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <IconFilter size={16} />
            Tipo de Notificación
          </label>
          <Select 
            value={currentTipo} 
            onValueChange={(v) => updateFilters("tipo", v)}
          >
            <SelectTrigger className="rounded-2xl bg-card/40 backdrop-blur-xl border-border/40 h-12">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="EMAIL">Correo Electrónico</SelectItem>
              <SelectItem value="SMS">SMS / Texto</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <IconCheck size={16} />
            Estado del Envío
          </label>
          <Select 
            value={currentEstado} 
            onValueChange={(v) => updateFilters("estado", v)}
          >
            <SelectTrigger className="rounded-2xl bg-card/40 backdrop-blur-xl border-border/40 h-12">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL">Cualquier Estado</SelectItem>
              <SelectItem value="SENT">Enviado con Éxito</SelectItem>
              <SelectItem value="FAILED">Fallo en Envío</SelectItem>
              <SelectItem value="PARTIAL">Parcial (SMS masivo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mb-1">
           <Button 
            variant="outline" 
            className="rounded-2xl h-11 px-4 gap-2 border-border/40 hover:bg-accent/50"
            onClick={() => router.refresh()}
            disabled={loading}
           >
             Actualizar
           </Button>
        </div>
      </div>

      {/* Tabla de Logs */}
      <Card className="border-border/40 overflow-hidden rounded-[2.5rem] bg-card/20 backdrop-blur-md shadow-2xl">
        <ScrollArea className="h-[calc(100vh-400px)]">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="hover:bg-transparent border-border/20">
                <TableHead className="w-[100px] h-14 px-6">Tipo</TableHead>
                <TableHead className="h-14">Destinatario</TableHead>
                <TableHead className="h-14">Contenido / Asunto</TableHead>
                <TableHead className="h-14">Fecha y Hora</TableHead>
                <TableHead className="h-14">Estado</TableHead>
                <TableHead className="h-14 text-right px-6">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
                      <IconAlertTriangle size={48} stroke={1.5} />
                      <p className="text-lg font-medium">No se encontraron registros de comunicaciones</p>
                      <p className="text-sm">Intente cambiar los filtros o espere a nuevos envíos.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow 
                    key={log.id} 
                    className="hover:bg-primary/5 transition-colors border-border/10 group"
                  >
                    <TableCell className="px-6">
                      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/30 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {log.tipo === "EMAIL" ? <IconMail size={20} /> : <IconMessage size={20} />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground/90 max-w-[200px] truncate">
                        {log.destinatario}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {log.user?.role ? `${log.user.name} (${log.user.role})` : "Sistema"}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="font-medium truncate">
                        {log.asunto || "Sin asunto"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate italic">
                        {log.mensaje}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-medium">
                      {format(new Date(log.createdAt), "dd MMM, HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "rounded-xl gap-1.5 py-1 pr-3 shadow-none border-none",
                          log.estado === "SENT" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          log.estado === "FAILED" && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                          log.estado === "PARTIAL" && "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          log.estado === "SENT" && "bg-emerald-500",
                          log.estado === "FAILED" && "bg-rose-500",
                          log.estado === "PARTIAL" && "bg-amber-500"
                        )} />
                        {log.estado === "SENT" ? "Enviado" : log.estado === "FAILED" ? "Error" : "Parcial"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        title={log.error || "Sin error reportado"}
                      >
                        <IconExternalLink size={18} />
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
          <div className="p-6 border-t border-border/20 flex items-center justify-between bg-muted/10">
            <p className="text-sm text-muted-foreground font-medium">
              Mostrando página <span className="text-foreground">{currentPage}</span> de <span className="text-foreground">{totalPages}</span> — {total} registros en total
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border/40"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                <IconChevronLeft size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border/40"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                <IconChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-[2rem] bg-indigo-500/5 border-indigo-500/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-600">
            <IconExternalLink size={24} />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Auditoría Transparente</h4>
            <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70">
              Todos los intentos de comunicación con padres y estudiantes son registrados para asegurar que la información crítica siempre llegue a su destino.
            </p>
          </div>
        </Card>
        <Card className="p-6 rounded-[2rem] bg-rose-500/5 border-rose-500/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-600">
            <IconAlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-rose-900 dark:text-rose-100">Gestión de Errores</h4>
            <p className="text-sm text-rose-700/70 dark:text-rose-400/70">
              Si un mensaje falla, podrá ver el motivo técnico posicionando el cursor sobre el ícono de acción en la fila correspondiente.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
