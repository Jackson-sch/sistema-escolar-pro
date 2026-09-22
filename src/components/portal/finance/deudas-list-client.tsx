"use client";

import { useState } from "react";
import { IconHistory } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { PaymentDrawer } from "./payment-drawer";
import { PaymentHistoryDrawer } from "./payment-history-drawer";
import { StudentSelector } from "@/components/portal/layout/student-selector";
import { DeudasKpis, DeudasTableView } from "./deudas-components";

interface DeudasListClientProps {
  hijos: any[];
  deudas: any[];
  historial?: any[];
  selectedHijoId?: string;
  bancos?: any[];
}

const EMPTY_HIJOS: any[] = [];
const EMPTY_DEUDAS: any[] = [];
const EMPTY_HISTORIAL: any[] = [];

export function DeudasListClient({
  hijos = EMPTY_HIJOS,
  deudas = EMPTY_DEUDAS,
  historial = EMPTY_HISTORIAL,
}: DeudasListClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState<any>(null);

  // Fecha actual estable para cálculos de vencimiento
  const today = new Date();

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

  // Cálculos de resumen
  const totalBalance = deudas.reduce(
    (acc, d) => acc + (d.monto - Number(d.montoPagado)),
    0,
  );

  const deudasVencidas = deudas.filter(
    (d) => new Date(d.fechaVencimiento) < today,
  );

  const nextDeuda = deudas.length > 0 ? deudas[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in animation-duration-">
      {/* Selector de estudiante si hay múltiples */}
      {hijos.length > 1 && (
        <div className="p-3.5 rounded-2xl bg-card/80 border border-border/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Filtrar por estudiante:
            </span>
          </div>
          <StudentSelector students={hijos} />
        </div>
      )}

      {/* ── BENTO KPIS FINANCIEROS ── */}
      <DeudasKpis
        totalBalance={totalBalance}
        deudasLength={deudas.length}
        deudasVencidasLength={deudasVencidas.length}
        nextDeuda={nextDeuda}
        historialLength={historial.length}
      />

      {/* ── TABLA DE PENSIONES PENDIENTES ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Pensiones y Cuotas Pendientes
            </h3>
            <p className="text-xs text-muted-foreground">
              Selecciona una pensión para subir tu voucher de transferencia o Yape.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
            className="rounded-xl h-9 px-3.5 font-semibold text-xs border-border/40 gap-2 cursor-pointer shrink-0"
          >
            <IconHistory className="size-4 text-indigo-500" />
            <span>Ver Historial de Pagos</span>
          </Button>
        </div>

        <DeudasTableView
          deudas={deudas}
          today={today}
          onPayNow={handlePayNow}
        />
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
