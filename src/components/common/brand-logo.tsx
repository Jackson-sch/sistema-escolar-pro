"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  variant?: "full" | "icon" | "stacked";
  iconSize?: number;
  showBadge?: boolean;
}

export function BrandIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id="edunova-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="edunova-grad-secondary" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <filter id="glow-star" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Escudo Exterior */}
      <path
        d="M24 4L40 10V22C40 32.5 33.1 41.8 24 44C14.9 41.8 8 32.5 8 22V10L24 4Z"
        fill="url(#edunova-grad-primary)"
        fillOpacity="0.15"
        stroke="url(#edunova-grad-primary)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Hoja Izquierda del Libro */}
      <path
        d="M24 16C20 18.5 15 18 12 17.5V31.5C15 32 20 32.5 24 30V16Z"
        fill="url(#edunova-grad-primary)"
      />

      {/* Hoja Derecha del Libro */}
      <path
        d="M24 16C28 18.5 33 18 36 17.5V31.5C33 32 28 32.5 24 30V16Z"
        fill="url(#edunova-grad-secondary)"
      />

      {/* Estela / Destello de Crecimiento */}
      <path
        d="M24 10L26.5 14.5L31 17L26.5 19.5L24 24L21.5 19.5L17 17L21.5 14.5L24 10Z"
        fill="#FFFFFF"
        filter="url(#glow-star)"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  variant = "full",
  iconSize = 32,
  showBadge = true,
}: BrandLogoProps) {
  if (variant === "icon") {
    return <BrandIcon size={iconSize} className={className} />;
  }

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <BrandIcon size={iconSize} />
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-foreground text-lg font-sans">
            Edu<span className="text-indigo-600 dark:text-indigo-400">Nova</span>
          </span>
          {showBadge && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded">
              PRO
            </span>
          )}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground tracking-normal mt-0.5">
          Sistema de Gestión Escolar
        </span>
      </div>
    </div>
  );
}
