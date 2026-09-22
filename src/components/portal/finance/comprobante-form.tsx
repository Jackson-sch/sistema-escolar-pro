"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconLoader2,
  IconCheck,
  IconReceipt2,
  IconUser,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createComprobanteAction } from "@/actions/comprobantes";
import { formatCurrency } from "@/lib/formats";
import { Card, CardContent } from "@/components/ui/card";
import { extractReceiptDataAction } from "@/actions/ocr";
import {
  ComprobanteReceiptUpload,
  ComprobantePaymentFields,
} from "./comprobante-form-fields";

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

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    <form onSubmit={handleSubmit} className="space-y-5 pb-3">
      {/* Info precargada */}
      {cronogramaPrecargado && (
        <Card className="border-border bg-card overflow-hidden shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <IconReceipt2 className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">
                Pago seleccionado
              </p>
              <h3 className="font-semibold text-base truncate">
                {cronogramaPrecargado.concepto}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconUser className="size-3" />
                  <span className="truncate">
                    {cronogramaPrecargado.estudiante}
                  </span>
                </span>
                <span className="font-semibold text-foreground">
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
            <SelectTrigger className="h-11 rounded-lg border-border bg-background transition-colors focus:ring-primary/20">
              <SelectValue placeholder="Selecciona el concepto..." />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border">
              {opcionesDeuda.map((deuda) => (
                <SelectItem
                  key={deuda.id}
                  value={deuda.id}
                  className="rounded-md"
                >
                  {deuda.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload de imagen */}
      <ComprobanteReceiptUpload
        preview={preview}
        isScanning={isScanning}
        onFileChange={handleFileChange}
        onClearPreview={() => setPreview(null)}
      />

      {/* Datos del pago */}
      <ComprobantePaymentFields
        form={form}
        onChangeField={handleFieldChange}
        isMontoMismatched={isMontoMismatched}
        expectedMonto={expectedMonto}
      />

      {/* Botón submit */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={
            loading || !preview || !form.cronogramaId || isMontoMismatched
          }
          className="w-full h-11 rounded-lg gap-2 font-semibold text-sm shadow-sm transition-colors bg-primary hover:bg-primary/90 disabled:opacity-50"
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

        <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 flex items-start gap-3">
          <div className="bg-blue-500/10 rounded-md p-1.5 shrink-0">
            <IconInfoCircle className="size-3.5 text-blue-500" />
          </div>
          <p className="text-xs leading-snug text-blue-500/80 font-medium">
            Posterior al envío, la administración validará los datos. Recibirás
            un correo cuando el proceso finalice.
          </p>
        </div>
      </div>
    </form>
  );
}
