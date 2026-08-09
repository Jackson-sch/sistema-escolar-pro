import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  ArrowRight,
  Shirt,
  ShoppingBag,
  MapPin,
  X,
  Package,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";

export default function CartDrawer({
  cart,
  selectedSede,
  sedes,
  isCartOpen,
  setIsCartOpen,
  removeFromCart,
  handleCreateReservation,
  totalCart,
  isPending,
}: {
  cart: any[];
  selectedSede: string;
  sedes: any[];
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  removeFromCart: (id: string) => void;
  handleCreateReservation: () => void;
  totalCart: number;
  isPending: boolean;
}) {
  const sedeName = sedes.find((s) => s.id === selectedSede)?.nombre;

  return (
    <Drawer open={isCartOpen} onOpenChange={setIsCartOpen} direction="right">
      <DrawerContent className="ml-auto flex h-full max-w-[420px] flex-col border-l border-border/40 bg-card/95 shadow-lg outline-none">
        {/* ── HEADER ── */}
        <DrawerHeader className="border-b border-border/30 px-6 pb-4 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <ShoppingBag className="size-5" />
                </div>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-4 bg-amber-400 text-slate-900 text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-xs">
                    {cart.length}
                  </span>
                )}
              </div>
              <div>
                <DrawerTitle className="text-lg font-bold text-foreground tracking-tight leading-tight">
                  Carrito de Reservas
                </DrawerTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {cart.length === 0
                    ? "Sin prendas seleccionadas"
                    : `${cart.length} ${cart.length === 1 ? "prenda añadida" : "prendas añadidas"}`}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="size-8 rounded-xl border border-border/40 hover:bg-muted text-muted-foreground cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Sede indicator */}
          {sedeName && (
            <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/40 px-3 py-2">
              <MapPin className="size-4 text-indigo-500 shrink-0" />
              <DrawerDescription className="text-xs font-semibold text-foreground leading-none">
                Recojo en Sede: <span className="text-indigo-600 dark:text-indigo-400">{sedeName}</span>
              </DrawerDescription>
            </div>
          )}
        </DrawerHeader>

        {/* ── CART ITEMS LIST ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
              <div className="size-16 rounded-2xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground/40">
                <Package className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-foreground text-sm">
                  El carrito está vacío
                </p>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  Selecciona prendas y tallas desde el catálogo para reservar.
                </p>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.varianteId}
                className="group relative flex items-center gap-3.5 rounded-2xl border border-border/40 bg-card/80 p-3.5 transition-[border-color] hover:border-indigo-500/30 shadow-xs"
              >
                {/* Image */}
                <div className="size-14 rounded-xl bg-muted/30 border border-border/30 overflow-hidden shrink-0">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Shirt className="size-6 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-xs font-bold text-foreground truncate">
                    {item.nombre}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10">
                      Talla {item.talla}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-foreground">
                      {formatCurrency(item.precio)}
                    </span>
                  </div>
                </div>

                {/* Qty & Delete Action */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-xs font-bold font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                    x{item.cantidad}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.varianteId)}
                    className="size-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar prenda"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── FOOTER ── */}
        <DrawerFooter className="border-t border-border/30 bg-card/90 px-6 pb-6 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Estimado
              </p>
              <p className="text-[11px] text-muted-foreground/70 font-medium mt-0.5">
                {cart.reduce((acc, i) => acc + i.cantidad, 0)} prendas en reserva
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-foreground">
                {formatCurrency(totalCart)}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              handleCreateReservation();
              setIsCartOpen(false);
            }}
            disabled={isPending || cart.length === 0}
            className="w-full h-11 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed gap-2 cursor-pointer transition-[background-color,opacity]"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Procesando Reserva...</span>
              </>
            ) : (
              <>
                <span>Confirmar Reserva</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
