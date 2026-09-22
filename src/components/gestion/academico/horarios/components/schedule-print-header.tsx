"use client";

import { BrandIcon } from "@/components/common/brand-logo";

interface SchedulePrintHeaderProps {
  nivelName?: string;
  gradoName?: string;
  seccionName?: string;
  year: number;
}

export function SchedulePrintHeader({
  nivelName,
  gradoName,
  seccionName,
  year,
}: SchedulePrintHeaderProps) {
  return (
    <div className="hidden print:flex items-center justify-between pb-3 mb-2 border-b-2 border-slate-900 text-black">
      <div className="flex items-center gap-3">
        <BrandIcon size={36} />
        <div>
          <h1 className="text-xl font-extrabold tracking-tight uppercase text-slate-950">
            {nivelName || "EduNova Pro"}
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Horario de Clases Oficial • Ciclo Lectivo {year}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {gradoName || ""}
        </p>
        <p className="text-base font-extrabold text-indigo-700">
          Sección {seccionName || ""}
        </p>
      </div>
    </div>
  );
}
