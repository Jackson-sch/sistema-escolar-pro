"use client";

import { useState, useTransition } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Building2,
  Package,
  Layers,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  aprobarVentaUniformeAction,
  confirmarEntregaUniformeAction,
  actualizarEstadoVentaUniformeAction,
} from "@/actions/uniformes";
import { SalesDetailDialog } from "./sales-detail-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency, formatDate } from "@/lib/formats";

interface SalesTableProps {
  ventas: any[];
  adminId: string;
}

export function SalesTable({ ventas, adminId }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVenta, setSelectedVenta] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredVentas = ventas.filter((v) => {
    const studentName =
      `${v.estudiante.name} ${v.estudiante.apellidoPaterno}`.toLowerCase();
    return (
      studentName.includes(searchTerm.toLowerCase()) ||
      v.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleUpdateStatus = (ventaId: string, nuevoEstado: any) => {
    startTransition(async () => {
      const res = await actualizarEstadoVentaUniformeAction(
        ventaId,
        nuevoEstado,
      );
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        toast.success(`Estado del pedido actualizado a ${nuevoEstado}`);
        setSelectedVenta(res.data);
      }
    });
  };

  const handleApprove = (ventaId: string) => {
    startTransition(async () => {
      const res = await aprobarVentaUniformeAction(ventaId, adminId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        toast.success("Reserva aprobada y vinculada al cronograma de pagos");
        setSelectedVenta(res.data.venta);
      }
    });
  };

  const handleConfirmDelivery = (ventaId: string) => {
    startTransition(async () => {
      const res = await confirmarEntregaUniformeAction(ventaId);
      if (res.error) {
        toast.error(res.error);
      } else if (res.data) {
        toast.success("Pedido entregado y stock actualizado correctamente");
        setSelectedVenta(res.data);
      }
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "RESERVADO":
        return (
          <Badge className="bg-amber-500/5 text-amber-500 border border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.05)] px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-300">
            <Clock className="size-3 mr-1.5 animate-pulse" /> Reservado
          </Badge>
        );
      case "APROBADO":
        return (
          <Badge className="bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)] px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-300">
            <CheckCircle2 className="size-3 mr-1.5" /> Aprobado
          </Badge>
        );
      case "ENTREGADO":
        return (
          <Badge className="bg-sky-500/5 text-sky-500 border border-sky-500/20 shadow-[0_2px_8px_rgba(14,165,233,0.05)] px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-300">
            <Package className="size-3 mr-1.5" /> Entregado
          </Badge>
        );
      case "EN_PRUEBA":
        return (
          <Badge className="bg-violet-500/5 text-violet-500 border border-violet-500/20 shadow-[0_2px_8px_rgba(139,92,246,0.05)] px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-300">
            <Layers className="size-3 mr-1.5" /> En Prueba
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge className="bg-rose-500/5 text-rose-500 border border-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.05)] px-2.5 py-1 rounded-xl font-black text-[9px] uppercase tracking-wider transition-all duration-300">
            <XCircle className="size-3 mr-1.5" /> Cancelado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-border/40 text-[9px] uppercase font-bold"
          >
            {estado}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/25 backdrop-blur-xl p-5 rounded-2xl border border-border/20 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar por estudiante o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/10 border-border/30 focus:border-primary/50 focus:bg-muted/15 focus:ring-1 focus:ring-primary/30 transition-all rounded-xl shadow-inner"
          />
        </div>
      </div>

      <div className="bg-card/20 backdrop-blur-md rounded-2xl border border-border/25 shadow-2xl overflow-hidden transition-all duration-300">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent border-border/30">
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Código
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Estudiante
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Fecha
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Sede
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60 text-right">
                Total
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60">
                Estado
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-widest text-muted-foreground/60 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVentas.map((v) => (
              <TableRow
                key={v.id}
                onClick={() => setSelectedVenta(v)}
                className="hover:bg-primary/5 active:bg-primary/10 transition-all duration-300 border-border/10 cursor-pointer group"
              >
                <TableCell className="py-4">
                  <span className="font-mono text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-xl shadow-inner select-all">
                    {v.codigo}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors duration-200">
                      {v.estudiante.name} {v.estudiante.apellidoPaterno}
                    </span>
                    <span className="text-[8px] text-primary/80 bg-primary/5 border border-primary/10 tracking-widest px-2 py-0.5 rounded-full uppercase font-black max-w-max mt-1">
                      {v.estudiante.role}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground/80 text-xs font-semibold tracking-tight">
                  {formatDate(v.createdAt, "dd MMM yyyy")}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/80 font-bold bg-muted/30 border border-border/10 rounded-full px-2.5 py-1">
                    <Building2 className="h-3.5 w-3.5 opacity-60 text-primary" />
                    {v.sede.nombre}
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-sm text-foreground tracking-tight py-4">
                  {formatCurrency(v.total)}
                </TableCell>
                <TableCell>{getStatusBadge(v.estado)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVenta(v);
                    }}
                    className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredVentas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-400 font-medium"
                >
                  No se encontraron ventas para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <SalesDetailDialog
        venta={selectedVenta}
        onClose={() => setSelectedVenta(null)}
        isPending={isPending}
        onUpdateStatus={handleUpdateStatus}
        onApprove={handleApprove}
        onConfirmDelivery={handleConfirmDelivery}
      />
    </div>
  );
}
