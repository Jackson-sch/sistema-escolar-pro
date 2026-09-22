"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconUpload,
  IconLoader2,
  IconCheck,
  IconPhoto,
  IconX,
  IconCalendarEvent,
  IconBuildingBank,
  IconHash,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";

interface ComprobanteReceiptUploadProps {
  preview: string | null;
  isScanning: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPreview: () => void;
}

export function ComprobanteReceiptUpload({
  preview,
  isScanning,
  onFileChange,
  onClearPreview,
}: ComprobanteReceiptUploadProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
        <IconPhoto className="size-4 text-primary" />
        Comprobante de transferencia
      </Label>
      <div className="relative">
        {preview ? (
          <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 group">
            {preview.startsWith("data:image") ? (
              <Image
                src={preview}
                alt="Comprobante"
                width={400}
                height={256}
                unoptimized
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
                onClick={onClearPreview}
                aria-label="Eliminar comprobante"
                className="rounded-md scale-75 group-hover:scale-100 transition-transform"
              >
                <IconX className="size-5" />
              </Button>
            </div>

            {isScanning && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in animation-duration-">
                <div className="bg-background p-4 rounded-lg shadow-lg flex flex-col items-center gap-3 border border-primary/20">
                  <IconLoader2 className="size-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-sm font-black text-primary uppercase tracking-wider">
                      IA Escaneando
                    </p>
                    <p className="text-xxs text-muted-foreground font-bold">
                      Extrayendo datos...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="group flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer transition-colors bg-card hover:bg-primary/5">
            <div className="size-12 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors mb-3 border border-border">
              <IconUpload className="size-7" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground text-sm">
                Haz clic para buscar
              </p>
              <p className="text-xxs uppercase font-black tracking-widest text-muted-foreground/60 mt-1">
                JPG, PNG o PDF
              </p>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}

interface PaymentFormData {
  monto: string;
  fechaOperacion: string;
  bancoOrigen: string;
  numeroOperacion: string;
}

interface ComprobantePaymentFieldsProps {
  form: PaymentFormData;
  onChangeField: (field: keyof PaymentFormData, value: string) => void;
  isMontoMismatched: boolean;
  expectedMonto: number;
}

export function ComprobantePaymentFields({
  form,
  onChangeField,
  isMontoMismatched,
  expectedMonto,
}: ComprobantePaymentFieldsProps) {
  return (
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
            onChange={(e) => onChangeField("monto", e.target.value)}
            placeholder="0.00"
            className="h-11 pl-10 rounded-lg border-border bg-background focus:ring-primary/20 font-semibold text-base"
          />
        </div>
        {isMontoMismatched && (
          <p className="text-xxs font-bold text-red-500 mt-1.5 flex items-center gap-1 animate-pulse">
            <IconX className="size-3" />
            El monto no coincide con la deuda ({formatCurrency(expectedMonto)})
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
          onChange={(e) => onChangeField("fechaOperacion", e.target.value)}
          className="h-11 rounded-lg border-border bg-background focus:ring-primary/20 font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <IconBuildingBank className="size-3.5" />
          Banco de origen
        </Label>
        <Input
          value={form.bancoOrigen}
          onChange={(e) => onChangeField("bancoOrigen", e.target.value)}
          placeholder="Ej: BCP, Interbank..."
          className="h-11 rounded-lg border-border bg-background focus:ring-primary/20 font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <IconHash className="size-3.5" />
          Nro. operación
        </Label>
        <Input
          value={form.numeroOperacion}
          onChange={(e) => onChangeField("numeroOperacion", e.target.value)}
          placeholder="Ej: 123456"
          className="h-11 rounded-lg border-border bg-background focus:ring-primary/20 font-mono text-sm"
        />
      </div>
    </div>
  );
}
