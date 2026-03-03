"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconCalendar,
  IconReceipt,
  IconUpload,
  IconInfoCircle,
  IconCreditCard,
  IconBuildingBank,
  IconDeviceMobile,
  IconChevronDown,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentDrawer } from "./payment-drawer";

interface DeudasListClientProps {
  hijos: any[];
  deudas: any[];
  selectedHijoId?: string;
  bancos: any[];
}

export function DeudasListClient({ deudas, bancos }: DeudasListClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<any>(null);

  const handlePayNow = (deuda: any) => {
    setSelectedDeuda({
      id: deuda.id,
      concepto: deuda.concepto.nombre,
      monto: deuda.monto - Number(deuda.montoPagado),
      estudiante: `${deuda.estudiante.name || ""} ${
        deuda.estudiante.apellidoPaterno || ""
      }`.trim(),
    });
    setDrawerOpen(true);
  };

  const totalBalance = deudas.reduce(
    (acc, d) => acc + (d.monto - Number(d.montoPagado)),
    0,
  );

  const nextDeuda = deudas.length > 0 ? deudas[0] : null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/40 bg-[#0f111a] rounded-[1.5rem] overflow-hidden p-8 flex flex-col justify-between min-h-[180px] shadow-2xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                BALANCE TOTAL PENDIENTE
              </p>
              <h2 className="text-5xl font-black tracking-tighter text-white">
                {formatCurrency(totalBalance)}
              </h2>
            </div>
            <div className="p-3 rounded-2xl bg-muted/10 text-muted-foreground/40">
              <IconCreditCard size={32} />
            </div>
          </div>
          <p className="text-xs font-bold text-orange-500 flex items-center gap-2">
            <IconInfoCircle size={14} />
            El próximo ciclo de facturación comienza el 1 de noviembre
          </p>
        </Card>

        <Card className="border-none bg-orange-600 rounded-[1.5rem] overflow-hidden p-8 flex flex-col justify-between min-h-[180px] shadow-2xl shadow-orange-600/20 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <IconCalendar size={120} />
          </div>
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
              PRÓXIMO VENCIMIENTO
            </p>
            <h2 className="text-5xl font-black tracking-tighter">
              {nextDeuda
                ? formatDate(nextDeuda.fechaVencimiento, "dd MMM, yyyy")
                : "Sin pendientes"}
            </h2>
          </div>
          <div className="relative z-10">
            {nextDeuda && (
              <Button
                onClick={() => handlePayNow(nextDeuda)}
                className="w-fit h-11 px-8 rounded-xl bg-white text-orange-600 hover:bg-white/90 font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-lg"
              >
                Pagar Ahora
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Fees Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black tracking-tight text-white/90">
            Pensiones Mensuales
          </h3>
          <Button
            variant="ghost"
            className="text-orange-500 hover:text-orange-400 font-bold text-xs gap-2 transition-colors"
          >
            <IconUpload size={16} />
            <span className="underline underline-offset-4 decoration-2">
              Historial de Estados
            </span>
          </Button>
        </div>

        <div className="rounded-[1.5rem] border border-border/40 bg-[#0f111a] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/10">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 w-2/5">
                    DESCRIPCIÓN
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    MONTO
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    VENCIMIENTO
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                    ESTADO
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-right">
                    ACCIÓN
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {deudas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center text-muted-foreground/60 font-medium italic"
                    >
                      No se encontraron pensiones pendientes para este periodo.
                    </td>
                  </tr>
                ) : (
                  deudas.map((deuda) => {
                    const pendiente = deuda.monto - Number(deuda.montoPagado);
                    const vencida =
                      new Date(deuda.fechaVencimiento) < new Date();

                    return (
                      <tr
                        key={deuda.id}
                        className="group hover:bg-white/1 transition-colors"
                      >
                        <td className="px-8 py-7">
                          <p className="font-bold text-[15px] text-white/90 uppercase tracking-tight">
                            {deuda.concepto.nombre}
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground/40 mt-1 uppercase tracking-widest">
                            {deuda.estudiante.name}{" "}
                            {deuda.estudiante.apellidoPaterno}
                          </p>
                        </td>
                        <td className="px-8 py-7 font-bold text-[15px] text-white/90">
                          {formatCurrency(pendiente)}
                        </td>
                        <td className="px-8 py-7 text-sm font-medium text-muted-foreground/80">
                          {formatDate(deuda.fechaVencimiento, "dd MMM, yyyy")}
                        </td>
                        <td className="px-8 py-7">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-current bg-current/10 ${
                              vencida ? "text-rose-500" : "text-orange-500"
                            }`}
                          >
                            <div className="size-1.5 rounded-full bg-current animate-pulse" />
                            {vencida ? "VENCIDA" : "PENDIENTE"}
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <Button
                            variant="link"
                            onClick={() => handlePayNow(deuda)}
                            className={`p-0 h-auto font-black text-xs uppercase tracking-widest hover:no-underline transition-colors ${
                              vencida ? "text-rose-500" : "text-orange-500"
                            }`}
                          >
                            {vencida ? "Resolver" : "Pagar"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight text-white px-2">
          Información Bancaria
        </h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
          Detalles para depósito directo
        </p>

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

      <PaymentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedDeuda={selectedDeuda}
      />
    </div>
  );
}

function BankCardCollapsible({
  bank,
  account,
  cci,
  titular,
  type,
  isMain,
}: {
  bank: string;
  account: string;
  cci?: string | null;
  titular: string;
  type: string;
  isMain?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-[1.25rem] border transition-all duration-300 ${isMain ? "border-orange-500/30 bg-orange-500/5" : "border-border/20 bg-[#0f111a]"}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl ${isMain ? "bg-orange-600 text-white" : "bg-muted/10 text-muted-foreground"}`}
          >
            {type.includes("Billetera") ? (
              <IconDeviceMobile size={20} />
            ) : (
              <IconBuildingBank size={20} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white leading-none">{bank}</span>
              {isMain && (
                <Badge className="bg-orange-500 text-white border-none text-[8px] font-black uppercase px-2 py-0">
                  Principal
                </Badge>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mt-1">
              {type}
            </p>
          </div>
        </div>
        <IconChevronDown
          size={20}
          className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="p-5 pt-0 space-y-4">
          <div className="h-px bg-white/5" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                Número
              </p>
              <p className="text-sm font-mono font-bold text-white tracking-tight">
                {account}
              </p>
            </div>
            {cci && (
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                  CCI
                </p>
                <p className="text-sm font-mono font-bold text-white tracking-tight">
                  {cci}
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              Titular
            </p>
            <p className="text-sm font-bold text-white/80">{titular}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
