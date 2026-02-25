"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconCircleFilled } from "@tabler/icons-react";
import { AcademicProgressChart } from "./academic-progress-chart";
import { FinancialStatus } from "./financial-status";
import { useComponentShortcuts } from "@/hooks/use-component-shortcuts";

interface DashboardContentProps {
  data: any;
}

export function DashboardContent({ data }: DashboardContentProps) {
  const { stats } = data;
  const { payments, attendancePercentage, chartData, fichas, anuncios } = stats;

  useComponentShortcuts({
    onSearch: () => {
      // El CommandPalette ya escucha Ctrl+K globalmente,
      // pero esto asegura que el dashboard también responda si fuera necesario
      // o para estandarizar el uso del hook.
    },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Academic Progress & Financial Status */}
      <div className="grid gap-6 @3xl:grid-cols-3">
        <div className="@3xl:col-span-2">
          <Card className="p-6 bg-[#111827] border-white/5 h-full">
            <AcademicProgressChart data={chartData} />
          </Card>
        </div>
        <div className="@3xl:col-span-1">
          <FinancialStatus payments={payments} />
        </div>
      </div>

      {/* Row 2: Attendance, Psychopedagogical, School Announcements */}
      <div className="grid gap-6 @md:grid-cols-2 @3xl:grid-cols-3">
        {/* Attendance Widget */}
        <Card className="bg-[#111827] border-white/5 flex flex-col p-6 h-full min-h-[300px]">
          <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-6">
            Asistencia
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center py-6">
            <div className="relative size-32 @[20rem]:size-40">
              <svg className="size-full" viewBox="0 0 36 36">
                <path
                  className="stroke-slate-800"
                  strokeDasharray="100, 100"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-emerald-500 shadow-glow"
                  strokeDasharray={`${attendancePercentage}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl @[20rem]:text-4xl font-black text-white">
                  {attendancePercentage.toFixed(0)}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Presente
                </span>
              </div>
            </div>
            <p className="mt-8 text-xs text-center text-slate-400 font-medium italic px-4">
              "
              {attendancePercentage >= 95
                ? "Excelente consistencia este periodo"
                : "Asistencia regular"}
              "
            </p>
          </div>
        </Card>

        {/* Psychopedagogical Widget */}
        <Card className="bg-[#111827] border-white/5 p-6 flex flex-col h-full min-h-[300px]">
          <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-4 mb-6">
            <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider">
              Reportes Psicopedagógicos
            </h3>
            <Badge className="bg-amber-500/10 text-amber-500 border-none text-[10px] font-black uppercase w-fit">
              {fichas.length} NUEVOS
            </Badge>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {fichas.length > 0 ? (
              fichas.map((ficha: any) => (
                <div key={ficha.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <IconCircleFilled className="size-2 text-amber-500 mt-1.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">
                        {ficha.categoria.nombre}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Dr. {ficha.especialista.name.split(" ")[0]} •{" "}
                        {new Date(ficha.fecha).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "2-digit",
                        })}
                      </p>
                      <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4">
                        Leer más
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">
                No hay reportes disponibles.
              </p>
            )}
          </div>
        </Card>

        {/* School Announcements Widget */}
        <Card className="bg-[#111827] border-white/5 p-6 flex flex-col h-full min-h-[300px] @md:col-span-2 @3xl:col-span-1">
          <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-6">
            Anuncios Escolares
          </h3>

          <div className="flex-1 space-y-6 relative ml-1 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-white/5" />

            {anuncios.length > 0 ? (
              anuncios.map((anuncio: any) => (
                <div key={anuncio.id} className="relative pl-6 space-y-1">
                  <div className="absolute left-0 top-1 size-2 rounded-full border-2 border-[#111827] bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    {new Date(anuncio.fechaPublicacion).toLocaleDateString(
                      "es-ES",
                      { month: "short", day: "2-digit", year: "numeric" },
                    )}
                  </p>
                  <h4 className="text-sm font-bold text-white leading-tight">
                    {anuncio.titulo}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2">
                    {anuncio.resumen || anuncio.contenido}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic ml-6">
                No hay anuncios nuevos.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
