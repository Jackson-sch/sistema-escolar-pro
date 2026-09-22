"use client";

import { useState, useMemo } from "react";
import {
  IconBrandWhatsapp,
  IconLoader2,
  IconRefresh,
  IconCircleCheck,
  IconSend,
  IconChecklist,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/formats";
import { DuePensionAlert } from "@/actions/alerts-center/types";
import { sendBulkPensionsAlertsAction } from "@/actions/alerts-center";
import { toast } from "sonner";

interface PensionsAlertsTabProps {
  pensionsData: {
    items: DuePensionAlert[];
    resumen: any;
  } | null;
  isLoading: boolean;
  diasAnticipacion: string;
  onDiasChange: (dias: string) => void;
  onRefresh: () => void;
}

export function PensionsAlertsTab({
  pensionsData,
  isLoading,
  diasAnticipacion,
  onDiasChange,
  onRefresh,
}: PensionsAlertsTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  const items = pensionsData?.items || [];
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const handleSendBulkPensions = async (canal: "WHATSAPP" | "EMAIL") => {
    if (selectedIds.length === 0) {
      toast.error("Seleccione al menos una pensión para notificar.");
      return;
    }

    setIsSendingBulk(true);
    try {
      const res = await sendBulkPensionsAlertsAction({
        cronogramaIds: selectedIds,
        canal,
      });

      if (res.success) {
        toast.success(res.mensaje || "Recordatorios enviados exitosamente");
        onRefresh();
      } else {
        toast.error(res.error || "Error al enviar recordatorios");
      }
    } catch {
      toast.error("Error al procesar el envío de recordatorios.");
    } finally {
      setIsSendingBulk(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── BARRA SUPERIOR DE ACCIONES Y FILTROS ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-foreground">
            Recordatorio Preventivo de Pensiones
          </h3>
          <p className="text-xs text-muted-foreground">
            Total por recaudar:{" "}
            <strong>
              S/ {pensionsData?.resumen.totalDeuda?.toFixed(2) || "0.00"}
            </strong>{" "}
            en {items.length} cuotas ({selectedIds.length} seleccionadas).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-medium">
              Anticipación:
            </span>
            <Select value={diasAnticipacion} onValueChange={onDiasChange}>
              <SelectTrigger className="w-32 h-8.5 rounded-xl text-xs font-bold border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="3">Próx. 3 días</SelectItem>
                <SelectItem value="5">Próx. 5 días</SelectItem>
                <SelectItem value="7">Próx. 7 días</SelectItem>
                <SelectItem value="30">Mes completo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8.5 rounded-xl text-xs font-bold gap-1 border-border/60 cursor-pointer"
          >
            <IconRefresh size={13} />
            <span>Actualizar</span>
          </Button>

          {items.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="h-8.5 rounded-xl text-xs font-bold gap-1.5 border-border/60 cursor-pointer"
              >
                <IconChecklist size={14} />
                <span>
                  {selectedIds.length === items.length
                    ? "Deseleccionar"
                    : "Todos"}
                </span>
              </Button>

              <Button
                size="sm"
                onClick={() => handleSendBulkPensions("WHATSAPP")}
                disabled={isSendingBulk || selectedIds.length === 0}
                className="h-8.5 rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-2xs"
              >
                {isSendingBulk ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconSend className="size-3.5" />
                )}
                <span>Notificar ({selectedIds.length})</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── LISTA DE CUOTAS POR VENCER ── */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 sm:p-5 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs font-semibold">
                Consultando cronograma de pensiones...
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <IconCircleCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                ¡Sin Cuotas Pendientes por Vencer!
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Todas las familias están al día para el periodo seleccionado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {items.map((item) => {
                const isSelected = selectedIdSet.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-3 transition-colors",
                      isSelected ? "bg-primary/5" : "hover:bg-muted/10",
                    )}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleSelect(item.id)}
                        className="mt-1"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-foreground truncate">
                            {item.nombreEstudiante}
                          </p>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold uppercase",
                              item.esVencido
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            )}
                          >
                            {item.esVencido
                              ? "Vencido"
                              : `Vence en ${item.diasRestantes}d`}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.concepto} · Saldo:{" "}
                          <strong className="text-foreground">
                            {formatCurrency(item.saldoPendiente)}
                          </strong>{" "}
                          · Vence: {formatDate(item.fechaVencimiento)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Apoderado: {item.apoderadoNombre} (
                          {item.apoderadoTelefono || "Sin teléfono"})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                      {item.whatsappDirectUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8 rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <a
                            href={item.whatsappDirectUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconBrandWhatsapp className="size-3.5" />
                            <span>WhatsApp Web</span>
                          </a>
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Sin Celular
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
