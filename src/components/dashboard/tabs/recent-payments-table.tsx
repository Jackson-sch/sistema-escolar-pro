"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconReceipt2, IconArrowUpRight, IconCash, IconCreditCard } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/formats";

interface RecentPaymentsTableProps {
  payments: any[];
}

export function RecentPaymentsTable({ payments = [] }: RecentPaymentsTableProps) {
  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 shadow-2xs overflow-hidden">
      <CardHeader className="py-3.5 px-4 sm:px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <IconReceipt2 className="size-4 text-emerald-500" />
            Últimos Ingresos Registrados
          </CardTitle>
          <CardDescription className="text-xs">
            Cobros procesados en caja y depósitos bancarios conciliados
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs font-semibold text-primary gap-1 cursor-pointer"
          asChild
        >
          <Link href="/finanzas">
            Ver cobranza <IconArrowUpRight size={13} />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No se registran pagos recientes en el periodo actual.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {payments.map((p, idx) => {
              const student = p.estudiante;
              const fullName = student
                ? `${student.name || ""} ${student.apellidoPaterno || ""}`.trim()
                : "Cliente general";

              return (
                <div
                  key={p.id || idx}
                  className="p-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {p.fechaPago ? formatDate(p.fechaPago) : "-"}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      Concepto:{" "}
                      <span className="font-semibold text-foreground">
                        {p.concepto}
                      </span>
                      {p.metodoPago && (
                        <span className="ml-2 font-mono text-[10px] uppercase text-muted-foreground/80">
                          ({p.metodoPago})
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.monto)}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold px-2 py-0.5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hidden sm:inline-flex"
                    >
                      Cobrado
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
