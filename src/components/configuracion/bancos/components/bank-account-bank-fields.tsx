"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankAccountBankFieldsProps {
  nombre: string;
  titular: string;
  numero: string;
  cci: string;
  tipoCuenta: string;
  onPatch: (key: any, value: any) => void;
}

export function BankAccountBankFields({
  nombre,
  titular,
  numero,
  cci,
  tipoCuenta,
  onPatch,
}: BankAccountBankFieldsProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Entidad Bancaria
          </Label>
          <Input
            value={nombre}
            onChange={(e) => onPatch("nombre", e.target.value)}
            placeholder="Ej: BCP, BBVA, Interbank, Scotiabank"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Titular de la Cuenta
          </Label>
          <Input
            value={titular}
            onChange={(e) => onPatch("titular", e.target.value)}
            placeholder="Razón Social o Nombre del Colegio"
            className="h-9 rounded-xl border-border/60 bg-background text-xs uppercase"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Número de Cuenta
          </Label>
          <Input
            value={numero}
            onChange={(e) => onPatch("numero", e.target.value)}
            placeholder="193-4589201-0-12"
            className="h-9 rounded-xl border-border/60 bg-background text-xs font-mono font-bold"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Código Interbancario (CCI)
          </Label>
          <Input
            value={cci}
            onChange={(e) => onPatch("cci", e.target.value)}
            placeholder="002-193-004589201012-14"
            className="h-9 rounded-xl border-border/60 bg-background text-xs font-mono"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-foreground">
          Tipo de Cuenta / Descripción
        </Label>
        <Input
          value={tipoCuenta}
          onChange={(e) => onPatch("tipoCuenta", e.target.value)}
          placeholder="Ej: Cuenta Corriente Soles - Recaudación Escolar"
          className="h-9 rounded-xl border-border/60 bg-background text-xs"
        />
      </div>
    </div>
  );
}
