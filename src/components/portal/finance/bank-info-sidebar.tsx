"use client";

import { useState } from "react";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconChevronDown,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface BankInfoSidebarProps {
  bancos: any[];
}

export function BankInfoSidebar({ bancos }: BankInfoSidebarProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="px-2 space-y-1">
        <h3 className="text-lg md:text-xl font-black tracking-tight">
          Información Bancaria
        </h3>
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Detalles para depósito directo
        </p>
      </div>

      <div className="space-y-4">
        {bancos.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 italic">
            No hay información bancaria disponible.
          </p>
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
  const [copy, setCopy] = useState(false);
  const [copyCci, setCopyCci] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border transition-all duration-300 ${
        isMain
          ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
          : "border-border bg-card shadow-lg"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${
              isMain
                ? "bg-primary text-white"
                : "bg-muted/10 text-muted-foreground"
            }`}
          >
            {type.toLowerCase().includes("billetera") ||
            type.toLowerCase().includes("digital") ? (
              <IconDeviceMobile size={18} strokeWidth={2.5} />
            ) : (
              <IconBuildingBank size={18} strokeWidth={2.5} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black dark:text-white leading-none truncate">
                {bank}
              </span>
              {isMain && (
                <Badge className="bg-primary text-white border-none text-[8px] font-black uppercase px-2 py-0 shrink-0">
                  Principal
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mt-1 truncate">
              {type}
            </p>
          </div>
        </div>
        <IconChevronDown
          size={20}
          className={`text-muted-foreground shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 pt-0 space-y-4">
          <div className="h-px bg-white/5" />
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                Número
              </p>
              <p className="text-sm font-mono font-bold dark:text-white tracking-tight break-all">
                {account}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(account);
                    setCopy(true);
                    setTimeout(() => setCopy(false), 2000);
                  }}
                  className="ml-2 text-muted-foreground dark:hover:text-white transition-colors"
                >
                  {copy ? (
                    <IconCheck size={16} className="text-green-500" />
                  ) : (
                    <IconCopy size={16} />
                  )}
                </button>
              </p>
            </div>
            {cci && (
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  CCI
                </p>
                <p className="text-sm font-mono font-bold dark:text-white tracking-tight break-all">
                  {cci}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cci);
                      setCopyCci(true);
                      setTimeout(() => setCopyCci(false), 2000);
                    }}
                    className="ml-2 text-muted-foreground dark:hover:text-white transition-colors"
                  >
                    {copyCci ? (
                      <IconCheck size={16} className="text-green-500" />
                    ) : (
                      <IconCopy size={16} />
                    )}
                  </button>
                </p>
              </div>
            )}
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                Titular
              </p>
              <p className="text-sm font-bold dark:text-white/80">{titular}</p>
            </div>
            {qrCode && (
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  QR
                </p>
                <Image
                  src={qrCode}
                  alt="QR"
                  width={100}
                  height={100}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
