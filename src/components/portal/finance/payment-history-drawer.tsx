"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconHistory,
  IconReceipt2,
  IconWallet,
  IconCalendarCheck,
} from "@tabler/icons-react";
import { BoletaDownloadButton } from "./boleta-download-button";
import { useState } from "react";

interface PaymentHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historial: any[];
}

export function PaymentHistoryDrawer({
  open,
  onOpenChange,
  historial,
}: PaymentHistoryDrawerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const totalPagado = historial.reduce((sum, item) => sum + item.monto, 0);
  const ultimoPago = historial[0]?.updatedAt;

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      shouldScaleBackground={false}
    >
      <DrawerContent
        className="h-full w-full sm:max-w-[460px] rounded-none border-l border-white/6"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, #181220 0%, #0a0c13 50%, #080a10 100%)",
        }}
      >
        <div className="w-full h-full flex flex-col dark:text-white">

          {/* ── HEADER ── */}
          <DrawerHeader className="relative px-5 pt-7 pb-5 border-b border-white/6 overflow-hidden shrink-0">
            {/* glow blob */}
            <div
              className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-[0.08]"
              style={{
                background: "radial-gradient(circle, #f97316 0%, transparent 70%)",
                filter: "blur(48px)",
              }}
            />

            {/* title row */}
            <div className="relative flex items-center gap-3 mb-5">
              <div
                className="size-10 rounded-xl flex items-center justify-center border border-orange-500/20 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(249,115,22,0.06) 100%)",
                }}
              >
                <IconHistory size={20} stroke={1.8} className="text-orange-400" />
              </div>
              <div>
                <DrawerTitle className="text-[20px] font-black tracking-tight text-white/95 leading-none">
                  Historial de Pagos
                </DrawerTitle>
                <DrawerDescription className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 mt-0.5">
                  Transacciones completadas
                </DrawerDescription>
              </div>
            </div>

            {/* ── STATS BLOCK ── */}
            {historial.length > 0 && (
              <div className="relative space-y-2">
                {/* Total + count in one wide card */}
                <div
                  className="flex items-center justify-between rounded-xl px-4 py-3 border border-white/5"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(249,115,22,0.15)" }}
                    >
                      <IconWallet size={15} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                        Total pagado
                      </p>
                      <p className="text-[20px] font-black text-orange-400 leading-none mt-0.5">
                        {formatCurrency(totalPagado)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                      Pagos
                    </p>
                    <p className="text-[20px] font-black text-white/70 leading-none mt-0.5">
                      {historial.length}
                    </p>
                  </div>
                </div>

                {/* Last payment date */}
                {ultimoPago && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-4 py-2.5 border border-white/4"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  >
                    <IconCalendarCheck size={13} className="text-white/25 shrink-0" />
                    <p className="text-[11px] text-white/35 font-semibold">
                      Último pago:{" "}
                      <span className="text-white/60 font-black">
                        {formatDate(ultimoPago, "dd 'de' MMMM, yyyy")}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </DrawerHeader>

          {/* ── LIST ── */}
          <ScrollArea className="flex-1">
            <div className="px-5 pt-5 pb-6 space-y-3">
              {historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div
                    className="size-20 rounded-3xl flex items-center justify-center border border-white/6"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                    }}
                  >
                    <IconReceipt2 size={34} stroke={1} className="text-white/15" />
                  </div>
                  <div>
                    <p className="text-white/50 font-black text-lg">Sin registros aún</p>
                    <p className="text-white/25 text-[13px] mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Tus pagos completados aparecerán aquí.
                    </p>
                  </div>
                </div>
              ) : (
                historial.map((item) => {
                  const pagoValido =
                    item.pagos && item.pagos.length > 0 ? item.pagos[0] : null;
                  const isHovered = hoveredId === item.id;

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="relative rounded-2xl border overflow-hidden transition-all duration-200"
                      style={{
                        background: isHovered
                          ? "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(255,255,255,0.02) 100%)"
                          : "linear-gradient(135deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
                        borderColor: isHovered
                          ? "rgba(249,115,22,0.25)"
                          : "rgba(255,255,255,0.06)",
                      }}
                    >

                      <div className="pl-5 pr-4 py-4">
                        {/* concept + amount */}
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-[15px] text-white/90 leading-snug">
                              {item.concepto.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                {formatDate(item.updatedAt, "dd MMM, yyyy")}
                              </span>
                              <Badge
                                className="h-[18px] px-2 rounded-full border-0 text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
                                style={{
                                  background: "rgba(34,197,94,0.12)",
                                  color: "#4ade80",
                                }}
                              >
                                <span
                                  className="size-1.5 rounded-full animate-pulse"
                                  style={{ background: "#4ade80" }}
                                />
                                Pagado
                              </Badge>
                            </div>
                          </div>

                          {/* amount — fixed width, never truncated */}
                          <div className="shrink-0 text-right pl-2">
                            <p className="font-black text-[17px] text-white leading-none whitespace-nowrap">
                              {formatCurrency(item.monto)}
                            </p>
                            <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mt-1">
                              Soles
                            </p>
                          </div>
                        </div>

                        {/* divider + download row */}
                        <div
                          className="flex items-center justify-between pt-3 mt-3 border-t"
                          style={{ borderColor: "rgba(255,255,255,0.05)" }}
                        >
                          <div className="flex items-center gap-1.5 text-white/25">
                            <IconReceipt2 size={11} stroke={2} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              Boleta de venta
                            </span>
                          </div>

                          {pagoValido ? (
                            <BoletaDownloadButton
                              pago={pagoValido}
                              estudiante={item.estudiante}
                            />
                          ) : (
                            <span className="text-[9px] font-bold text-white/20 uppercase italic">
                              No disponible
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {historial.length > 0 && (
              <p className="px-5 pb-8 text-[10px] text-white/18 text-center leading-relaxed">
                Boletas emitidas oficialmente por la institución.
                <br />
                Ante discrepancias, contacta a administración.
              </p>
            )}
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}