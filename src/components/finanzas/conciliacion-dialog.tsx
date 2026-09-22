"use client";

import { useState } from "react";
import {
  IconBuildingBank,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as XLSX from "xlsx-js-style";
import {
  conciliarTransaccionesBancariasAction,
  type TransaccionBancariaItem,
  type ConciliacionResult,
} from "@/actions/finance/conciliacion";
import {
  ConciliacionUploadSection,
  ConciliacionResultsSection,
} from "./conciliacion-dialog-content";

export function ConciliacionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<TransaccionBancariaItem[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [result, setResult] = useState<ConciliacionResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Analizar la matriz para detectar dinámicamente la fila donde están los encabezados (ej. saltando banners)
        const rawGrid: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(rawGrid.length, 12); i++) {
          const rowText = (rawGrid[i] || []).join(" ").toLowerCase();
          const hasId = /dni|c[oó]digo|estudiante|documento/i.test(rowText);
          const hasAmount = /monto|importe|total|abono|pagado/i.test(rowText);
          if (hasId && hasAmount) {
            headerRowIndex = i;
            break;
          }
        }

        const rows: any[] = XLSX.utils.sheet_to_json(ws, { range: headerRowIndex, defval: "" });

        if (rows.length === 0) {
          toast.error("El archivo no contiene registros");
          return;
        }

        const transacciones: TransaccionBancariaItem[] = [];

        for (const row of rows) {
          const keys = Object.keys(row);
          const dniKey = keys.find((k) =>
            /dni|codigo|estudiante|documento|id/i.test(k)
          );
          const montoKey = keys.find((k) =>
            /monto|importe|total|abono|pagado/i.test(k)
          );
          const refKey = keys.find((k) =>
            /operacion|ref|referencia|nro|voucher|transaccion/i.test(k)
          );
          const canalKey = keys.find((k) =>
            /banco|canal|medio|metodo/i.test(k)
          );

          const identificador = dniKey ? String(row[dniKey]).trim() : "";
          const monto = montoKey ? parseFloat(String(row[montoKey]).replace(/[^0-9.]/g, "")) : 0;
          const referencia = refKey ? String(row[refKey]).trim() : `REC-${Math.floor(Math.random() * 1000000)}`;
          const canal = canalKey ? String(row[canalKey]).trim() : "Recaudo Bancario";

          if (identificador && !isNaN(monto) && monto > 0) {
            transacciones.push({
              identificador,
              monto,
              referencia,
              canal,
            });
          }
        }

        if (transacciones.length === 0) {
          toast.error(
            "No se pudieron identificar columnas válidas (DNI, Monto, Operación)"
          );
          return;
        }

        setParsedData(transacciones);
        setResult(null);
        toast.success(`${transacciones.length} transacciones leídas`);
      } catch (err) {
        console.error(err);
        toast.error("Error al procesar el archivo Excel/CSV");
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConciliar = async () => {
    if (parsedData.length === 0) return;

    setLoading(true);
    try {
      const res = await conciliarTransaccionesBancariasAction(parsedData);
      if (res.error || !res.data) {
        toast.error(res.error || "No se pudo procesar la conciliación");
        return;
      }

      setResult(res.data);
      toast.success(
        `Conciliación completada: ${res.data.exitosos} de ${res.data.totalProcesados} pagos registrados`
      );
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setParsedData([]);
    setFileName("");
    setResult(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2 rounded-xl text-xs font-semibold border-border/80 hover:bg-sky-500/10 hover:text-sky-700 hover:border-sky-500/30 transition-[background-color,border-color,color]"
        >
          <IconBuildingBank className="size-4 text-sky-600" />
          <span>Conciliación Bancaria</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider mb-1">
            <IconBuildingBank className="size-4" />
            Tesorería & Recaudación Masiva
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Conciliación Bancaria Automática
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Carga el extracto de pagos bancarios (BCP, BBVA, Interbank, etc.) en
            formato Excel o CSV para cotejar y registrar pagos masivos en un solo paso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 flex-1 overflow-y-auto pr-1">
          {!result ? (
            <ConciliacionUploadSection
              fileName={fileName}
              parsedData={parsedData}
              onFileUpload={handleFileUpload}
            />
          ) : (
            <ConciliacionResultsSection result={result} />
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="rounded-xl text-xs"
          >
            {result ? "Cerrar" : "Cancelar"}
          </Button>

          {!result && (
            <Button
              size="sm"
              onClick={handleConciliar}
              disabled={loading || parsedData.length === 0}
              className="rounded-xl text-xs gap-1.5 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
            >
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconCheck className="size-4" />
              )}
              Procesar Conciliación ({parsedData.length})
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
