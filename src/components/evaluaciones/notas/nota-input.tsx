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
  inputIndex: number;
  onKeyDown: (e: React.KeyboardEvent<any>) => void;
}

export function NotaInput({
  escala,
  valor,
  valorLiteral,
  onChange,
  inputIndex,
  onKeyDown,
}: NotaInputProps) {
  const isLiteral = escala === "LITERAL";

  if (isLiteral) {
    return (
      <Select
        value={valorLiteral || "none"}
        onValueChange={(v) => onChange(v, "valorLiteral")}
      >
        <SelectTrigger
          data-index={inputIndex}
          onKeyDown={onKeyDown}
          className={cn(
            "w-28 mx-auto h-9 font-semibold rounded-xl border-border/40 transition-[color,background-color,border-color] text-xs",
            valorLiteral === "AD" &&
              "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
            valorLiteral === "A" &&
              "bg-blue-500/10 text-blue-600 border-blue-500/30",
            valorLiteral === "B" &&
              "bg-amber-500/10 text-amber-600 border-amber-500/30",
            valorLiteral === "C" &&
              "bg-rose-500/10 text-rose-600 border-rose-500/30",
          )}
        >
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border/40">
          <SelectItem
            value="none"
            className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            SIN CALIFICAR
          </SelectItem>
          <SelectItem
            value="AD"
            className="text-xs font-semibold text-emerald-600"
          >
            AD (Destacado)
          </SelectItem>
          <SelectItem value="A" className="text-xs font-semibold text-blue-600">
            A (Logrado)
          </SelectItem>
          <SelectItem value="B" className="text-xs font-semibold text-amber-600">
            B (En Proceso)
          </SelectItem>
          <SelectItem value="C" className="text-xs font-semibold text-rose-600">
            C (En Inicio)
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange("", "valor");
      return;
    }

    const num = parseFloat(raw);
    if (isNaN(num)) {
      onChange("", "valor");
      return;
    }

    // Limitar estrictamente entre 0 y 20
    const clamped = Math.min(20, Math.max(0, num));
    onChange(clamped.toString(), "valor");
  };

  return (
    <Input
      type="number"
      min={0}
      max={20}
      step="0.5"
      value={valor !== undefined && valor !== 0 ? valor : ""}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onFocus={(e) => e.target.select()}
      data-index={inputIndex}
      className={cn(
        "w-20 mx-auto text-center font-bold text-xs h-9 transition-[color,background-color,border-color,box-shadow] rounded-xl select-all",
        valor !== undefined && valor > 0 && valor < 11
          ? "bg-rose-500/10 text-rose-600 border-rose-500/30 focus-visible:ring-rose-500/20"
          : valor !== undefined && valor >= 11
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 focus-visible:ring-emerald-500/20"
            : "bg-background border-border/40 focus:border-indigo-500/50",
      )}
      placeholder="-"
    />
  );
}
