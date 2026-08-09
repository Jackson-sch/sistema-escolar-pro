import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { PortalStudentSelector } from "@/components/portal/common/portal-student-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopBar({
  hijos,
  selectedHijo,
  setSelectedHijo,
  setSelectedSede,
  categorias,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  cart,
  onOpenCart,
}: {
  hijos: any[];
  selectedHijo: string;
  setSelectedHijo: (val: string) => void;
  setSelectedSede: (val: string) => void;
  categorias: any[];
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  cart: any[];
  onOpenCart: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
          Estudiante Seleccionado
        </span>
        <PortalStudentSelector
          students={hijos}
          selectedId={selectedHijo || ""}
          onSelect={(val) => {
            setSelectedHijo(val);
            const hijo = hijos.find((h) => h.id === val);
            if (hijo?.nivelAcademico?.sedeId) {
              setSelectedSede(hijo.nivelAcademico.sedeId);
            }
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 group w-full">
          <InputGroup className="rounded-xl border-border/40 bg-card/80 shadow-xs">
            <InputGroupInput
              placeholder="Buscar uniformes, polos, casacas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs"
            />
            <InputGroupAddon>
              <Search className="h-4 w-4 text-indigo-500" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedCategory || "all"}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="h-10 flex-1 sm:w-44 rounded-xl border-border/40 bg-card/80 text-xs font-semibold shadow-xs">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="all" className="rounded-lg text-xs">
                Todas las categorías
              </SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id} className="rounded-lg text-xs">
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Botón de Carrito con Alta Visibilidad */}
          <Button
            onClick={onOpenCart}
            className="rounded-xl h-10 px-4 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden xs:inline">Mi Carrito</span>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 bg-white text-indigo-700 font-mono font-bold text-[10px] rounded-full shadow-xs">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
