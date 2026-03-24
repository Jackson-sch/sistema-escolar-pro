import { CSSProperties } from "react";

type GradientType = "radial" | "linear" | "conic";
type BlendMode = CSSProperties["mixBlendMode"];

interface GlowBlobProps {
  /** Color principal del glow (hex, rgb, hsl, tailwind var, etc.) */
  color: string;
  /** Tipo de gradiente. Default: "radial" */
  gradient?: GradientType;
  /** Intensidad del blur en px. Default: 48 */
  blur?: number;
  /** Opacidad del blob 0–1. Default: 0.15 */
  opacity?: number;
  /** Tamaño del blob (ancho y alto). Default: "100%" */
  size?: number | string;
  /** Posición horizontal. Default: "50%" */
  x?: number | string;
  /** Posición vertical. Default: "50%" */
  y?: number | string;
  /** Dirección del gradiente lineal en grados (solo aplica cuando gradient="linear"). Default: 135 */
  angle?: number;
  /** Color secundario del gradiente. Default: "transparent" */
  colorTo?: string;
  /** Dónde termina el color principal (como porcentaje). Default: "40%" */
  stop?: string;
  /** CSS mix-blend-mode. Default: "normal" */
  blendMode?: BlendMode;
  /** Clases extra de Tailwind */
  className?: string;
  /** Si el blob ignora los eventos del puntero. Default: true */
  noPointerEvents?: boolean;
}

function toCSSSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function GlowBlob({
  color,
  gradient = "radial",
  blur = 48,
  opacity = 0.15,
  size = "100%",
  x = "50%",
  y = "50%",
  angle = 135,
  colorTo = "transparent",
  stop = "40%",
  blendMode = "normal",
  className = "",
  noPointerEvents = true,
}: GlowBlobProps) {
  const w = toCSSSize(size);
  const h = toCSSSize(size);
  const left = toCSSSize(x);
  const top = toCSSSize(y);

  const gradientCSS: Record<GradientType, string> = {
    radial: `radial-gradient(circle, ${color} 0%, ${colorTo} ${stop})`,
    linear: `linear-gradient(${angle}deg, ${color} 0%, ${colorTo} ${stop})`,
    conic: `conic-gradient(from ${angle}deg, ${color}, ${colorTo}, ${color})`,
  };

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        transform: "translate(-50%, -50%)",
        background: gradientCSS[gradient],
        filter: `blur(${blur}px)`,
        opacity,
        mixBlendMode: blendMode,
        pointerEvents: noPointerEvents ? "none" : "auto",
        borderRadius: "9999px",
        zIndex: 0,
      }}
    />
  );
}