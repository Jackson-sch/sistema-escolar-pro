"use client";

import { useMemo } from "react";
import { EstudianteType, NotaData, EscalaType } from "../notas-form-types";

export function useNotasStats(
  estudiantes: EstudianteType[],
  notas: Record<string, NotaData>,
  escala: EscalaType,
) {
  return useMemo(() => {
    const total = estudiantes.length;
    const calificados = estudiantes.filter((est) => {
      const n = notas[est.id];
      if (!n) return false;
      if (escala === "LITERAL") return !!n.valorLiteral;
      return n.valor !== undefined && n.valor > 0;
    }).length;
    const pendientes = total - calificados;

    let promedio: number | null = null;
    let aprobados = 0;
    let desaprobados = 0;
    let countAD = 0;
    let countA = 0;
    let countB = 0;
    let countC = 0;

    if (escala === "VIGESIMAL") {
      const notasValidas = Object.values(notas).flatMap((n) =>
        n.valor !== undefined && n.valor !== 0 ? [n.valor] : [],
      );
      if (notasValidas.length > 0) {
        promedio = parseFloat(
          (
            notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length
          ).toFixed(1),
        );
      }
      Object.values(notas).forEach((n) => {
        if (n.valor >= 11) aprobados++;
        else if (n.valor > 0) desaprobados++;
      });
    } else {
      Object.values(notas).forEach((n) => {
        if (n.valorLiteral === "AD") {
          countAD++;
          aprobados++;
        } else if (n.valorLiteral === "A") {
          countA++;
          aprobados++;
        } else if (n.valorLiteral === "B") {
          countB++;
          desaprobados++;
        } else if (n.valorLiteral === "C") {
          countC++;
          desaprobados++;
        }
      });
    }

    return {
      total,
      calificados,
      pendientes,
      promedio,
      countAD,
      countA,
      countB,
      countC,
      distribucion: {
        aprobados,
        desaprobados,
      },
    };
  }, [notas, estudiantes, escala]);
}
