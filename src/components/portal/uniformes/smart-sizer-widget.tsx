"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ruler, ChevronDown, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

import {
  SizerResult,
  computeSize,
} from "./components/smart-sizer-constants";
import { SizerResultCard } from "./components/sizer-result-card";
import { SizeChartTable } from "./components/size-chart-table";

export default function SmartSizerWidget() {
  const [age, setAge] = useState<string>("9");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [result, setResult] = useState<SizerResult | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived parsed values
  const parsed = useMemo(
    () => ({
      age: age ? parseInt(age, 10) : null,
      height: height ? parseInt(height, 10) : null,
      weight: weight ? parseInt(weight, 10) : null,
    }),
    [age, height, weight],
  );

  // Input validation
  const validationError = useMemo(() => {
    const { height: h, weight: w } = parsed;
    if (h !== null && (h < 50 || h > 220))
      return "Estatura fuera de rango (50–220 cm)";
    if (w !== null && (w < 5 || w > 150))
      return "Peso fuera de rango (5–150 kg)";
    return null;
  }, [parsed]);

  const handleCalculate = useCallback(() => {
    setError(null);
    if (validationError) {
      setError(validationError);
      return;
    }
    const res = computeSize(parsed.age, parsed.height, parsed.weight);
    if (!res) {
      setError("Ingresa al menos la edad para calcular.");
      return;
    }
    setResult(res);
  }, [parsed, validationError]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setHeight("");
    setWeight("");
    setAge("9");
  }, []);

  return (
    <div className="relative space-y-6 overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <Ruler className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight text-foreground">
            Calculador de Tallas
          </h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Uniforme escolar • Niños 3–17 años
          </p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {/* Age */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-indigo-600/70 dark:text-indigo-200/70 uppercase tracking-widest font-black">
            Edad
          </Label>
          <Select value={age} onValueChange={setAge}>
            <SelectTrigger className="h-11! w-full rounded-xl border-border/50 bg-background text-sm font-semibold shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 15 }, (_, i) => i + 3).map((a) => (
                <SelectItem key={a} value={a.toString()}>
                  {a} años
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-indigo-600/70 dark:text-indigo-200/70 uppercase tracking-widest font-black">
            Estatura cm
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            className="h-11 w-full rounded-xl border-border/50 bg-background text-sm font-semibold placeholder:text-muted-foreground/50 shadow-sm"
            placeholder="140"
            min={50}
            max={220}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Label className="text-[10px] text-indigo-600/70 dark:text-indigo-200/70 uppercase tracking-widest font-black">
            Peso kg
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            className="h-11 w-full rounded-xl border-border/50 bg-background text-sm font-semibold placeholder:text-muted-foreground/50 shadow-sm"
            placeholder="32"
            min={5}
            max={150}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <div className="flex items-center gap-2 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 rounded-2xl px-4 py-3 relative z-10">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
          <p className="text-rose-700 dark:text-rose-300 text-xs font-bold">
            {error}
          </p>
        </div>
      )}

      {/* Result card */}
      {result && !error && <SizerResultCard result={result} />}

      {/* CTA buttons */}
      <div className="flex gap-2.5 relative z-10">
        <Button
          onClick={handleCalculate}
          disabled={!!validationError}
          className="relative z-10 h-11 flex-1 rounded-xl text-sm font-bold shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
        >
          {result ? "Recalcular" : "Calcular Talla"}
        </Button>
        {result && (
          <Button
            onClick={handleReset}
            variant="ghost"
            className="relative z-10 h-11 rounded-xl px-5 text-sm font-semibold text-primary hover:bg-primary/10 cursor-pointer"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Size chart toggle */}
      <button
        onClick={() => setShowChart((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 hover:text-indigo-800 dark:text-indigo-200/80 dark:hover:text-white transition-colors w-full justify-center relative z-10 uppercase tracking-wider cursor-pointer"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${showChart ? "rotate-180" : ""}`}
        />
        {showChart ? "Ocultar" : "Ver"} tabla de tallas de referencia
      </button>

      {showChart && <SizeChartTable highlight={result?.primary ?? null} />}
    </div>
  );
}
