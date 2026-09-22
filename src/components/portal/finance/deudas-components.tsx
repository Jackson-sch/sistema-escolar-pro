"use client";

import { formatCurrency, formatDate } from "@/lib/formats";
import {
  IconCalendar,
  IconUpload,
  IconCreditCard,
  IconAlertTriangle,
  IconReceipt,
  IconCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DeudasKpisProps {
  totalBalance: number;
  deudasLength: number;
  deudasVencidasLength: number;
  nextDeuda: any;
  historialLength: number;
}

export function DeudasKpis({
  totalBalance,
  deudasLength,
  deudasVencidasLength,
  nextDeuda,
  historialLength,
}: DeudasKpisProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Balance Total Pendiente */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Deuda Total
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">
            {formatCurrency(totalBalance)}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">
            {deudasLength} pensiones por pagar
          </p>
        </div>
        <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
          <IconCreditCard className="size-5" />
        </div>
      </div>

      {/* KPI 2: Cuotas Vencidas */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Cuotas Vencidas
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
            {deudasVencidasLength}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">
            {deudasVencidasLength > 0
              ? "Requiere pago prioritario"
              : "Sin morosidad"}
          </p>
        </div>
        <div className="size-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
          <IconAlertTriangle className="size-5" />
        </div>
      </div>

      {/* KPI 3: Próxima Pensión */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Próximo Vencimiento
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground mt-0.5">
            {nextDeuda
              ? formatDate(nextDeuda.fechaVencimiento, "dd MMM")
              : "Al Día"}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1 truncate max-w-[140px]">
            {nextDeuda ? nextDeuda.concepto.nombre : "Sin pensiones"}
          </p>
        </div>
        <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
          <IconCalendar className="size-5" />
        </div>
      </div>

      {/* KPI 4: Historial de Pagos */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow] hover:bg-card hover:shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pagos Auditados
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {historialLength}
          </h3>
          <p className="text-[11px] text-muted-foreground/80 mt-1">
            Comprobantes procesados
          </p>
        </div>
        <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
          <IconReceipt className="size-5" />
        </div>
      </div>
    </div>
  );
}

interface DeudasTableViewProps {
  deudas: any[];
  today: Date;
  onPayNow: (deuda: any) => void;
}

export function DeudasTableView({
  deudas,
  today,
  onPayNow,
}: DeudasTableViewProps) {
  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-2xl border border-border/40 bg-card/80 overflow-hidden shadow-xl">
        <Table className="w-full text-left">
          <TableHeader>
            <TableRow className="border-b border-border/30 bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Concepto / Pensión
              </TableHead>
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Estudiante
              </TableHead>
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Vencimiento
              </TableHead>
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Monto a Pagar
              </TableHead>
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right">
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {deudas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-8 py-16 text-center text-muted-foreground/70 font-medium text-xs"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <IconCheck className="size-10 text-emerald-500/40" />
                    <p className="font-bold text-foreground">
                      ¡Estás al día en tus pensiones!
                    </p>
                    <p className="text-muted-foreground">
                      No registras cuotas pendientes de pago en este periodo.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              deudas.map((deuda) => {
                const pendiente = deuda.monto - Number(deuda.montoPagado);
                const vencida = new Date(deuda.fechaVencimiento) < today;

                return (
                  <TableRow
                    key={deuda.id}
                    className="group hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-bold text-xs text-foreground">
                      {deuda.concepto.nombre}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs text-muted-foreground">
                      {deuda.estudiante.name} {deuda.estudiante.apellidoPaterno}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs font-mono text-muted-foreground">
                      {formatDate(deuda.fechaVencimiento, "dd MMM, yyyy")}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-bold font-mono text-sm text-foreground">
                      {formatCurrency(pendiente)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                          vencida
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            vencida ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                          }`}
                        />
                        {vencida ? "Vencida" : "Pendiente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => onPayNow(deuda)}
                        className={`rounded-xl px-4 h-8 font-semibold text-xs gap-1.5 shadow-xs cursor-pointer ${
                          vencida
                            ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                        }`}
                      >
                        <IconUpload className="size-3.5" />
                        <span>Subir Voucher</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-3">
        {deudas.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground/70 text-xs font-medium bg-card/80 rounded-2xl border border-border/40">
            No tienes pensiones pendientes de pago.
          </div>
        ) : (
          deudas.map((deuda) => {
            const pendiente = deuda.monto - Number(deuda.montoPagado);
            const vencida = new Date(deuda.fechaVencimiento) < today;

            return (
              <div
                key={deuda.id}
                className="p-4 rounded-2xl border border-border/40 bg-card/80 space-y-3 shadow-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">
                      {deuda.concepto.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {deuda.estudiante.name} {deuda.estudiante.apellidoPaterno}
                    </p>
                  </div>
                  <Badge
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      vencida
                        ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    }`}
                  >
                    {vencida ? "Vencida" : "Pendiente"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Monto
                    </span>
                    <p className="text-base font-bold font-mono text-foreground mt-0.5">
                      {formatCurrency(pendiente)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Vencimiento
                    </span>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {formatDate(deuda.fechaVencimiento, "dd MMM, yyyy")}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => onPayNow(deuda)}
                  className={`w-full h-9 rounded-xl font-semibold text-xs gap-1.5 mt-2 ${
                    vencida
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  <IconUpload className="size-4" />
                  <span>Subir Voucher de Pago</span>
                </Button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
