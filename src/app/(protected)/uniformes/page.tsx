import { Suspense } from "react";
import {
  Shirt,
  Package,
  History,
  Settings,
  Plus,
  LayoutGrid,
} from "lucide-react";
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

export const metadata = {
  title: "Gestión de Uniformes | EduPeru Pro",
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

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 text-slate-900">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-500 bg-clip-text text-transparent">
            Gestión de Uniformes
          </h2>
          <p className="text-slate-500">
            Administra el catálogo de prendas, controla el stock por sede y
            gestiona las reservas de los padres.
          </p>
        </div>
      </div>

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
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32 ml-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[300px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-10 w-56" />
      </div>
      <div className="h-[400px] w-full bg-white/50 border border-slate-200 rounded-xl" />
    </div>
  );
}

function SalesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-96" />
      </div>
      <div className="h-[400px] w-full bg-white/50 border border-slate-200 rounded-xl" />
    </div>
  );
}
