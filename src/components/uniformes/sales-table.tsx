"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  User,
  BadgeDollarSign,
  Calendar,
  Eye,
  Building2,
  Package,
  Layers,
  Loader2,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  aprobarVentaUniformeAction,
  confirmarEntregaUniformeAction,
  actualizarEstadoVentaUniformeAction,
} from "@/actions/uniformes";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
      } else {
        toast.success(`Estado del pedido actualizado a ${nuevoEstado}`);
        setSelectedVenta(null);
      }
    });
  };

  const handleApprove = (ventaId: string) => {
    startTransition(async () => {
      const res = await aprobarVentaUniformeAction(ventaId, adminId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Reserva aprobada y vinculada al cronograma de pagos");
        setSelectedVenta(null);
      }
    });
  };

  const handleConfirmDelivery = (ventaId: string) => {
    startTransition(async () => {
      const res = await confirmarEntregaUniformeAction(ventaId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Pedido entregado y stock actualizado correctamente");
        setSelectedVenta(null);
      }
    });
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "RESERVADO":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 shadow-none px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            <Clock className="h-3 w-3 mr-1.5" /> Reservado
          </Badge>
        );
      case "APROBADO":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-none px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3 mr-1.5" /> Aprobado
          </Badge>
        );
      case "ENTREGADO":
        return (
          <Badge className="bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border border-sky-500/20 shadow-none px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            <Package className="h-3 w-3 mr-1.5" /> Entregado
          </Badge>
        );
      case "EN_PRUEBA":
        return (
          <Badge className="bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border border-violet-500/20 shadow-none px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            <Layers className="h-3 w-3 mr-1.5" /> En Prueba
          </Badge>
        );
      case "CANCELADO":
        return (
          <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 shadow-none px-2 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider">
            <XCircle className="h-3 w-3 mr-1.5" /> Cancelado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-border/40 text-[10px] uppercase font-bold"
          >
            {estado}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar por estudiante o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/10 border-border/40 focus:bg-muted/20 transition-all rounded-xl"
          />
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Código
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Estudiante
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Fecha
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Sede
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">
                Total
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Estado
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVentas.map((v) => (
              <TableRow
                key={v.id}
                className="hover:bg-muted/5 transition-colors border-border/40"
              >
                <TableCell className="font-mono text-[10px] font-black text-primary tracking-tighter">
                  {v.codigo}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm tracking-tight">
                      {v.estudiante.name} {v.estudiante.apellidoPaterno}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest">
                      {v.estudiante.role}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground/80 text-xs font-medium">
                  {format(new Date(v.createdAt), "dd MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
                    <Building2 className="h-3.5 w-3.5 opacity-40 text-primary" />
                    {v.sede.nombre}
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-sm text-foreground">
                  S/ {v.total.toFixed(2)}
                </TableCell>
                <TableCell>{getStatusBadge(v.estado)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVenta(v)}
                    className="text-primary hover:text-primary hover:bg-primary/10 font-bold rounded-xl"
                  >
                    <Eye className="h-4 w-4 mr-1.5" />
                    Detalles
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

      <Dialog
        open={!!selectedVenta}
        onOpenChange={(open) => !open && setSelectedVenta(null)}
      >
        <DialogContent className="sm:max-w-[500px] border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black text-foreground tracking-tight">
              <BadgeDollarSign className="h-7 w-7 text-primary" />
              Venta {selectedVenta?.codigo}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">
              Gestión de reserva y aprobación administrativa.
            </DialogDescription>
          </DialogHeader>

          {selectedVenta && (
            <div className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-muted/5 border border-border/40">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Estudiante
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <User className="h-3.5 w-3.5 text-primary" />
                    {selectedVenta.estudiante.name}{" "}
                    {selectedVenta.estudiante.apellidoPaterno}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                    Sede de recojo
                  </span>
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {selectedVenta.sede.nombre}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em] ml-1">
                  Resumen de pedido
                </span>
                <div className="bg-muted/10 rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/20">
                  {selectedVenta.detalles.map((d: any) => (
                    <div
                      key={d.id}
                      className="p-4 flex justify-between items-center bg-card/20"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-foreground">
                          {d.variante.uniforme.nombre}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-wider">
                          Talla {d.variante.talla} &bull; {d.cantidad} unid.
                        </span>
                      </div>
                      <span className="text-sm font-black text-foreground/80">
                        S/ {d.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="p-4 flex justify-between items-center bg-primary/5">
                    <span className="text-sm font-black text-foreground uppercase tracking-wider">
                      Total Final
                    </span>
                    <span className="text-xl font-black text-primary">
                      S/ {selectedVenta.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedVenta.estado === "RESERVADO" && (
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex items-start gap-4">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    <span className="font-black text-primary block mb-1 uppercase tracking-wider underline underline-offset-4">
                      Aprobación Administrativa
                    </span>
                    Al aprobar esta reserva, se generará una obligación de pago
                    y el stock se reservará definitivamente.
                  </div>
                </div>
              )}

              {selectedVenta.estado === "APROBADO" && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold text-green-800">
                      Esta venta ya ha sido aprobada
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-green-700 hover:bg-green-100"
                  >
                    Ver Pago
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-6 gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedVenta(null)}
              disabled={isPending}
              className="border-border/40 bg-muted/10 text-foreground/80 hover:bg-muted/20 rounded-xl h-11 font-bold flex-1"
            >
              Cerrar
            </Button>
            {selectedVenta?.estado === "RESERVADO" && (
              <div className="flex gap-2 flex-3">
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleUpdateStatus(selectedVenta.id, "CANCELADO")
                  }
                  disabled={isPending}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl font-bold h-11"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleUpdateStatus(selectedVenta.id, "EN_PRUEBA")
                  }
                  disabled={isPending}
                  className="border-violet-500/40 bg-violet-500/5 text-violet-500 hover:bg-violet-500/10 rounded-xl h-11 font-bold px-4"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Prueba
                </Button>
                <Button
                  onClick={() => handleApprove(selectedVenta.id)}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-11 font-bold flex-1"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Aprobar y Cobrar"
                  )}
                </Button>
              </div>
            )}
            {selectedVenta?.estado === "EN_PRUEBA" && (
              <div className="flex gap-2 flex-3">
                <Button
                  variant="ghost"
                  onClick={() =>
                    handleUpdateStatus(selectedVenta.id, "CANCELADO")
                  }
                  disabled={isPending}
                  className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl font-bold h-11"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleApprove(selectedVenta.id)}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-11 font-bold flex-1"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Aprobar y Cobrar"
                  )}
                </Button>
              </div>
            )}
            {selectedVenta?.estado === "APROBADO" && (
              <Button
                onClick={() => handleConfirmDelivery(selectedVenta.id)}
                disabled={isPending}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-xl h-11 font-bold flex-2"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirmar Entrega"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
