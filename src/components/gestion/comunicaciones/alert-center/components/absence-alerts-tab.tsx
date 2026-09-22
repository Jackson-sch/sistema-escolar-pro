"use client";

import { useMemo } from "react";
import {
  IconBrandWhatsapp,
  IconLoader2,
  IconRefresh,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";
import { AbsentStudentAlert } from "@/actions/alerts-center/types";

interface AbsenceAlertsTabProps {
  absenceData: {
    fecha: string;
    items: AbsentStudentAlert[];
    resumen: any;
  } | null;
  isLoading: boolean;
  selectedIds: string[];
  isSending: boolean;
  onRefresh: () => void;
  onSendBulk: () => void;
  onToggleSelect: (id: string) => void;
}

export function AbsenceAlertsTab({
  absenceData,
  isLoading,
  selectedIds,
  isSending,
  onRefresh,
  onSendBulk,
  onToggleSelect,
}: AbsenceAlertsTabProps) {
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <div className="space-y-4">
      {/* Header de Acción Rápida */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-foreground">
              Control Matutino de Inasistencias
            </h3>
            <Badge variant="outline" className="text-[10px] font-mono" suppressHydrationWarning>
              {absenceData?.fecha || formatDate(new Date())}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Se detectaron <strong>{absenceData?.items.length || 0}</strong>{" "}
            ausencias/tardanzas registradas en el parte del día.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 rounded-xl text-xs font-bold gap-1 border-border/60 cursor-pointer"
          >
            <IconRefresh
              className={cn("size-3.5", isLoading && "animate-spin text-primary")}
            />
            <span>Actualizar</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onSendBulk}
            disabled={isSending || selectedIds.length === 0}
            className="h-9 rounded-xl text-xs font-extrabold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
          >
            {isSending ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconBrandWhatsapp className="size-4" />
            )}
            <span>Notificar Ausencias ({selectedIds.length})</span>
          </Button>
        </div>
      </div>

      {/* Lista de Alumnos Ausentes */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Padrón de Estudiantes Ausentes</span>
            <span className="text-xs text-muted-foreground font-normal">
              Haz clic en el botón de WhatsApp para abrir el chat directo con el
              apoderado
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
              <IconLoader2 className="size-5 animate-spin text-primary" />
              <span className="text-xs font-semibold">
                Consultando registro de asistencia...
              </span>
            </div>
          ) : absenceData?.items.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                <IconCircleCheck className="size-6" />
              </div>
              <h4 className="text-sm font-bold text-foreground">
                ¡100% de Asistencia Registrada!
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No se han registrado inasistencias ni tardanzas para la fecha de
                hoy.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {absenceData?.items.map((item) => {
                const isSelected = selectedIdSet.has(item.id);
                const isFalta = item.tipoFalta === "INASISTENCIA";

                return (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(item.id)}
                        aria-label={`Seleccionar ${item.nombreCompleto}`}
                        className="size-4 rounded-md border-border/60 text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <Avatar className="size-9 rounded-xl shrink-0">
                        <AvatarImage src={item.image} />
                        <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                          {item.nombreCompleto?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-foreground truncate">
                            {item.nombreCompleto}
                          </p>
                          <Badge
                            className={cn(
                              "text-[9px] font-bold uppercase",
                              isFalta
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                            )}
                          >
                            {isFalta ? "Inasistencia" : "Tardanza"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.aula} · Apoderado: {item.apoderadoNombre} (
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
                          className="h-8.5 rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <a
                            href={item.whatsappDirectUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconBrandWhatsapp className="size-3.5" />
                            <span>WhatsApp Directo</span>
                          </a>
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-muted-foreground"
                        >
                          Sin Teléfono
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
