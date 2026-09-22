"use client";

import Image from "next/image";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconCopy,
  IconStar,
  IconWifi,
  IconQrcode,
} from "@tabler/icons-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface BankCardVisualProps {
  nombre?: string;
  tipo?: "BANCO" | "BILLETERA_DIGITAL";
  numero?: string;
  cci?: string | null;
  titular?: string | null;
  tipoCuenta?: string | null;
  qrCode?: string | null;
  esPrincipal?: boolean;
}

export function BankCardVisual({
  nombre = "Entidad Financiera",
  tipo = "BANCO",
  numero = "•••• •••• •••• ••••",
  cci,
  titular = "NOMBRE DEL TITULAR",
  tipoCuenta = "Cuenta Corriente",
  qrCode,
  esPrincipal,
}: BankCardVisualProps) {
  const { copy } = useCopyToClipboard();
  const isBanco = tipo === "BANCO";

  // Identificación cromática según entidad financiera peruana
  const getTheme = () => {
    const n = nombre.toLowerCase();
    if (n.includes("bcp") || n.includes("crédito")) {
      return "from-slate-900 via-blue-950 to-indigo-950 border-orange-500/40 text-white";
    }
    if (n.includes("bbva") || n.includes("continental")) {
      return "from-blue-950 via-sky-950 to-slate-900 border-sky-400/40 text-white";
    }
    if (n.includes("interbank")) {
      return "from-emerald-950 via-teal-950 to-slate-900 border-emerald-400/40 text-white";
    }
    if (n.includes("scotia") || n.includes("scotiabank")) {
      return "from-rose-950 via-red-950 to-slate-900 border-rose-500/40 text-white";
    }
    if (n.includes("yape")) {
      return "from-purple-950 via-fuchsia-950 to-slate-900 border-fuchsia-500/40 text-white";
    }
    if (n.includes("plin")) {
      return "from-cyan-950 via-blue-950 to-slate-900 border-cyan-400/40 text-white";
    }
    return isBanco
      ? "from-zinc-900 via-zinc-900 to-zinc-950 border-border/80 text-white"
      : "from-emerald-950 via-zinc-900 to-zinc-950 border-emerald-500/40 text-white";
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl p-5 sm:p-6 overflow-hidden border shadow-lg transition-all select-none bg-linear-to-br",
        getTheme(),
      )}
    >
      {/* Patrón de fondo geométrico sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

      {/* Fila Superior: Marca de Banco / Billetera y Chip Contactless */}
      <div className="relative z-10 flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 text-white shadow-2xs">
            {isBanco ? (
              <IconBuildingBank className="size-4.5" />
            ) : (
              <IconDeviceMobile className="size-4.5" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {nombre || (isBanco ? "Banco" : "Billetera")}
            </h4>
            <span className="text-[10px] text-white/60 font-medium block leading-none mt-0.5">
              {isBanco ? tipoCuenta || "Cuenta Bancaria" : "Cobro Digital"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {esPrincipal && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <IconStar className="size-3 fill-amber-400 text-amber-400" />
              <span>Principal</span>
            </div>
          )}
          <IconWifi className="size-4 text-white/40 rotate-90" />
        </div>
      </div>

      {/* Chip EMV Decorativo en Cuentas Bancarias */}
      {isBanco && (
        <div className="relative z-10 size-7 rounded-md bg-linear-to-tr from-amber-300 to-amber-100 border border-amber-400/60 shadow-xs mb-3 flex items-center justify-center opacity-90">
          <div className="size-5 border border-amber-600/30 rounded-xs" />
        </div>
      )}

      {/* Número de Cuenta / Teléfono Billetera con Copia */}
      <div className="relative z-10 my-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block">
          {isBanco ? "Número de Cuenta" : "Número de Celular"}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-mono font-black tracking-wider text-white">
            {numero || "•••• •••• •••• ••••"}
          </span>
          {numero && (
            <button
              type="button"
              onClick={() => copy(numero, "Copiado al portapapeles")}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Copiar número"
            >
              <IconCopy className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Fila Inferior: Titular y CCI o QR Miniatura */}
      <div className="relative z-10 pt-3 border-t border-white/10 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block">
            Titular
          </span>
          <p className="text-xs font-bold text-white uppercase truncate">
            {titular || "NOMBRE DEL TITULAR"}
          </p>
        </div>

        {isBanco && cci ? (
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 block">
              CCI
            </span>
            <div className="flex items-center justify-end gap-1.5 font-mono text-[11px] font-bold text-white/90">
              <span>{cci}</span>
              <button
                type="button"
                onClick={() => copy(cci, "CCI copiado")}
                className="p-0.5 hover:text-white cursor-pointer text-white/60"
                title="Copiar CCI"
              >
                <IconCopy className="size-3" />
              </button>
            </div>
          </div>
        ) : qrCode ? (
          <div className="shrink-0 flex items-center gap-1.5 p-1 px-2 rounded-lg bg-white/10 border border-white/10">
            <IconQrcode className="size-4 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-300">
              QR Activo
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
