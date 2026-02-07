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
  IconCreditCard,
  IconUser,
  IconCalendar,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import { getAIReminderAction } from "@/actions/finance";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";

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

  const deudaTotal = cronograma.monto - cronograma.montoPagado;

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
        <DialogContent className="sm:max-w-[550px] p-0 bg-background/95 backdrop-blur-3xl border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Header Personalizado */}
          <div className="p-8 pb-4 relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-14 rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                <IconRobot className="size-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold uppercase tracking-wider">
                    Recordatorio Inteligente
                  </DialogTitle>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-400">
                    <IconSparkles className="size-3" strokeWidth={3} />
                    <span className="text-[10px] font-black tracking-widest leading-none">
                      AI
                    </span>
                  </div>
                </div>
                <DialogDescription className="text-xs text-muted-foreground/70 font-medium">
                  Generado automáticamente por el asistente
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Box de Contexto */}
            <div className="p-4 rounded-[1.5rem] bg-muted/30 border border-white/5 space-y-3">
              <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 block ml-0.5">
                CONTEXTO:
              </span>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-white/5">
                  <IconCreditCard className="size-3.5 text-violet-400" />
                  <span className="text-muted-foreground">Deuda:</span>
                  <span className="text-foreground">S/ {deudaTotal}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-white/5">
                  <IconUser className="size-3.5 text-blue-400" />
                  <span className="text-muted-foreground">Estudiante:</span>
                  <span className="text-foreground">
                    {cronograma.estudiante.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-white/5">
                  <IconCalendar className="size-3.5 text-amber-400" />
                  <span className="text-muted-foreground">Vencimiento:</span>
                  <span className="text-foreground lowercase first-letter:uppercase">
                    {formatDate(cronograma.fechaVencimiento, "dd MMM")}
                  </span>
                </div>
              </div>
            </div>

            {/* Box de Mensaje */}
            <div className="relative group">
              <div className="absolute -top-2 left-6 z-10 px-3 py-1 rounded-full bg-violet-600 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-violet-500/20">
                Contenido del mensaje
              </div>
              <div className="bg-white/2 border border-white/5 rounded-[2rem] p-6 pt-8 overflow-hidden relative">
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed font-medium">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reminder || ""}
                    </ReactMarkdown>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute bottom-4 right-4 rounded-xl size-10 bg-background/50 border border-white/5 backdrop-blur-sm hover:bg-violet-600 hover:text-white transition-all shadow-xl"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoader2 className="size-5 animate-spin" />
                  ) : (
                    <IconRefresh className="size-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(false)}
              >
                Cerrar
              </Button>

              <Button
                onClick={shareWhatsApp}
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <IconBrandWhatsapp className="size-5" />
                WhatsApp
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full text-violet-400"
                onClick={shareNative}
              >
                <IconShare className="size-4" />
              </Button>

              <Button
                onClick={copyToClipboard}
                className={cn(
                  "rounded-full",
                  copied
                    ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                    : "bg-violet-600 hover:bg-violet-700 shadow-violet-500/20",
                )}
              >
                {copied ? (
                  <IconCheck className="size-5" />
                ) : (
                  <IconCopy className="size-5" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
