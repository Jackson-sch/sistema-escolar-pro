"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconUpload,
  IconLoader2,
  IconCheck,
  IconPhoto,
  IconX,
  IconReceipt2,
  IconUser,
  IconCalendarEvent,
  IconBuildingBank,
  IconHash,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createComprobanteAction } from "@/actions/comprobantes";
import { formatCurrency } from "@/lib/formats";
import { Card, CardContent } from "@/components/ui/card";
import { extractReceiptDataAction } from "@/actions/ocr";

interface ComprobanteFormProps {
  opcionesDeuda: Array<{
    id: string;
    label: string;
    monto: number;
  }>;
  cronogramaPrecargado?: {
    id: string;
    concepto: string;
    monto: number;
    estudiante: string;
  } | null;
  onSuccess?: () => void;
}

export function ComprobanteForm({
  opcionesDeuda,
  cronogramaPrecargado,
  onSuccess,
}: ComprobanteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const [form, setForm] = useState({
    cronogramaId: cronogramaPrecargado?.id || "",
    monto: cronogramaPrecargado?.monto?.toString() || "",
    bancoOrigen: "",
    numeroOperacion: "",
    fechaOperacion: new Date().toISOString().split("T")[0],
  });

  const getExpectedMonto = () => {
    if (cronogramaPrecargado) return cronogramaPrecargado.monto;
    return opcionesDeuda.find((d) => d.id === form.cronogramaId)?.monto || 0;
  };

  const expectedMonto = getExpectedMonto();
  const isMontoMismatched = !!(
    form.monto &&
    expectedMonto > 0 &&
    Math.abs(parseFloat(form.monto) - expectedMonto) > 0.01
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Solo se permiten imágenes o PDFs");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreview(base64);

        // Si es imagen, intentamos OCR con Gemini
        if (file.type.startsWith("image/")) {
          setIsScanning(true);
          try {
            const result = await extractReceiptDataAction({
              imageBase64: base64,
            });
            if (result.success) {
              const data = result.success;
              setForm((prev) => ({
                ...prev,
                monto: data.monto?.toString() || prev.monto,
                bancoOrigen: data.banco || prev.bancoOrigen,
                numeroOperacion: data.numeroOperacion || prev.numeroOperacion,
                fechaOperacion: data.fecha || prev.fechaOperacion,
              }));
              toast.success("IA: Datos extraídos del comprobante", {
                description: "Verifica que los campos sean correctos",
              });
            }
          } catch (error) {
            console.error("Error OCR:", error);
          } finally {
            setIsScanning(false);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.cronogramaId) {
      toast.error("Selecciona una deuda");
      return;
    }

    if (!preview) {
      toast.error("Debes subir el comprobante");
      return;
    }

    if (!form.monto || parseFloat(form.monto) <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }

    if (isMontoMismatched) {
      toast.error("El monto ingresado no coincide con el monto de la deuda", {
        description: `Monto esperado: ${formatCurrency(expectedMonto)}`,
      });
      return;
    }

    setLoading(true);

    try {
      const result = await createComprobanteAction({
        cronogramaId: form.cronogramaId,
        archivoUrl: preview,
        monto: parseFloat(form.monto),
        bancoOrigen: form.bancoOrigen || undefined,
        numeroOperacion: form.numeroOperacion || undefined,
        fechaOperacion: form.fechaOperacion,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comprobante enviado correctamente");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/portal");
        }
      }
    } catch (error) {
      toast.error("Error al enviar comprobante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-6">
      {/* Info precargada */}
      {cronogramaPrecargado && (
        <Card className="border-border/40 bg-primary/5 dark:bg-primary/10 overflow-hidden rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
              <IconReceipt2 className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                Resumen de Pago
              </p>
              <h3 className="font-black text-base truncate">
                {cronogramaPrecargado.concepto}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground/80 font-bold">
                <span className="flex items-center gap-1">
                  <IconUser className="size-3" />
                  <span className="truncate">
                    {cronogramaPrecargado.estudiante}
                  </span>
                </span>
                <span className="font-black text-foreground">
                  {formatCurrency(cronogramaPrecargado.monto)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selector de deuda */}
      {!cronogramaPrecargado && (
        <div className="space-y-2">
          <Label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
            <IconReceipt2 className="size-4 text-primary" />
            Deuda a pagar
          </Label>
          <Select
            value={form.cronogramaId}
            onValueChange={(val) => {
              const deuda = opcionesDeuda.find((d) => d.id === val);
              setForm({
                ...form,
                cronogramaId: val,
                monto: deuda?.monto?.toString() || "",
              });
            }}
          >
            <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-card/50 transition-all focus:ring-primary/20">
              <SelectValue placeholder="Selecciona el concepto..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40">
              {opcionesDeuda.map((deuda) => (
                <SelectItem
                  key={deuda.id}
                  value={deuda.id}
                  className="rounded-xl"
                >
                  {deuda.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload de imagen */}
      <div className="space-y-2">
        <Label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
          <IconPhoto className="size-4 text-primary" />
          Comprobante de transferencia
        </Label>
        <div className="relative">
          {preview ? (
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-muted/30 group">
              {preview.startsWith("data:image") ? (
                <img
                  src={preview}
                  alt="Comprobante"
                  className="w-full max-h-64 object-contain p-2"
                />
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-2">
                  <div className="size-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                    <IconCheck className="size-7" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">
                    Documento PDF cargado
                  </p>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => setPreview(null)}
                  className="rounded-xl scale-75 group-hover:scale-100 transition-transform"
                >
                  <IconX className="size-5" />
                </Button>
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                  <div className="bg-background/90 p-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-primary/20">
                    <IconLoader2 className="size-8 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-sm font-black text-primary uppercase tracking-wider">
                        IA Escaneando
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold">
                        Extrayendo datos...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label className="group flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-border/40 hover:border-primary/50 rounded-2xl cursor-pointer transition-all bg-card/30 hover:bg-primary/5">
              <div className="size-14 rounded-2xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-3 shadow-sm border border-border/20">
                <IconUpload className="size-7" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-sm">
                  Haz clic para buscar
                </p>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 mt-1">
                  JPG, PNG o PDF
                </p>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Datos del pago */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground">
            Monto transferido
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-sm">
              S/
            </span>
            <Input
              type="number"
              step="0.01"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder="0.00"
              className="h-11 pl-10 rounded-xl border-border/40 bg-card/50 focus:ring-primary/20 font-black text-base"
            />
          </div>
          {isMontoMismatched && (
            <p className="text-[10px] font-bold text-red-500 mt-1.5 flex items-center gap-1 animate-pulse">
              <IconX className="size-3" />
              El monto no coincide con la deuda ({formatCurrency(expectedMonto)}
              )
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <IconCalendarEvent className="size-3.5" />
            Fecha de operación
          </Label>
          <Input
            type="date"
            value={form.fechaOperacion}
            onChange={(e) =>
              setForm({ ...form, fechaOperacion: e.target.value })
            }
            className="h-11 rounded-xl border-border/40 bg-card/50 focus:ring-primary/20 font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <IconBuildingBank className="size-3.5" />
            Banco de origen
          </Label>
          <Input
            value={form.bancoOrigen}
            onChange={(e) => setForm({ ...form, bancoOrigen: e.target.value })}
            placeholder="Ej: BCP, Interbank..."
            className="h-11 rounded-xl border-border/40 bg-card/50 focus:ring-primary/20 font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <IconHash className="size-3.5" />
            Nro. operación
          </Label>
          <Input
            value={form.numeroOperacion}
            onChange={(e) =>
              setForm({ ...form, numeroOperacion: e.target.value })
            }
            placeholder="Ej: 123456"
            className="h-11 rounded-xl border-border/40 bg-card/50 focus:ring-primary/20 font-mono text-sm"
          />
        </div>
      </div>

      {/* Botón submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={
            loading || !preview || !form.cronogramaId || isMontoMismatched
          }
          className="w-full h-12 rounded-xl gap-2 font-black text-base shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:grayscale"
        >
          {loading ? (
            <>
              <IconLoader2 className="size-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <IconCheck className="size-5" />
              Enviar Comprobante
            </>
          )}
        </Button>

        <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
          <div className="bg-blue-500/10 rounded-lg p-1.5 shrink-0">
            <IconInfoCircle className="size-3.5 text-blue-500" />
          </div>
          <p className="text-[11px] leading-snug text-blue-500/80 font-medium">
            Posterior al envío, la administración validará los datos. Recibirás
            un correo cuando el proceso finalice.
          </p>
        </div>
      </div>
    </form>
  );
}
