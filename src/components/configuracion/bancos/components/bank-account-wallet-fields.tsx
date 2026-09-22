"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconQrcode } from "@tabler/icons-react";

interface BankAccountWalletFieldsProps {
  nombre: string;
  titular: string;
  numero: string;
  qrCode: string;
  onPatch: (key: any, value: any) => void;
}

export function BankAccountWalletFields({
  nombre,
  titular,
  numero,
  qrCode,
  onPatch,
}: BankAccountWalletFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start animate-in fade-in duration-200">
      {/* Columna Izquierda: Datos del Teléfono y Titular */}
      <div className="sm:col-span-7 space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Billetera / Aplicación
          </Label>
          <Input
            value={nombre}
            onChange={(e) => onPatch("nombre", e.target.value)}
            placeholder="Ej: Yape, Plin, Tunki"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Titular de la Billetera
          </Label>
          <Input
            value={titular}
            onChange={(e) => onPatch("titular", e.target.value)}
            placeholder="Nombre registrado en Yape / Plin"
            className="h-9 rounded-xl border-border/60 bg-background text-xs uppercase"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Número de Celular Asociado
          </Label>
          <Input
            value={numero}
            onChange={(e) => onPatch("numero", e.target.value)}
            placeholder="987 654 321"
            className="h-9 rounded-xl border-border/60 bg-background text-xs font-mono font-bold"
            required
          />
        </div>
      </div>

      {/* Columna Derecha: Carga de Código QR */}
      <div className="sm:col-span-5 space-y-1.5">
        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <IconQrcode className="size-4 text-emerald-500" />
          <span>Código QR de Cobro</span>
        </Label>
        <div className="p-2.5 rounded-2xl bg-muted/20 border border-border/60 flex flex-col items-center justify-center">
          <ImageUpload
            value={qrCode}
            onChange={(url) => onPatch("qrCode", url)}
            onRemove={() => onPatch("qrCode", "")}
            className="w-full h-40"
          />
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          Los padres podrán escanear este QR desde su app móvil.
        </p>
      </div>
    </div>
  );
}
