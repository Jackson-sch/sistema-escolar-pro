"use client";

import { useState } from "react";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconChevronDown,
  IconCheck,
  IconCopy,
  IconStar,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface BankInfoSidebarProps {
  bancos: any[];
}

export function BankInfoSidebar({ bancos }: BankInfoSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-bold tracking-tight text-foreground">
          Cuentas Oficiales de Recaudación
        </h3>
        <p className="text-xs text-muted-foreground">
          Canales bancarios y billeteras para depósitos.
        </p>
      </div>

      <div className="space-y-3">
        {bancos.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-border/40 bg-card/80 text-center text-xs text-muted-foreground italic">
            No hay información bancaria configurada.
          </div>
        ) : (
          bancos.map((banco) => (
            <BankCardCollapsible
              key={banco.id}
              bank={banco.nombre}
              account={banco.numero}
              cci={banco.cci}
              titular={banco.titular}
              qrCode={banco.qrCode}
              type={
                banco.tipo === "BANCO"
                  ? banco.tipoCuenta || "Cuenta Bancaria"
                  : "Billetera Digital"
              }
              isMain={banco.esPrincipal}
            />
          ))
        )}
      </div>
    </div>
  );
}

function BankCardCollapsible({
  bank,
  account,
  cci,
  titular,
  type,
  qrCode,
  isMain,
}: {
  bank: string;
  account: string;
  cci?: string | null;
  titular: string;
  type: string;
  qrCode?: string;
  isMain?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyAccount, setCopyAccount] = useState(false);
  const [copyCci, setCopyCci] = useState(false);

  const isWallet =
    type.toLowerCase().includes("billetera") ||
    type.toLowerCase().includes("digital");

  return (
    <div
      className={`rounded-2xl border transition-[border-color] bg-card/80 overflow-hidden ${
        isMain
          ? "border-amber-500/40 ring-1 ring-amber-500/20 shadow-xs"
          : "border-border/40 hover:border-indigo-500/30"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-muted/30 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`size-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isWallet
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            }`}
          >
            {isWallet ? (
              <IconDeviceMobile className="size-5" />
            ) : (
              <IconBuildingBank className="size-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-foreground truncate">
                {bank}
              </span>
              {isMain && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1 py-0 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                  <IconStar className="size-3 fill-amber-500 text-amber-500" />
                  Principal
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate mt-0.5">
              {type}
            </p>
          </div>
        </div>
        <IconChevronDown
          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-[opacity,max-height] duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 pt-0 space-y-3 border-t border-border/20">
          <div className="pt-3 grid grid-cols-1 gap-3">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                {isWallet ? "Número de Celular" : "Número de Cuenta"}
              </span>
              <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40">
                <span className="text-xs font-mono font-bold text-foreground truncate">
                  {account}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(account);
                    setCopyAccount(true);
                    setTimeout(() => setCopyAccount(false), 2000);
                  }}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Copiar número"
                >
                  {copyAccount ? (
                    <IconCheck className="size-4 text-emerald-500" />
                  ) : (
                    <IconCopy className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {cci && (
              <div>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Código Interbancario (CCI)
                </span>
                <div className="flex items-center justify-between p-2 rounded-xl bg-background/50 border border-border/40">
                  <span className="text-xs font-mono font-bold text-foreground truncate">
                    {cci}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(cci);
                      setCopyCci(true);
                      setTimeout(() => setCopyCci(false), 2000);
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Copiar CCI"
                  >
                    {copyCci ? (
                      <IconCheck className="size-4 text-emerald-500" />
                    ) : (
                      <IconCopy className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">
                Titular
              </span>
              <p className="text-xs font-semibold text-foreground">{titular}</p>
            </div>

            {qrCode && (
              <div className="pt-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                  Código QR de Pago
                </span>
                <div className="p-2 rounded-xl bg-background/50 border border-border/40 w-fit">
                  <Image
                    src={qrCode}
                    alt={`QR ${bank}`}
                    width={120}
                    height={120}
                    className="rounded-lg object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
