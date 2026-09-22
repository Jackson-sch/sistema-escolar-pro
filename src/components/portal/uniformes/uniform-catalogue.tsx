"use client";

import { useEffect, useState, useTransition } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { Shirt } from "lucide-react";
import { toast } from "sonner";
import { crearReservaUniformeAction } from "@/actions/uniformes";
import CartDrawer from "@/components/portal/uniformes/cart-drawer";
import SmartSizerWidget from "./smart-sizer-widget";
import {
  UniformSidebarNav,
  UniformCatalogueTab,
  UniformReservationsTab,
} from "./uniform-catalogue-sections";

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
      <UniformSidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 space-y-6 min-w-0">
        {activeTab === "catalogo" && (
          <UniformCatalogueTab
            hijos={hijos}
            selectedHijo={selectedHijo}
            setSelectedHijo={setSelectedHijo}
            selectedSede={selectedSede}
            setSelectedSede={setSelectedSede}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categorias={categorias}
            cart={cart}
            onOpenCart={() => setIsCartOpen(true)}
            setActiveTab={setActiveTab}
            ventas={ventas}
            filteredUniforms={filteredUniforms}
            onAddToCart={addToCart}
            currentPadreId={currentPadreId}
          />
        )}

        {activeTab === "mis-reservas" && (
          <UniformReservationsTab ventas={ventas} />
        )}

        {activeTab === "smart-sizer" && <SmartSizerWidget />}

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

      {/* Botón flotante FAB */}
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
