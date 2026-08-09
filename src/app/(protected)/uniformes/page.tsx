import { Suspense } from "react";
import { auth } from "@/auth";
import {
  getCategoriasUniformesAction,
  getUniformesAction,
  getVentasUniformesAction,
  getTodasLasVariantesAction,
} from "@/actions/uniformes";
import { getSedesAction } from "@/actions/sedes";
import { UniformList } from "@/components/uniformes/uniform-list";
import { InventoryTable } from "@/components/uniformes/inventory-table";
import { SalesTable } from "@/components/uniformes/sales-table";
import { Skeleton } from "@/components/ui/skeleton";
import { UniformTabs } from "@/components/uniformes/uniform-tabs";
import { Badge } from "@/components/ui/badge";
import { Shirt, Package, Layers, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Gestión de Uniformes | Sistema Escolar Pro",
  description: "Administración de catálogo, inventario y ventas de uniformes.",
};

export default async function UniformesPage() {
  const session = await auth();

  const [uniformsRes, categoriesRes, variantsRes, sedesRes, ventasRes] =
    await Promise.all([
      getUniformesAction(),
      getCategoriasUniformesAction(),
      getTodasLasVariantesAction(),
      getSedesAction(),
      getVentasUniformesAction({}),
    ]);

  const uniforms = uniformsRes.data || [];
  const categories = categoriesRes.data || [];
  const variants = variantsRes.data || [];
  const sedes = sedesRes.data || [];
  const ventas = ventasRes.data || [];

  const totalStock = variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <Shirt size={14} />
            Indumentaria e Inventario
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Gestión de Uniformes
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Administra el catálogo de prendas escolares, controla el inventario por sede y procesa pedidos de padres de familia.
          </p>
        </div>
      </div>

      {/* ── BENTO KPIS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prendas en Catálogo</span>
            <h3 className="text-2xl font-bold font-mono text-foreground mt-0.5">{uniforms.length}</h3>
          </div>
          <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Shirt className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stock Total Físico</span>
            <h3 className="text-2xl font-bold font-mono text-foreground mt-0.5">{totalStock}</h3>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tallas y Variantes</span>
            <h3 className="text-2xl font-bold font-mono text-foreground mt-0.5">{variants.length}</h3>
          </div>
          <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="size-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ventas / Reservas</span>
            <h3 className="text-2xl font-bold font-mono text-foreground mt-0.5">{ventas.length}</h3>
          </div>
          <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <ShoppingBag className="size-5" />
          </div>
        </div>
      </div>

      {/* ── CONTENIDO POR PESTAÑAS ── */}
      <UniformTabs>
        {{
          catalogo: (
            <Suspense fallback={<UniformListSkeleton />}>
              <UniformList
                uniforms={uniforms}
                categories={categories}
                sedes={sedes}
              />
            </Suspense>
          ),
          inventario: (
            <Suspense fallback={<InventorySkeleton />}>
              <InventoryTable variantes={variants} sedes={sedes} />
            </Suspense>
          ),
          ventas: (
            <Suspense fallback={<SalesSkeleton />}>
              <SalesTable ventas={ventas} adminId={session?.user?.id || ""} />
            </Suspense>
          ),
        }}
      </UniformTabs>
    </div>
  );
}

function UniformListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-9 w-40 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl ml-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-72 rounded-xl" />
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>
      <Skeleton className="h-[360px] w-full rounded-2xl" />
    </div>
  );
}

function SalesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-9 w-72 rounded-xl" />
      </div>
      <Skeleton className="h-[360px] w-full rounded-2xl" />
    </div>
  );
}
