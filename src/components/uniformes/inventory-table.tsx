"use client";

import { useState, useTransition } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Minus,
  History,
  AlertTriangle,
  PackageCheck,
  Building2,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarMovimientoInventarioAction } from "@/actions/uniformes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InventoryTableProps {
  variantes: any[];
  sedes: any[];
}

export function InventoryTable({ variantes, sedes }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSede, setSelectedSede] = useState("all");
  const [adjustmentModal, setAdjustmentModal] = useState<{
    open: boolean;
    variante: any | null;
  }>({
    open: false,
    variante: null,
  });

  const filteredVariantes = variantes.filter((v) => {
    const matchesSearch =
      v.uniforme.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.talla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSede = selectedSede === "all" || v.sedeId === selectedSede;
    return matchesSearch && matchesSede;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-border/40 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Buscar por prenda o talla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted/10 border-border/40 focus:bg-muted/20 transition-all rounded-xl"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <Select value={selectedSede} onValueChange={setSelectedSede}>
            <SelectTrigger className="w-full md:w-56 bg-muted/10 border-border/40 rounded-xl text-foreground">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground/60" />
              <SelectValue placeholder="Sede / Campus" />
            </SelectTrigger>
            <SelectContent className="bg-card/90 backdrop-blur-xl border-border/40 rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                Todas las sedes
              </SelectItem>
              {sedes.map((s) => (
                <SelectItem key={s.id} value={s.id} className="rounded-lg">
                  {s.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-xl rounded-2xl border border-border/40 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Prenda
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Categoría
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Talla
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">
                Sede
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">
                Stock Actual
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">
                Precio
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariantes.map((v) => (
              <TableRow
                key={v.id}
                className="hover:bg-muted/5 transition-colors border-border/40"
              >
                <TableCell className="font-bold text-foreground">
                  {v.uniforme.nombre}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-muted/10 border-border/40 font-bold text-[10px] uppercase tracking-tight text-muted-foreground"
                  >
                    {v.uniforme.categoria?.nombre || "General"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-primary/20">
                    {v.talla}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground/80 font-medium">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Building2 className="h-3.5 w-3.5 opacity-40 text-primary" />
                    {v.sede.nombre}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`font-black text-sm ${v.stock <= 5 ? "text-amber-500" : "text-foreground"}`}
                  >
                    {v.stock}
                  </div>
                </TableCell>
                <TableCell className="text-right font-black text-sm text-foreground/80">
                  S/ {v.precio.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAdjustmentModal({ open: true, variante: v })
                    }
                    className="text-primary hover:text-primary hover:bg-primary/10 font-bold rounded-xl"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1.5" />
                    Ajustar
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredVariantes.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-400 font-medium"
                >
                  No hay registros de inventario para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {adjustmentModal.open && (
        <StockAdjustmentModal
          open={adjustmentModal.open}
          onOpenChange={(open) => setAdjustmentModal({ open, variante: null })}
          variante={adjustmentModal.variante}
        />
      )}
    </div>
  );
}

function StockAdjustmentModal({
  open,
  onOpenChange,
  variante,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variante: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");

  const handleAdjust = () => {
    if (cantidad <= 0 && tipo !== "AJUSTE") {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    startTransition(async () => {
      const res = await registrarMovimientoInventarioAction({
        varianteId: variante.id,
        tipo,
        cantidad,
        motivo:
          motivo ||
          (tipo === "ENTRADA"
            ? "Carga de stock"
            : tipo === "SALIDA"
              ? "Venta directa"
              : "Ajuste manual"),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Inventario actualizado correctamente");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-foreground">
            <PackageCheck className="h-5 w-5 text-primary" />
            Ajustar Inventario
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/60 text-xs font-medium uppercase tracking-wider">
            {variante.uniforme.nombre} - Talla {variante.talla} (
            {variante.sede.nombre})
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/10 rounded-2xl border border-border/40">
            <Button
              variant={tipo === "ENTRADA" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTipo("ENTRADA")}
              className={`rounded-xl font-bold h-10 transition-all ${tipo === "ENTRADA" ? "bg-card text-emerald-500 shadow-lg border border-border/40" : "text-muted-foreground/60"}`}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Entrada
            </Button>
            <Button
              variant={tipo === "SALIDA" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTipo("SALIDA")}
              className={`rounded-xl font-bold h-10 transition-all ${tipo === "SALIDA" ? "bg-card text-rose-500 shadow-lg border border-border/40" : "text-muted-foreground/60"}`}
            >
              <Minus className="h-3.5 w-3.5 mr-1.5" />
              Salida
            </Button>
            <Button
              variant={tipo === "AJUSTE" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTipo("AJUSTE")}
              className={`rounded-xl font-bold h-10 transition-all ${tipo === "AJUSTE" ? "bg-card text-sky-500 shadow-lg border border-border/40" : "text-muted-foreground/60"}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
              Ajuste
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em] ml-1">
                {tipo === "AJUSTE"
                  ? "Stock Final deseado"
                  : "Cantidad del movimiento"}
              </label>
              <div className="flex items-center gap-4 bg-muted/5 p-2 rounded-2xl border border-border/40">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCantidad(Math.max(0, cantidad - 1))}
                  className="rounded-xl h-10 w-10 border-border/40 bg-card hover:bg-muted/20"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                  className="text-center font-black text-xl h-12 bg-transparent border-none focus:ring-0 shadow-none"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCantidad(cantidad + 1)}
                  className="rounded-xl h-10 w-10 border-border/40 bg-card hover:bg-muted/20"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.2em] ml-1">
                Motivo o Referencia
              </label>
              <Input
                placeholder="Ej. Guía de remisión #1234"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="bg-muted/10 border-border/40 h-11 rounded-xl focus:bg-muted/20"
              />
            </div>
          </div>

          <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
              <span className="font-black text-amber-500 block mb-1 uppercase tracking-wider">
                Importante
              </span>
              Este cambio será registrado en el historial de movimientos y
              afectará el stock disponible de forma inmediata.
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-border/40 bg-muted/10 text-foreground/80 hover:bg-muted/20 rounded-xl h-11 font-bold flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAdjust}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl h-11 font-bold flex-1"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
