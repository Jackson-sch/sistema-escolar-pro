"use client";

import { cn } from "@/lib/utils";

interface TimeGaugeProps {
  time: string;
  label: string;
  className?: string;
  percentage?: number; // 0 to 100 for the circle fill
}

export function TimeGauge({
  time,
  label,
  className,
  percentage = 75, // Default for visual style in image
}: TimeGaugeProps) {
  // SVG calculation for a semi-circular or circular gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="size-48 transform -rotate-90">
        {/* Track */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-muted/10"
        />
        {/* Progress */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke="url(#blueGradient)"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient
            id="blueGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#59bfff" />
            <stop offset="100%" stopColor="#59bfff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black font-mono tracking-tighter black:text-white">
          {time}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </span>
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
