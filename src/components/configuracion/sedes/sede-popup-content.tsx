"use client";

import Image from "next/image";
import {
  IconMapPin,
  IconBadgeFilled,
  IconStarFilled,
} from "@tabler/icons-react";

interface SedePopupContentProps {
  sede: any;
}

export function SedePopupContent({ sede }: SedePopupContentProps) {
  const nombresNiveles = Array.from(
    new Set(sede.nivelesAcademicos?.map((na: any) => na.nivel?.nombre)),
  ).filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-0 overflow-hidden">
      {sede.logo ? (
        <div className="relative w-full h-24 overflow-hidden rounded-t-xl mb-3">
          <Image
            src={sede.logo}
            fill
            sizes="200px"
            unoptimized
            className="object-cover"
            alt={sede.nombre}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 text-white">
            <h4 className="font-bold text-sm truncate drop-shadow-md">
              {sede.nombre}
            </h4>
          </div>
        </div>
      ) : (
        <div className="p-3 pb-1">
          <h4 className="font-bold text-sm text-gray-900 mb-1">
            {sede.nombre}
          </h4>
        </div>
      )}

      <div className="px-3 pb-3 space-y-2.5">
        <div className="flex items-start gap-2">
          <IconMapPin className="text-[14px] text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-500 leading-snug">
            {sede.direccion || "Sin dirección física"}
          </p>
        </div>

        {nombresNiveles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {nombresNiveles.map((nivel) => (
              <span
                key={nivel}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-bold border border-blue-200"
              >
                {nivel}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1.5 text-gray-400">
            <IconBadgeFilled className="text-[12px]" />
            <span className="text-[9px] font-bold uppercase tracking-wider">
              Sede {sede.esPrincipal ? "Principal" : "Secundaria"}
            </span>
          </div>
          {sede.esPrincipal && (
            <IconStarFilled className="text-amber-500 text-sm" />
          )}
        </div>
      </div>
    </div>
  );
}
