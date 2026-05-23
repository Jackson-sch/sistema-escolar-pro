"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { IconCalendar, IconUpload, IconCreditCard } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentDrawer } from "./payment-drawer";
import { PaymentHistoryDrawer } from "./payment-history-drawer";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/common/stat-card";

interface DeudasListClientProps {
  hijos: any[];
  deudas: any[];
  historial?: any[];
  selectedHijoId?: string;
  // Note: we might keep the bancos prop if deudas-list-client is used elsewhere,
  // but for now we are moving the display to the sidebar.
  bancos?: any[];
}

export function DeudasListClient({
  deudas,
  historial = [],
}: DeudasListClientProps) {
  console.log("🚀 ~ DeudasListClient ~ deudas:", deudas)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
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
  console.log("🚀 ~ DeudasListClient ~ nextDeuda:", nextDeuda)

  const stats = [
    {
      title: "BALANCE TOTAL PENDIENTE",
      value: formatCurrency(totalBalance),
      icon: IconCreditCard,
      iconColor: "text-success",
      glowColor: "#22c55e55", // tu color para el glow (CSS real)
      className: "shadow-lg",
      description: "Agradecemos poner al día en sus pagos",
    },
    {
      title: "PRÓXIMA PENSIÓN",
      value: nextDeuda
        ? formatDate(nextDeuda.fechaVencimiento, "dd MMM, yyyy")
        : "Sin Pendientes",
      icon: IconCalendar,
      iconColor: "text-warning",
      glowColor: "#f9731655", // tu color para el glow (CSS real)
      className: "shadow-lg",
      description: nextDeuda
        ? `Monto: ${formatCurrency(nextDeuda.monto - Number(nextDeuda.montoPagado))}`
        : "No tienes pensiones pendientes",
    },
  ];

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Overview Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
            glowColor={stat.glowColor}
            className={stat.className}
            description={stat.description}
          />
        ))}
      </div>

      {/* Monthly Fees Table */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <h3 className="text-xl md:text-2xl font-black tracking-tight">
            Pensiones Mensuales
          </h3>
          <Button
            variant="link"
            onClick={() => setHistoryOpen(true)}
            className="w-fit p-2 h-auto text-primary hover:text-primary/80 font-bold text-xxs md:text-xs gap-2 transition-colors"
          >
            <IconUpload size={14} className="md:size-4" />
            <span className="underline underline-offset-4 decoration-2">
              Historial de Pagos
            </span>
          </Button>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block rounded-[1.5rem] border border-white/10 dark:border-white/5 liquid-glass overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="border-b border-border bg-accent-foreground/5 text-muted-foreground">
                  <TableHead className="px-4 py-2 text-xxs font-black uppercase tracking-widest w-2/5">
                    DESCRIPCIÓN
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xxs font-black uppercase tracking-widest">
                    MONTO
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xxs font-black uppercase tracking-widest">
                    ESTADO
                  </TableHead>
                  <TableHead className="px-4 py-2 text-xxs font-black uppercase tracking-widest text-right">
                    ACCIÓN
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/5">
                {deudas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="px-8 py-20 text-center text-muted-foreground/60 font-medium italic"
                    >
                      No se encontraron pensiones pendientes para este periodo.
                    </TableCell>
                  </TableRow>
                ) : (
                  deudas.map((deuda) => {
                    const pendiente = deuda.monto - Number(deuda.montoPagado);
                    const vencida =
                      new Date(deuda.fechaVencimiento) < new Date();

                    return (
                      <TableRow
                        key={deuda.id}
                        className="group hover:bg-white/1 transition-colors"
                      >
                        <TableCell className="px-4 py-2 capitalize">
                          <p className="font-bold text-[12px] text-foreground dark:text-white/90">
                            {deuda.concepto.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {deuda.estudiante.name}{" "}
                            {deuda.estudiante.apellidoPaterno}
                          </p>
                        </TableCell>
                        <TableCell className="font-bold text-[15px] text-foreground dark:text-white/90">
                          {formatCurrency(pendiente)}
                          <br />
                          <span className="text-xxs text-muted-foreground mt-1">
                            Venc:{" "}
                            {formatDate(deuda.fechaVencimiento, "dd MMM, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black capitalize border border-current bg-current/10 ${
                              vencida ? "text-rose-500" : "text-warning"
                            }`}
                          >
                            <div className="size-1.5 rounded-full bg-current animate-pulse" />
                            {vencida ? "VENCIDA" : "PENDIENTE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center">
                          <Button
                            variant="link"
                            title="Pagar Ahora"
                            onClick={() => handlePayNow(deuda)}
                            className={`p-0 h-auto font-black text-xs hover:no-underline transition-colors ${
                              vencida ? "text-rose-500" : "text-primary"
                            }`}
                          >
                            {vencida ? "Resolver" : "Pagar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4">
          {deudas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground/60 font-medium italic liquid-glass rounded-[1.25rem] border border-white/5">
              No se encontraron pensiones pendientes.
            </div>
          ) : (
            deudas.map((deuda) => {
              const pendiente = deuda.monto - Number(deuda.montoPagado);
              const vencida = new Date(deuda.fechaVencimiento) < new Date();

              return (
                <div
                  key={deuda.id}
                  className="p-6 rounded-[1.25rem] border border-white/5 liquid-glass space-y-6 shadow-xl relative overflow-hidden"
                >
                  {/* Subtle Glow decoration for premium feel */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  
                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="min-w-0">
                      <p className="font-bold text-lg text-white/90 uppercase tracking-tight leading-tight truncate">
                        {deuda.concepto.nombre}
                      </p>
                      <p className="text-[9px] font-black text-muted-foreground/40 mt-1 uppercase tracking-widest truncate">
                        {deuda.estudiante.name}{" "}
                        {deuda.estudiante.apellidoPaterno}
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-current bg-current/10 shrink-0 ${
                        vencida ? "text-rose-500" : "text-orange-500"
                      }`}
                    >
                      {vencida ? "VENCIDA" : "PENDIENTE"}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        MONTO
                      </p>
                      <p className="text-xl font-black text-white">
                        {formatCurrency(pendiente)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                        VENCIMIENTO
                      </p>
                      <p className="text-xs font-bold text-white/70">
                        {formatDate(deuda.fechaVencimiento, "dd MMM, yyyy")}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePayNow(deuda)}
                    className={`w-full h-11 rounded-xl font-black text-xxs uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
                      vencida
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
                        : "bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/20"
                    }`}
                  >
                    {vencida ? "Resolver Ahora" : "Pagar Pensión"}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <PaymentDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        selectedDeuda={selectedDeuda}
      />

      <PaymentHistoryDrawer
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        historial={historial}
      />
    </div>
  );
}
