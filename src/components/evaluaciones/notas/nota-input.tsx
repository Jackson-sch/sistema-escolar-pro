import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface NotaInputProps {
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  valor?: number;
  valorLiteral?: string;
  onChange: (valor: string, type: "valor" | "valorLiteral") => void;
}

export function NotaInput({
  escala,
  valor,
  valorLiteral,
  onChange,
}: NotaInputProps) {
  const isLiteral = escala === "LITERAL";

  if (isLiteral) {
    return (
      <Select
        value={valorLiteral || "none"}
        onValueChange={(v) => onChange(v, "valorLiteral")}
      >
        <SelectTrigger
          className={cn(
            "w-28 mx-auto h-9 font-black rounded-lg border-border/40 transition-all",
            valorLiteral === "AD" &&
              "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
            valorLiteral === "A" &&
              "bg-blue-500/10 text-blue-600 border-blue-500/30",
            valorLiteral === "B" &&
              "bg-orange-500/10 text-orange-600 border-orange-500/30",
            valorLiteral === "C" &&
              "bg-red-500/10 text-red-600 border-red-500/30",
          )}
        >
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/40">
          <SelectItem
            value="none"
            className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
          >
            SIN CALIFICAR
          </SelectItem>
          <SelectItem
            value="AD"
            className="text-xs font-black text-emerald-600"
          >
            AD (Destacado)
          </SelectItem>
          <SelectItem value="A" className="text-xs font-black text-blue-600">
            A (Logrado)
          </SelectItem>
          <SelectItem value="B" className="text-xs font-black text-orange-600">
            B (En Proceso)
          </SelectItem>
          <SelectItem value="C" className="text-xs font-black text-red-600">
            C (En Inicio)
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type="number"
      min={0}
      max={20}
      value={valor ?? ""}
      onChange={(e) => onChange(e.target.value, "valor")}
      className={cn(
        "w-20 mx-auto text-center font-black transition-all rounded-full",
        valor !== undefined && valor < 11
          ? "bg-red-500/10 text-red-600 border-red-500/30 focus-visible:ring-red-500/20"
          : "bg-muted/30 focus:border-violet-500/50",
      )}
      placeholder="-"
    />
  );
}
