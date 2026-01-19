"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  IconMessageHeart,
  IconLoader2,
  IconCopy,
  IconCheck,
  IconRobot,
  IconBrandWhatsapp,
  IconShare,
} from "@tabler/icons-react";
import { getAIReminderAction } from "@/actions/finance";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface IAReminderButtonProps {
  cronograma: {
    monto: number;
    montoPagado: number;
    fechaVencimiento: string;
    estudiante: {
      name: string;
      apellidoPaterno: string;
    };
    concepto: {
      nombre: string;
    };
  };
}

export function IAReminderButton({ cronograma }: IAReminderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [reminder, setReminder] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await getAIReminderAction({
        nombrePadre: "Padre de Familia",
        nombreEstudiante: `${cronograma.estudiante.name}`,
        monto: cronograma.monto - cronograma.montoPagado,
        fechaVencimiento: cronograma.fechaVencimiento,
        conceptoPago: cronograma.concepto.nombre,
      });

      if (res.success) {
        setReminder(res.success);
        setOpen(true);
      } else {
        toast.error(res.error || "No se pudo generar el recordatorio");
      }
    } catch (error) {
      toast.error("Error al conectar con la IA");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (reminder) {
      navigator.clipboard.writeText(reminder);
      setCopied(true);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    if (reminder) {
      const encodedText = encodeURIComponent(reminder);
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    }
  };

  const shareNative = async () => {
    if (reminder && navigator.share) {
      try {
        await navigator.share({
          title: "Recordatorio de Pago",
          text: reminder,
        });
      } catch (error) {
        // Si el usuario cancela, no hacer nada
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-8 text-violet-600 border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:text-violet-700"
        disabled={loading}
        onClick={handleGenerate}
        title="Generar recordatorio IA"
      >
        {loading ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconMessageHeart className="size-4" />
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[520px] bg-background/95 backdrop-blur-2xl border-white/10 rounded-[2rem] flex flex-col overflow-hidden">
          <DialogHeader className="space-y-3 shrink-0">
            <div className="size-12 rounded-2xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <IconRobot className="size-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Recordatorio Inteligente
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              He generado este mensaje empático basado en la deuda actual.
            </DialogDescription>
          </DialogHeader>

          <div className="relative flex-1 min-h-0">
            <div className="bg-muted/30 rounded-2xl border border-border/50 overflow-hidden">
              <div className="max-h-[450px] overflow-y-auto p-5">
                <div className="prose prose-sm prose-invert max-w-none text-foreground [&>p]:mb-3 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5 [&>strong]:text-foreground [&>em]:text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {reminder || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 rounded-xl size-8 z-10"
              onClick={copyToClipboard}
            >
              {copied ? (
                <IconCheck className="size-4 text-emerald-500" />
              ) : (
                <IconCopy className="size-4" />
              )}
            </Button>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t border-border/50 shrink-0 flex-wrap sm:flex-nowrap">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border/40 flex-1 sm:flex-none"
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={shareNative}
              className="rounded-xl border-border/40 gap-2 flex-1 sm:flex-none"
            >
              <IconShare className="size-4" />
              Compartir
            </Button>
            <Button
              onClick={shareWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 px-5 flex-1 sm:flex-none"
            >
              <IconBrandWhatsapp className="size-4" />
              WhatsApp
            </Button>
            <Button
              onClick={copyToClipboard}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 px-5 flex-1 sm:flex-none"
            >
              {copied ? (
                <IconCheck className="size-4" />
              ) : (
                <IconCopy className="size-4" />
              )}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
