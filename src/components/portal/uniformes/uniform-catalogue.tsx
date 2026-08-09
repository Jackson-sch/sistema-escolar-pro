"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { cn } from "@/lib/utils";
import {
  Shirt,
  History,
  LayoutDashboard,
  Ruler,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { crearReservaUniformeAction } from "@/actions/uniformes";
import ReservationCard from "@/components/portal/uniformes/reservation-card";
import HeroSection from "@/components/portal/uniformes/hero-section";
import TopBar from "@/components/portal/uniformes/top-bar";
import CartDrawer from "@/components/portal/uniformes/cart-drawer";
import ReservationsWidget from "@/components/portal/uniformes/reservations-widget";
import SmartSizerWidget from "./smart-sizer-widget";
import PortalUniformCard from "./portal-uniform-card";

interface UniformCatalogueProps {
  uniforms: any[];
  categorias: any[];
  sedes: any[];
  hijos: any[];
  ventas: any[];
  currentPadreId: string;
}

export function UniformCatalogue({
  uniforms,
  categorias,
  sedes,
  hijos,
  ventas,
  currentPadreId,
}: UniformCatalogueProps) {
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "catalogo",
  });
  const [selectedCategory, setSelectedCategory] = useQueryState(
    "category",
    parseAsString.withDefault("all"),
  );
  const [searchTerm, setSearchTerm] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [selectedHijo, setSelectedHijo] = useQueryState(
    "student",
    parseAsString.withDefault(hijos[0]?.id || ""),
  );
  const [selectedSede, setSelectedSede] = useQueryState(
    "campus",
    parseAsString.withDefault(
      hijos[0]?.nivelAcademico?.sedeId || sedes[0]?.id || "",
    ),
  );
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let raf: number | undefined;
    try {
      const savedCart = localStorage.getItem(`cart_${currentPadreId}`);
      if (savedCart) {
        // Se difiere el setState para evitar llamadas síncronas dentro del efecto
        raf = requestAnimationFrame(() => setCart(JSON.parse(savedCart)));
      }
    } catch (e) {
      console.error("Error loading cart from localStorage", e);
    }
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [currentPadreId]);

  useEffect(() => {
    localStorage.setItem(`cart_${currentPadreId}`, JSON.stringify(cart));
  }, [cart, currentPadreId]);

  const filteredUniforms = uniforms.filter((u) => {
    const matchesCategory =
      selectedCategory === "all" || u.categoriaId === selectedCategory;
    const matchesSearch = u.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (uniform: any, variante: any, cantidad: number) => {
    const existing = cart.find((item) => item.varianteId === variante.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.varianteId === variante.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          varianteId: variante.id,
          nombre: uniform.nombre,
          talla: variante.talla,
          precio: variante.precio,
          cantidad,
          imagen: uniform.imagen,
        },
      ]);
    }
    toast.success(
      `${uniform.nombre} (Talla ${variante.talla}) añadido al carrito`,
    );
  };

  const removeFromCart = (varianteId: string) => {
    setCart(cart.filter((item) => item.varianteId !== varianteId));
  };

  const handleCreateReservation = () => {
    if (cart.length === 0) return;

    startTransition(async () => {
      const res = await crearReservaUniformeAction({
        estudianteId: selectedHijo,
        padreId: currentPadreId,
        sedeId: selectedSede,
        detalles: cart.map((item) => ({
          varianteId: item.varianteId,
          cantidad: item.cantidad,
          precioUnitario: item.precio,
        })),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("¡Reserva realizada con éxito!");
        setCart([]);
        setActiveTab("mis-reservas");
      }
    });
  };

  const totalCart = cart.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen gap-6 animate-in fade-in animation-duration-">
      {/* Left Sidebar - Navigation */}
      <aside className="w-full lg:w-64 space-y-4 shrink-0">
        <div className="rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
            Navegación Tienda
          </p>
          <nav className="space-y-1.5">
            {[
              { id: "catalogo", label: "Inicio", icon: LayoutDashboard },
              { id: "full-catalog", label: "Catálogo", icon: Shirt },
              { id: "mis-reservas", label: "Mis Reservas", icon: History },
              { id: "smart-sizer", label: "Calculador de Talla", icon: Ruler },
            ].map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === "full-catalog" && activeTab === "catalogo");

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setActiveTab(
                      item.id === "full-catalog" ? "catalogo" : item.id,
                    )
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-[color,background-color,box-shadow] cursor-pointer",
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Support Card (Dark/Light Responsive) */}
        <div className="p-4 rounded-2xl border border-indigo-500/20 bg-card/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-foreground">
                Soporte de Tallas
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Atención directa
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ¿Dudas con las medidas o cambios de prenda? Comunícate con la oficina.
          </p>
          <Button className="h-9 w-full rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer">
            <MessageSquare className="size-3.5" />
            <span>Contactar a Secretaría</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6 min-w-0">
        {activeTab === "catalogo" && (
          <>
            {/* Top Bar */}
            <div className="space-y-4">
              <TopBar
                hijos={hijos}
                selectedHijo={selectedHijo}
                setSelectedHijo={setSelectedHijo}
                setSelectedSede={setSelectedSede}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categorias={categorias}
                cart={cart}
                onOpenCart={() => setIsCartOpen(true)}
              />
            </div>

            {/* Hero Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <HeroSection />
            </div>

            {/* Middle Grid - Reservations & Smart Sizer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReservationsWidget setActiveTab={setActiveTab} ventas={ventas} />
              <SmartSizerWidget />
            </div>

            {/* Essentials Catalogue Section */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    Prendas y Uniformes Esenciales
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Catálogo oficial para el año escolar actual.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {filteredUniforms.map((u) => (
                  <PortalUniformCard
                    key={u.id}
                    uniform={u}
                    onAddToCart={(variante, qty) => addToCart(u, variante, qty)}
                    sedeId={selectedSede}
                    currentUserId={currentPadreId}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "mis-reservas" && (
          <div className="space-y-6 rounded-2xl border border-border/40 bg-card/80 p-6 shadow-sm animate-in fade-in animation-duration-">
            <header className="space-y-1 border-b border-border/20 pb-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Historial de Reservas y Pedidos
              </h2>
              <p className="text-xs text-muted-foreground">
                Seguimiento de entregas y estado de confirmación de uniformes.
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ventas.map((v) => (
                <ReservationCard key={v.id} venta={v} />
              ))}
              {ventas.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/80 p-12 text-muted-foreground">
                  <History className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-sm font-bold text-foreground">
                    No tienes reservas registradas
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Las solicitudes que realices desde el catálogo aparecerán aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "smart-sizer" && <SmartSizerWidget />}

        {/* Cart Drawer */}
        <CartDrawer
          cart={cart}
          selectedSede={selectedSede}
          sedes={sedes}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          removeFromCart={removeFromCart}
          handleCreateReservation={handleCreateReservation}
          totalCart={totalCart}
          isPending={isPending}
        />
      </main>

      {/* ── BOTÓN FLOTANTE (FAB - SOLO ICONO CIRCULAR APILADO) ── */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-36 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/50 hover:scale-105 active:scale-95 transition-[background-color,transform] cursor-pointer border border-white/20 group"
        title={`Mi Carrito (${cart.length})`}
      >
        <div className="relative">
          <Shirt className="size-5 group-hover:rotate-12 transition-transform" />
          {cart.length > 0 && (
            <span className="absolute -top-2.5 -right-2.5 size-5 bg-amber-400 text-slate-900 font-mono font-black text-[10px] rounded-full flex items-center justify-center border-2 border-indigo-600 animate-bounce">
              {cart.length}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
