"use client";

import { useState } from "react";
import {
  IconSend,
  IconBrandWhatsapp,
  IconMail,
  IconMessage2,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { sendBroadcastMessageAction } from "@/actions/alerts-center";
import { toast } from "sonner";

interface BroadcastTabProps {
  targetScope: string;
  onTargetScopeChange: (scope: string) => void;
  customSubject: string;
  onCustomSubjectChange: (subject: string) => void;
  customMessage: string;
  onCustomMessageChange: (message: string) => void;
  isSending?: boolean;
}

export function BroadcastTab({
  targetScope,
  onTargetScopeChange,
  customSubject,
  onCustomSubjectChange,
  customMessage,
  onCustomMessageChange,
}: BroadcastTabProps) {
  const [channels, setChannels] = useState<("WHATSAPP" | "SMS" | "EMAIL")[]>([
    "WHATSAPP",
    "EMAIL",
  ]);
  const [isSendingLocal, setIsSendingLocal] = useState(false);

  const toggleChannel = (ch: "WHATSAPP" | "SMS" | "EMAIL") => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  };

  const handleDispatch = async () => {
    if (!customSubject.trim() || !customMessage.trim()) {
      toast.error("Complete el asunto y el mensaje del comunicado.");
      return;
    }
    if (channels.length === 0) {
      toast.error("Seleccione al menos un canal de envío.");
      return;
    }

    setIsSendingLocal(true);
    try {
      const res = await sendBroadcastMessageAction({
        subject: customSubject,
        message: customMessage,
        scope: targetScope as any,
        channels,
      });

      if (res.success) {
        toast.success(res.mensaje || "Comunicado despachado a las familias.");
        onCustomSubjectChange("");
        onCustomMessageChange("");
      } else {
        toast.error(res.error || "Error al despachar el comunicado.");
      }
    } catch {
      toast.error("Error al procesar el envío masivo.");
    } finally {
      setIsSendingLocal(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ── FORMULARIO DE REDACCIÓN ── */}
      <Card className="lg:col-span-7 rounded-2xl border-border/60 bg-card shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <IconSend className="size-4 text-primary" /> Redactar Comunicado
            Institucional
          </CardTitle>
          <CardDescription className="text-xs">
            Envío masivo multicanal a las familias y apoderados
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Destinatarios</Label>
            <Select value={targetScope} onValueChange={onTargetScopeChange}>
              <SelectTrigger className="h-9 rounded-xl text-xs font-bold border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">
                  Toda la Institución Educativa
                </SelectItem>
                <SelectItem value="INICIAL">Nivel Inicial</SelectItem>
                <SelectItem value="PRIMARIA">Nivel Primaria</SelectItem>
                <SelectItem value="SECUNDARIA">Nivel Secundaria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Canales de Notificación</Label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={channels.includes("WHATSAPP")}
                  onCheckedChange={() => toggleChannel("WHATSAPP")}
                />
                <IconBrandWhatsapp className="size-4 text-emerald-600" />
                <span>WhatsApp</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={channels.includes("EMAIL")}
                  onCheckedChange={() => toggleChannel("EMAIL")}
                />
                <IconMail className="size-4 text-sky-600" />
                <span>Email</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <Checkbox
                  checked={channels.includes("SMS")}
                  onCheckedChange={() => toggleChannel("SMS")}
                />
                <IconMessage2 className="size-4 text-indigo-600" />
                <span>SMS</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">
              Asunto / Título del Comunicado
            </Label>
            <Input
              value={customSubject}
              onChange={(e) => onCustomSubjectChange(e.target.value)}
              placeholder="Ej: Convocatoria a Escuela de Padres / Día del Logro"
              className="h-9 text-xs font-medium rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Mensaje</Label>
            <Textarea
              value={customMessage}
              onChange={(e) => onCustomMessageChange(e.target.value)}
              rows={4}
              placeholder="Escriba el contenido del comunicado institucional..."
              className="text-xs rounded-xl"
            />
          </div>

          <div className="pt-2">
            <Button
              type="button"
              disabled={
                isSendingLocal ||
                !customSubject.trim() ||
                !customMessage.trim() ||
                channels.length === 0
              }
              onClick={handleDispatch}
              className="w-full h-10 rounded-xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
            >
              {isSendingLocal ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconSend className="size-4" />
              )}
              <span>
                {isSendingLocal
                  ? "Despachando..."
                  : "Despachar Comunicado Masivo"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── VISTA PREVIA EN VIVO ── */}
      <Card className="lg:col-span-5 rounded-2xl border-border/60 bg-card shadow-xs">
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IconBrandWhatsapp className="size-4 text-emerald-500" /> Vista Previa
            del Mensaje
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 pt-0">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-2 font-sans">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              📢 *[COMUNICADO OFICIAL]*
            </p>
            <p className="font-bold text-foreground">
              {customSubject || "Título del comunicado..."}
            </p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {customMessage ||
                "El contenido del mensaje aparecerá aquí en tiempo real según redactes el texto..."}
            </p>
            <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
              Enviado a través de Sistema Escolar Pro
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
