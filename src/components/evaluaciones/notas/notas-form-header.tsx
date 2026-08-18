import { IconDeviceFloppy, IconLoader2, IconCircleCheck, IconAlertCircle, IconDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotasFormHeaderProps {
  escala: "VIGESIMAL" | "LITERAL" | "DESCRIPTIVA";
  isPending: boolean;
  isDirty?: boolean;
  onGuardar: () => void;
  onExportExcel?: () => void;
}

export function NotasFormHeader({
  escala,
  isPending,
  isDirty = false,
  onGuardar,
  onExportExcel,
}: NotasFormHeaderProps) {
  const isLiteral = escala === "LITERAL";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Sync / Autosave Badge Status */}
          {isPending ? (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold gap-1 text-[10px]">
              <IconLoader2 className="animate-spin size-3" />
              Guardando en servidor...
            </Badge>
          ) : isDirty ? (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold gap-1 text-[10px]">
              <IconAlertCircle className="size-3" />
              Borrador local guardado
            </Badge>
          ) : (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold gap-1 text-[10px]">
              <IconCircleCheck className="size-3 text-emerald-500" />
              Sincronizado
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
          {isLiteral
            ? "Escala de Logros (AD, A, B, C) · Navega con Enter / Flechas"
            : "Escala Vigesimal (0-20) · Navega con Enter / Flechas"}
        </p>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        {onExportExcel && (
          <Button
            type="button"
            variant="outline"
            onClick={onExportExcel}
            className="w-full md:w-auto rounded-full border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold gap-1.5 shadow-sm"
          >
            <IconDownload className="size-4" /> Exportar Excel
          </Button>
        )}
        <Button
          onClick={onGuardar}
          disabled={isPending || !isDirty}
          className="w-full md:w-auto min-w-[160px] rounded-full shadow-md transition-[width,height]"
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
