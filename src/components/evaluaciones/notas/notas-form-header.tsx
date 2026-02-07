import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotasFormHeaderProps {
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  isPending: boolean;
  onGuardar: () => void;
}

export function NotasFormHeader({
  escala,
  isPending,
  onGuardar,
}: NotasFormHeaderProps) {
  const isLiteral = escala === "LITERAL";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            Registro Curricular
          </h2>
          <Badge
            className={cn(
              "rounded-lg px-2.5 py-0.5 font-bold border-0 shadow-sm",
              isLiteral
                ? "bg-violet-600/10 text-violet-600"
                : "bg-blue-600/10 text-blue-600",
            )}
          >
            {escala}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
          {isLiteral
            ? "Escala de Logros (AD, A, B, C)"
            : "Escala Vigesimal (0-20)"}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <Button
          onClick={onGuardar}
          disabled={isPending}
          className="w-full md:w-auto min-w-[160px] rounded-full"
        >
          {isPending ? (
            <IconLoader2 className="animate-spin size-4" />
          ) : (
            <>
              <IconDeviceFloppy className="size-4 mr-2" /> Guardar Todo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
