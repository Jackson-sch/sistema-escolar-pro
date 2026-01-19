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
} from "@tabler/icons-react";
import { toast } from "sonner";
import { createComprobanteAction } from "@/actions/comprobantes";
import { formatCurrency } from "@/lib/formats";
import { Card, CardContent } from "@/components/ui/card";

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
}

export function ComprobanteForm({
  opcionesDeuda,
  cronogramaPrecargado,
}: ComprobanteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    cronogramaId: cronogramaPrecargado?.id || "",
    monto: cronogramaPrecargado?.monto?.toString() || "",
    bancoOrigen: "",
    numeroOperacion: "",
    fechaOperacion: new Date().toISOString().split("T")[0],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Solo se permiten imágenes o PDFs");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
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
        router.push("/portal");
      }
    } catch (error) {
      toast.error("Error al enviar comprobante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Info precargada */}
      {cronogramaPrecargado && (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <IconReceipt2 className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-primary/70">
                Resumen de Pago
              </p>
              <h3 className="font-black text-lg">
                {cronogramaPrecargado.concepto}
              </h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconUser className="size-4" />
                  {cronogramaPrecargado.estudiante}
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
        <div className="space-y-3">
          <Label className="text-base font-bold flex items-center gap-2">
            <IconReceipt2 className="size-5 text-primary" />
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
            <SelectTrigger className="h-14 rounded-2xl border-border/50 bg-background/50 backdrop-blur-sm transition-all focus:ring-primary/20">
              <SelectValue placeholder="Selecciona el concepto..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
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
      <div className="space-y-3">
        <Label className="text-base font-bold flex items-center gap-2">
          <IconPhoto className="size-5 text-primary" />
          Comprobante de transferencia
        </Label>
        <div className="relative">
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden border border-border bg-muted/30 group">
              {preview.startsWith("data:image") ? (
                <img
                  src={preview}
                  alt="Comprobante"
                  className="w-full max-h-80 object-contain p-4"
                />
              ) : (
                <div className="h-40 flex flex-col items-center justify-center gap-2">
                  <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <IconCheck className="size-8" />
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
                  className="rounded-2xl scale-75 group-hover:scale-100 transition-transform"
                >
                  <IconX className="size-5" />
                </Button>
              </div>
            </div>
          ) : (
            <label className="group flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-border hover:border-primary/50 rounded-3xl cursor-pointer transition-all bg-muted/10 hover:bg-primary/5">
              <div className="size-16 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all mb-4">
                <IconUpload className="size-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">
                  Haz clic para buscar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos permitidos: JPG, PNG o PDF
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            Monto transferido
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
              S/
            </span>
            <Input
              type="number"
              step="0.01"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              placeholder="0.00"
              className="h-14 pl-10 rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20 font-black text-lg"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <IconCalendarEvent className="size-4 text-muted-foreground" />
            Fecha de operación
          </Label>
          <Input
            type="date"
            value={form.fechaOperacion}
            onChange={(e) =>
              setForm({ ...form, fechaOperacion: e.target.value })
            }
            className="h-14 rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <IconBuildingBank className="size-4 text-muted-foreground" />
            Banco de origen (opcional)
          </Label>
          <Input
            value={form.bancoOrigen}
            onChange={(e) => setForm({ ...form, bancoOrigen: e.target.value })}
            placeholder="Ej: BCP, Interbank..."
            className="h-12 rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-bold flex items-center gap-2">
            <IconHash className="size-4 text-muted-foreground" />
            Nro. de operación (opcional)
          </Label>
          <Input
            value={form.numeroOperacion}
            onChange={(e) =>
              setForm({ ...form, numeroOperacion: e.target.value })
            }
            placeholder="Ej: 123456789"
            className="h-12 rounded-2xl border-border/50 bg-background/50 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Botón submit */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={loading || !preview || !form.cronogramaId}
          className="w-full h-16 rounded-2xl gap-3 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <IconLoader2 className="size-6 animate-spin" />
              Procesando Envío...
            </>
          ) : (
            <>
              <IconCheck className="size-6" />
              Enviar Comprobante
            </>
          )}
        </Button>

        <Card className="mt-6 border-none bg-linear-to-r from-blue-500/10 to-transparent">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600">
              <IconLoader2 className="size-4 animate-spin" />
            </div>
            <p className="text-xs font-medium text-blue-700/80">
              Posterior al envío, la administración validará los datos.
              Recibirás un correo cuando el proceso finalice.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
