"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Shirt,
  History,
  LayoutDashboard,
  Ruler,
  MessageSquare,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReservationCard from "@/components/portal/uniformes/reservation-card";
import HeroSection from "@/components/portal/uniformes/hero-section";
import TopBar from "@/components/portal/uniformes/top-bar";
import ReservationsWidget from "@/components/portal/uniformes/reservations-widget";
import SmartSizerWidget from "./smart-sizer-widget";
import PortalUniformCard from "./portal-uniform-card";

interface UniformSidebarNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: "catalogo", label: "Inicio", icon: LayoutDashboard },
  { id: "full-catalog", label: "Catálogo", icon: ShoppingBag },
  { id: "mis-reservas", label: "Mis Reservas", icon: History },
  { id: "smart-sizer", label: "Calculador de Talla", icon: Ruler },
];

export function UniformSidebarNav({
  activeTab,
  setActiveTab,
}: UniformSidebarNavProps) {
  return (
    <aside className="w-full lg:w-64 space-y-4 shrink-0">
      <div className="rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">
          Navegación Tienda
        </p>
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
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

      {/* Live Support Card */}
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
  );
}

interface UniformCatalogueTabProps {
  hijos: any[];
  selectedHijo: string;
  setSelectedHijo: (val: string) => void;
  selectedSede: string;
  setSelectedSede: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categorias: any[];
  cart: any[];
  onOpenCart: () => void;
  setActiveTab: (tab: string) => void;
  ventas: any[];
  filteredUniforms: any[];
  onAddToCart: (uniform: any, variante: any, qty: number) => void;
  currentPadreId: string;
}

export function UniformCatalogueTab({
  hijos,
  selectedHijo,
  setSelectedHijo,
  selectedSede,
  setSelectedSede,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categorias,
  cart,
  onOpenCart,
  setActiveTab,
  ventas,
  filteredUniforms,
  onAddToCart,
  currentPadreId,
}: UniformCatalogueTabProps) {
  return (
    <>
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
          onOpenCart={onOpenCart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HeroSection />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationsWidget setActiveTab={setActiveTab} ventas={ventas} />
        <SmartSizerWidget />
      </div>

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
              onAddToCart={(variante, qty) => onAddToCart(u, variante, qty)}
              sedeId={selectedSede}
              currentUserId={currentPadreId}
            />
          ))}
        </div>
      </div>
    </>
  );
}

interface UniformReservationsTabProps {
  ventas: any[];
}

export function UniformReservationsTab({
  ventas,
}: UniformReservationsTabProps) {
  return (
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
  );
}
