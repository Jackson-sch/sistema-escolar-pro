"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { cn } from "@/lib/utils";
import {
  Shirt,
  ShoppingCart,
  History,
  LayoutDashboard,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  crearReservaUniformeAction,
  toggleFavoritoUniformeAction,
} from "@/actions/uniformes";
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

  // Persistir carrito
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${currentPadreId}`);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }
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
    <div className="flex flex-col lg:flex-row min-h-screen gap-6 animate-in fade-in duration-700">
      {/* Left Sidebar - Portal Navigation */}
      <aside className="w-full lg:w-64 space-y-6">
        <div className="bg-card backdrop-blur-xl p-6 rounded-[2rem] border shadow-xl shadow-slate-200/50 dark:shadow-none">
          <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-6 ml-2">
            Portal
          </p>
          <nav className="space-y-2">
            {[
              { id: "catalogo", label: "Inicio", icon: LayoutDashboard },
              { id: "full-catalog", label: "Catálogo", icon: Shirt },
              { id: "mis-reservas", label: "Mis Reservas", icon: History },
              { id: "smart-sizer", label: "Calculador de Talla", icon: Ruler },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveTab(
                    item.id === "full-catalog" ? "catalogo" : item.id,
                  )
                }
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                  activeTab === item.id ||
                    (item.id === "full-catalog" && activeTab === "catalogo")
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    activeTab === item.id
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-blue-500",
                  )}
                />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-card p-6 rounded-[2rem] border space-y-4">
          <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
            Soporte en Vivo
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            ¿Necesitas ayuda con las tallas?
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-black shadow-lg shadow-blue-500/20">
            Contactar a secretaría
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8">
        {activeTab === "catalogo" && (
          <>
            {/* Top Bar - Student Selection, Search and Filters */}
            <div className="space-y-6">
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
              {/* My Reservations Widget */}
              <ReservationsWidget setActiveTab={setActiveTab} ventas={ventas} />

              {/* Smart Sizer Widget */}
              <SmartSizerWidget />
            </div>

            {/* Essentials Catalogue Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <h3 className="text-3xl font-black dark:text-white">
                  Catálogo de Esenciales
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 border-slate-200 dark:border-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-10 w-10 border-slate-200 dark:border-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
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
          <div className="bg-white dark:bg-card backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <header className="space-y-1">
              <h2 className="text-3xl font-black dark:text-white">
                Historial de Reservas
              </h2>
              <p className="text-muted-foreground">
                Sigue y gestiona tus pedidos de uniformes.
              </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ventas.map((v) => (
                <ReservationCard key={v.id} venta={v} />
              ))}
              {ventas.length === 2 && (
                <div className="flex flex-col items-center justify-center p-20 text-muted-foreground bg-card backdrop-blur-sm rounded-[3rem] border border-dashed border-border">
                  <History className="h-16 w-16 mb-4 opacity-10" />
                  <p className="text-lg font-bold">
                    No se encontraron reservas
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
    </div>
  );
}
