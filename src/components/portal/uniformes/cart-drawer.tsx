import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shirt,
  ShoppingBag,
  MapPin,
  X,
  Package,
  Trash,
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
      <DrawerContent className="h-full flex flex-col bg-white dark:bg-[#0f0f0f] border-l border-slate-100 dark:border-white/6 shadow-2xl max-w-[420px] ml-auto">
        {/* Header */}
        <DrawerHeader className="px-7 pt-8 pb-6 border-b border-slate-100 dark:border-white/6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="h-11 w-11 bg-primary rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                    {cart.length}
                  </span>
                )}
              </div>
              <div>
                <DrawerTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">
                  Tu Carrito
                </DrawerTitle>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {cart.length === 0
                    ? "Sin productos aún"
                    : `${cart.length} ${cart.length === 1 ? "producto" : "productos"}`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-white/7 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/12 transition-colors"
            >
              <X className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Sede pill */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8 rounded-xl px-3.5 py-2.5">
            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <DrawerDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-none">
              Recojo en{" "}
              <span className="font-black text-slate-900 dark:text-white">
                {sedeName}
              </span>
            </DrawerDescription>
          </div>
        </DrawerHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-5">
              <div className="relative">
                <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-black text-slate-900 dark:text-white text-base">
                  Nada por aquí
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                  Agrega productos para continuar
                </p>
              </div>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={item.varianteId}
                className="group relative flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-white/6 bg-white dark:bg-white/2 hover:border-blue-200 dark:hover:border-blue-500/20 hover:bg-blue-50/30 dark:hover:bg-blue-500/4 transition-all duration-200"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Image */}
                <div className="h-[60px] w-[60px] rounded-xl bg-slate-100 dark:bg-white/6 overflow-hidden shrink-0">
                  {item.imagen ? (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Shirt className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight">
                    {item.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/6 px-2 py-0.5 rounded-md">
                      T. {item.talla}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.precio)} c/u
                    </span>
                  </div>
                </div>

                {/* Qty & Remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black px-2.5 py-1 rounded-lg leading-none">
                    &times; {item.cantidad}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.varianteId)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1.5 py-0.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="px-7 pb-8 pt-5 border-t border-slate-100 dark:border-white/6 bg-white dark:bg-[#0f0f0f]">
          {/* Total breakdown */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
                Total Estimado
              </p>
              <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">
                Impuestos incluidos
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                {formatCurrency(totalCart)}
              </p>
              {cart.length > 0 && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {cart.reduce((acc, i) => acc + i.cantidad, 0)} unidades
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => {
              handleCreateReservation();
              setIsCartOpen(false);
            }}
            disabled={isPending || cart.length === 0}
            className="w-full h-14 rounded-2xl font-black text-sm tracking-wide
              bg-primary hover:bg-primary/90 text-white
              disabled:opacity-30 disabled:cursor-not-allowed
              shadow-lg shadow-slate-900/10 dark:shadow-white/5
              group transition-all duration-200"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Confirmar Reserva
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </span>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
