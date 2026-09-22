"use client";

import { useEffect, useState } from "react";
import {
  IconBell,
  IconBellOff,
  IconBrandWhatsapp,
  IconMail,
  IconMessageDots,
  IconCheck,
  IconClockExclamation,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getAttendanceNotificationConfigAction,
  saveAttendanceNotificationConfigAction,
} from "@/actions/attendance";
import {
  type AttendanceNotificationConfig,
  DEFAULT_ATTENDANCE_NOTIF_CONFIG,
} from "./scanner-types";


interface ScannerNotificationSettingsPopoverProps {
  onConfigChange?: (config: AttendanceNotificationConfig) => void;
}

export function ScannerNotificationSettingsPopover({
  onConfigChange,
}: ScannerNotificationSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<AttendanceNotificationConfig>(
    DEFAULT_ATTENDANCE_NOTIF_CONFIG
  );

  useEffect(() => {
    let active = true;
    getAttendanceNotificationConfigAction()
      .then((res) => {
        if (!active) return;
        if (res.data) {
          setConfig(res.data);
          onConfigChange?.(res.data);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onConfigChange]);

  const handleToggleChannel = (channel: "WHATSAPP" | "EMAIL" | "SMS") => {
    setConfig((prev) => {
      const exists = prev.channels.includes(channel);
      const nextChannels = exists
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels: nextChannels };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveAttendanceNotificationConfigAction(config);
      if (res.success && res.data) {
        toast.success("Configuración de notificaciones actualizada");
        onConfigChange?.(res.data);
        setOpen(false);
      } else {
        toast.error(res.error || "No se pudo guardar la configuración");
      }
    } catch {
      toast.error("Error al conectar con el servidor");
    } finally {
      setIsSaving(false);
    }
  };

  const activeCount = config.channels.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl gap-1.5 text-xs font-semibold border-border/50 transition-all",
            config.enabled
              ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
              : "text-muted-foreground hover:bg-muted/40"
          )}
          title="Configurar Notificaciones Automáticas a Padres"
        >
          {config.enabled ? (
            <>
              <IconBell className="size-4 text-primary animate-bounce" />
              <span className="hidden sm:inline">Avisos a Padres</span>
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 h-4 bg-primary/20 text-primary font-bold rounded-md"
              >
                {activeCount} canales
              </Badge>
            </>
          ) : (
            <>
              <IconBellOff className="size-4 text-muted-foreground" />
              <span className="hidden sm:inline">Avisos Inactivos</span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-4 space-y-4 rounded-2xl border-border/60 shadow-xl bg-card text-foreground"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b border-border/30">
          <div>
            <h4 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <IconBell className="size-4 text-primary" />
              Alertas a Padres en Vivo
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Notificación inmediata al escanear QR
            </p>
          </div>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) =>
              setConfig((prev) => ({ ...prev, enabled: checked }))
            }
            disabled={isLoading || isSaving}
          />
        </div>

        {/* Canales de Envío */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Canales de Envío
          </Label>

          <div className="grid grid-cols-3 gap-2">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={() => handleToggleChannel("WHATSAPP")}
              disabled={!config.enabled || isSaving}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all",
                config.channels.includes("WHATSAPP") && config.enabled
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                  : "border-border/40 text-muted-foreground opacity-60 hover:opacity-100"
              )}
            >
              <IconBrandWhatsapp className="size-5 mb-1" />
              <span className="text-[10px]">WhatsApp</span>
            </button>

            {/* Email */}
            <button
              type="button"
              onClick={() => handleToggleChannel("EMAIL")}
              disabled={!config.enabled || isSaving}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all",
                config.channels.includes("EMAIL") && config.enabled
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                  : "border-border/40 text-muted-foreground opacity-60 hover:opacity-100"
              )}
            >
              <IconMail className="size-5 mb-1" />
              <span className="text-[10px]">Correo</span>
            </button>

            {/* SMS */}
            <button
              type="button"
              onClick={() => handleToggleChannel("SMS")}
              disabled={!config.enabled || isSaving}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all",
                config.channels.includes("SMS") && config.enabled
                  ? "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold shadow-xs"
                  : "border-border/40 text-muted-foreground opacity-60 hover:opacity-100"
              )}
            >
              <IconMessageDots className="size-5 mb-1" />
              <span className="text-[10px]">SMS</span>
            </button>
          </div>
        </div>

        {/* Reglas de Disparo */}
        <div className="space-y-2.5 pt-1">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Eventos a Notificar
          </Label>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/30 text-xs">
              <div className="flex items-center gap-2">
                <IconCheck className="size-4 text-emerald-500" />
                <span>Ingreso Puntual</span>
              </div>
              <Switch
                checked={config.notifyOnPuntual}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, notifyOnPuntual: checked }))
                }
                disabled={!config.enabled || isSaving}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/30 border border-border/30 text-xs">
              <div className="flex items-center gap-2">
                <IconClockExclamation className="size-4 text-amber-500" />
                <span>Ingreso con Tardanza</span>
              </div>
              <Switch
                checked={config.notifyOnTardanza}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({ ...prev, notifyOnTardanza: checked }))
                }
                disabled={!config.enabled || isSaving}
              />
            </div>
          </div>
        </div>

        {/* Footer con Botón Guardar */}
        <div className="pt-2 border-t border-border/30 flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="w-full rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            {isSaving && <IconLoader2 className="size-3.5 mr-1.5 animate-spin" />}
            Guardar Preferencias
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
