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
import { Ruler, Sparkles, ChevronDown, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

// ─── Types ─────────────────────────────────────────────────────────────────

type SizeEntry = {
  size: string;
  ageMin: number;
  ageMax: number;
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
};

type Confidence = "alta" | "media" | "baja";

type SizerResult = {
  primary: string;
  fallback: string | null;
  confidence: Confidence;
  signals: string[];
  note: string | null;
};

// ─── Size Chart Reference Table ─────────────────────────────────────────────
// Source: standard children's school uniform sizing (LATAM)

const SIZE_CHART: SizeEntry[] = [
  { size: "4",      ageMin: 3,  ageMax: 3,  heightMin: 95,  heightMax: 105, weightMin: 13, weightMax: 16 },
  { size: "6",      ageMin: 4,  ageMax: 5,  heightMin: 106, heightMax: 116, weightMin: 17, weightMax: 21 },
  { size: "8",      ageMin: 6,  ageMax: 7,  heightMin: 117, heightMax: 128, weightMin: 22, weightMax: 27 },
  { size: "10",     ageMin: 8,  ageMax: 9,  heightMin: 129, heightMax: 140, weightMin: 28, weightMax: 34 },
  { size: "12",     ageMin: 10, ageMax: 11, heightMin: 141, heightMax: 152, weightMin: 35, weightMax: 43 },
  { size: "14/16",  ageMin: 12, ageMax: 12, heightMin: 153, heightMax: 160, weightMin: 44, weightMax: 50 },
  { size: "16 / XS",ageMin: 13, ageMax: 14, heightMin: 161, heightMax: 168, weightMin: 51, weightMax: 58 },
  { size: "S",      ageMin: 15, ageMax: 16, heightMin: 169, heightMax: 175, weightMin: 59, weightMax: 67 },
  { size: "S / M",  ageMin: 17, ageMax: 99, heightMin: 176, heightMax: 999, weightMin: 68, weightMax: 999 },
];

// ─── Core Calculation Logic (pure function, easily testable) ─────────────────

function computeSize(
  age: number | null,
  height: number | null,
  weight: number | null,
): SizerResult | null {
  if (age === null && height === null && weight === null) return null;

  // Score each size entry based on how many signals match
  const scored = SIZE_CHART.map((entry) => {
    let score = 0;
    const signals: string[] = [];

    if (height !== null) {
      if (height >= entry.heightMin && height <= entry.heightMax) {
        score += 3; // Height is the most reliable signal
        signals.push("estatura");
      } else if (Math.abs(height - entry.heightMin) <= 5 || Math.abs(height - entry.heightMax) <= 5) {
        score += 1; // Near boundary
      }
    }

    if (age !== null) {
      if (age >= entry.ageMin && age <= entry.ageMax) {
        score += 2;
        signals.push("edad");
      } else if (Math.abs(age - entry.ageMin) <= 1 || Math.abs(age - entry.ageMax) <= 1) {
        score += 0.5;
      }
    }

    if (weight !== null) {
      if (weight >= entry.weightMin && weight <= entry.weightMax) {
        score += 2;
        signals.push("peso");
      } else if (Math.abs(weight - entry.weightMin) <= 3 || Math.abs(weight - entry.weightMax) <= 3) {
        score += 0.5;
      }
    }

    return { entry, score, signals };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const runnerUp = sorted[1];

  if (best.score === 0) return null;

  // Determine confidence
  const maxPossibleScore =
    (height !== null ? 3 : 0) +
    (age !== null ? 2 : 0) +
    (weight !== null ? 2 : 0);

  const ratio = best.score / maxPossibleScore;
  const confidence: Confidence =
    ratio >= 0.7 ? "alta" : ratio >= 0.4 ? "media" : "baja";

  // Show fallback size if runner-up is close
  const fallback =
    runnerUp && runnerUp.score >= best.score * 0.6
      ? runnerUp.entry.size
      : null;

  // Build note
  let note: string | null = null;
  if (height !== null && age !== null) {
    const heightEntry = scored.find(
      (s) => height >= s.entry.heightMin && height <= s.entry.heightMax
    );
    const ageEntry = scored.find(
      (s) => age >= s.entry.ageMin && age <= s.entry.ageMax
    );
    if (heightEntry && ageEntry && heightEntry.entry.size !== ageEntry.entry.size) {
      note = `La estatura sugiere ${heightEntry.entry.size}, la edad sugiere ${ageEntry.entry.size}. Priorizamos estatura.`;
    }
  }

  return {
    primary: best.entry.size,
    fallback,
    confidence,
    signals: best.signals,
    note,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const map = {
    alta:  { label: "Alta precisión",   className: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30" },
    media: { label: "Precisión media",  className: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30" },
    baja:  { label: "Baja precisión",   className: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30" },
  };
  const { label, className } = map[confidence];
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  );
}

function SizeChartTable({ highlight }: { highlight: string | null }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 relative z-10 bg-white/40 dark:bg-zinc-950/20">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="bg-indigo-50/80 dark:bg-white/10 text-indigo-950 dark:text-indigo-100 border-b border-slate-200 dark:border-white/10">
            <th className="px-3 py-2 text-left font-black">Talla</th>
            <th className="px-3 py-2 text-center font-black">Edad</th>
            <th className="px-3 py-2 text-center font-black">Cm</th>
            <th className="px-3 py-2 text-center font-black">Kg</th>
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row) => {
            const isMatch = highlight === row.size;
            return (
              <tr
                key={row.size}
                className={`border-t border-slate-100 dark:border-white/5 transition-colors ${
                  isMatch
                    ? "bg-indigo-600/10 dark:bg-white/20 text-indigo-950 dark:text-white"
                    : "text-slate-600 dark:text-blue-100/70"
                }`}
              >
                <td className={`px-3 py-2 font-black ${isMatch ? "text-indigo-600 dark:text-white" : ""}`}>
                  {row.size}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.ageMin === row.ageMax ? `${row.ageMin}` : `${row.ageMin}–${row.ageMax}`}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.heightMax === 999 ? `${row.heightMin}+` : `${row.heightMin}–${row.heightMax}`}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.weightMax === 999 ? `${row.weightMin}+` : `${row.weightMin}–${row.weightMax}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SmartSizerWidget() {
  const [age, setAge] = useState<string>("9");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [result, setResult] = useState<SizerResult | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived parsed values (avoids parsing in handlers)
  const parsed = useMemo(() => ({
    age:    age    ? parseInt(age, 10)    : null,
    height: height ? parseInt(height, 10) : null,
    weight: weight ? parseInt(weight, 10) : null,
  }), [age, height, weight]);

  // Input validation
  const validationError = useMemo(() => {
    const { height: h, weight: w } = parsed;
    if (h !== null && (h < 50 || h > 220)) return "Estatura fuera de rango (50–220 cm)";
    if (w !== null && (w < 5 || w > 150))  return "Peso fuera de rango (5–150 kg)";
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
    <div className="liquid-glass rounded-[2.5rem] p-7 space-y-6 relative overflow-hidden transition-all duration-500 shadow-2xl">
      {/* Background blobs for liquid-glass depth */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-blob pointer-events-none select-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-orange-500/15 dark:bg-orange-500/10 rounded-full blur-3xl animate-blob pointer-events-none select-none" />

      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none select-none dark:text-white text-indigo-950">
        <Sparkles className="h-36 w-36" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 bg-indigo-600/10 dark:bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-indigo-600/20 dark:border-white/10 text-indigo-600 dark:text-white shadow-sm">
          <Ruler className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black leading-tight text-indigo-950 dark:text-white">
            Calculador de Tallas
          </h3>
          <p className="text-indigo-600/70 dark:text-indigo-200/60 text-[11px] font-bold uppercase tracking-wider">
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
            <SelectTrigger className="bg-indigo-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11! w-full rounded-full text-foreground dark:text-white font-bold text-sm shadow-inner transition-all hover:bg-indigo-50 dark:hover:bg-white/10">
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
            className="bg-indigo-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 w-full rounded-full text-foreground dark:text-white font-bold placeholder:text-muted-foreground/30 text-sm shadow-inner transition-all hover:bg-indigo-50 dark:hover:bg-white/10"
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
            className="bg-indigo-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 w-full rounded-full text-foreground dark:text-white font-bold placeholder:text-muted-foreground/30 text-sm shadow-inner transition-all hover:bg-indigo-50 dark:hover:bg-white/10"
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
          <p className="text-rose-700 dark:text-rose-300 text-xs font-bold">{error}</p>
        </div>
      )}

      {/* Result card */}
      {result && !error && (
        <div className="bg-indigo-50/40 dark:bg-white/5 backdrop-blur-sm border border-indigo-100/50 dark:border-white/10 rounded-[1.75rem] p-5 space-y-4 shadow-inner relative z-10 transition-all duration-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600/70 dark:text-indigo-200/70 mb-1">
                Talla Sugerida
              </p>
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-black leading-none text-indigo-950 dark:text-white">{result.primary}</span>
                {result.fallback && (
                  <span className="text-base font-black text-indigo-950/40 dark:text-white/40">
                    o {result.fallback}
                  </span>
                )}
              </div>
            </div>
            <ConfidenceBadge confidence={result.confidence} />
          </div>

          {/* Signals */}
          {result.signals.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-[11px] text-indigo-950/80 dark:text-indigo-200/80 font-medium">
                Basado en: <span className="font-black text-indigo-600 dark:text-indigo-400">{result.signals.join(", ")}</span>
              </p>
            </div>
          )}

          {/* Conflict note */}
          {result.note && (
            <div className="flex items-start gap-1.5 bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-3 py-2.5">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-200 font-bold leading-normal">{result.note}</p>
            </div>
          )}

          {result.confidence === "baja" && (
            <p className="text-[11px] text-indigo-950/60 dark:text-indigo-200/60 font-medium italic">
              💡 Para mayor precisión, agrega estatura y peso.
            </p>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-2.5 relative z-10">
        <Button
          onClick={handleCalculate}
          disabled={!!validationError}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-full h-12 text-sm shadow-lg shadow-orange-500/10 hover:shadow-orange-600/20 active:scale-95 transition-all duration-200 relative z-10 border-none"
        >
          {result ? "Recalcular" : "Calcular Talla"}
        </Button>
        {result && (
          <Button
            onClick={handleReset}
            variant="ghost"
            className="h-12 px-5 rounded-full text-indigo-600 hover:bg-indigo-600/10 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white font-bold text-sm transition-all duration-200 relative z-10"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Size chart toggle */}
      <button
        onClick={() => setShowChart((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-black text-indigo-600 hover:text-indigo-800 dark:text-indigo-200/80 dark:hover:text-white transition-colors w-full justify-center relative z-10 uppercase tracking-wider"
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