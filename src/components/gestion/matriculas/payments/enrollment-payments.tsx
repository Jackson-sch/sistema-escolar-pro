"use client";

import * as React from "react";
import { getStudentCobroDetailsAction } from "@/actions/finance/cronograma";
import { IconLoader2, IconReceipt, IconRefresh } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  EnrollmentPaymentsSummary,
} from "./components/enrollment-payments-summary";
import {
  EnrollmentPaymentsFilter,
  PaymentFilterType,
} from "./components/enrollment-payments-filter";
import {
  EnrollmentPaymentItem,
  PaymentItemData,
} from "./components/enrollment-payment-item";

interface EnrollmentPaymentsProps {
  estudianteId: string;
  onGuardianLoaded?: (guardian: any) => void;
}

export function EnrollmentPayments({
  estudianteId,
  onGuardianLoaded,
}: EnrollmentPaymentsProps) {
  const [data, setData] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<PaymentFilterType>("todos");

  const loadData = React.useCallback(async () => {
    if (!estudianteId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentCobroDetailsAction({ estudianteId });
      if (res.success) {
        setData(res.success);
        if (res.success.primaryGuardian && onGuardianLoaded) {
          onGuardianLoaded(res.success.primaryGuardian);
        }
      } else {
        setError(res.error || "No se pudo cargar el expediente de cobranza");
      }
    } catch (err) {
      console.error(err);
      setError("Error inesperado al consultar finanzas del estudiante");
    } finally {
      setLoading(false);
    }
  }, [estudianteId, onGuardianLoaded]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="h-72 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-dashed border-border/70 bg-card/40">
        <IconLoader2 className="size-7 animate-spin text-primary" />
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-foreground">
            Consultando expediente de pagos...
          </p>
          <p className="text-[11px] text-muted-foreground">
            Sincronizando cuotas, pensiones y estados de cuenta
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border/60 bg-card/40 text-center">
        <p className="text-xs font-bold text-destructive">
          {error || "No se encontró información financiera"}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          className="rounded-xl text-xs gap-1.5 cursor-pointer"
        >
          <IconRefresh className="size-3.5" /> Reintentar
        </Button>
      </div>
    );
  }

  const cronogramas: PaymentItemData[] = data.cronogramas || [];

  if (cronogramas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-2xl border border-dashed border-border/70 bg-card/40 text-center gap-3">
        <div className="size-12 rounded-2xl bg-muted/70 flex items-center justify-center text-muted-foreground">
          <IconReceipt className="size-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground">
            Sin cronograma de pagos generado
          </h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Este estudiante no cuenta con cuotas o pensiones programadas para el ciclo actual.
          </p>
        </div>
      </div>
    );
  }

  const counts = {
    todos: cronogramas.length,
    pendientes: cronogramas.filter((c) => c.estado !== "PAID" && !c.pagado).length,
    pagados: cronogramas.filter((c) => c.estado === "PAID" || c.pagado).length,
  };

  const filteredItems = cronogramas.filter((c) => {
    if (filter === "pendientes") return c.estado !== "PAID" && !c.pagado;
    if (filter === "pagados") return c.estado === "PAID" || c.pagado;
    return true;
  });

  const resumen = data.resumen || {
    totalCobrado: 0,
    totalPorCobrarAnio: 0,
    totalDeudaVencida: 0,
    cuotasVencidasCount: 0,
  };

  return (
    <div className="space-y-4">
      {/* 1. Bento KPI Resumen Financiero */}
      <EnrollmentPaymentsSummary
        totalCobrado={resumen.totalCobrado}
        totalPorCobrar={resumen.totalPorCobrarAnio}
        totalDeudaVencida={resumen.totalDeudaVencida}
        cuotasVencidasCount={resumen.cuotasVencidasCount}
      />

      {/* 2. Filtros Rápidos de Cuotas */}
      <EnrollmentPaymentsFilter
        currentFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />

      {/* 3. Lista de Cuotas Detalladas */}
      <ScrollArea className="h-[360px] sm:h-[420px] pr-2">
        <div className="space-y-2.5 pb-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No hay cuotas en este filtro.
            </div>
          ) : (
            filteredItems.map((payment) => (
              <EnrollmentPaymentItem
                key={payment.id}
                payment={payment}
                estudianteId={estudianteId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
