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
    <>
      <div className="flex flex-col gap-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] ml-1">
          Seleccionar Estudiante
        </p>
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

      <div className="flex md:flex-row flex-col gap-4">
        <div className="relative flex-1 group w-full">
          <InputGroup className="rounded-full bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5">
            <InputGroupInput
              placeholder="Buscar prendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <Search className="h-5 w-5 text-primary" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedCategory || "all"}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-white/5 rounded-full font-bold">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 dark:border-white/10">
              <SelectItem value="all" className="rounded-xl">
                Todas
              </SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id} className="rounded-xl">
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={onOpenCart}
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-primary/10 hover:text-primary relative"
          >
            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-50 dark:border-[#0f1117] animate-in zoom-in">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
