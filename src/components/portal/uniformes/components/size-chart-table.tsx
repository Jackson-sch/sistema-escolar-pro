"use client";

import { SIZE_CHART } from "./smart-sizer-constants";

export function SizeChartTable({ highlight }: { highlight: string | null }) {
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
                <td
                  className={`px-3 py-2 font-black ${isMatch ? "text-indigo-600 dark:text-white" : ""}`}
                >
                  {row.size}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.ageMin === row.ageMax
                    ? `${row.ageMin}`
                    : `${row.ageMin}–${row.ageMax}`}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.heightMax === 999
                    ? `${row.heightMin}+`
                    : `${row.heightMin}–${row.heightMax}`}
                </td>
                <td className="px-3 py-2 text-center">
                  {row.weightMax === 999
                    ? `${row.weightMin}+`
                    : `${row.weightMin}–${row.weightMax}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
