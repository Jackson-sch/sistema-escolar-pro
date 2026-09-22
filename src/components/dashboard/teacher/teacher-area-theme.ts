import {
  IconCalculator,
  IconBook2,
  IconFlask,
  IconWorld,
  IconLanguage,
  IconHeart,
  IconPalette,
  IconRun,
  IconDeviceLaptop,
  IconBook,
  type Icon,
} from "@tabler/icons-react";
import { HorarioResumen } from "./teacher-types";

export interface AreaTheme {
  border: string;
  bg: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  text: string;
  hoverBorder: string;
  icon: Icon;
  gradient: string;
}

export function getAreaTheme(areaName?: string): AreaTheme {
  const norm = (areaName || "").toLowerCase().trim();

  if (norm.includes("matem")) {
    return {
      border: "border-blue-500/20",
      bg: "bg-blue-500/[0.03]",
      badgeBg: "bg-blue-500/10",
      badgeBorder: "border-blue-500/25",
      badgeText: "text-blue-600 dark:text-blue-400",
      text: "text-blue-600 dark:text-blue-400",
      hoverBorder: "hover:border-blue-500/40",
      icon: IconCalculator,
      gradient: "from-blue-500/10 to-transparent",
    };
  }

  if (
    norm.includes("comunic") ||
    norm.includes("lengua") ||
    norm.includes("verbal") ||
    norm.includes("dictado")
  ) {
    return {
      border: "border-amber-500/20",
      bg: "bg-amber-500/[0.03]",
      badgeBg: "bg-amber-500/10",
      badgeBorder: "border-amber-500/25",
      badgeText: "text-amber-600 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      hoverBorder: "hover:border-amber-500/40",
      icon: IconBook2,
      gradient: "from-amber-500/10 to-transparent",
    };
  }

  if (
    norm.includes("cienc") ||
    norm.includes("cta") ||
    norm.includes("biolog") ||
    norm.includes("quimic") ||
    norm.includes("fisic") ||
    norm.includes("ambient")
  ) {
    return {
      border: "border-emerald-500/20",
      bg: "bg-emerald-500/[0.03]",
      badgeBg: "bg-emerald-500/10",
      badgeBorder: "border-emerald-500/25",
      badgeText: "text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-500/40",
      icon: IconFlask,
      gradient: "from-emerald-500/10 to-transparent",
    };
  }

  if (
    norm.includes("social") ||
    norm.includes("histori") ||
    norm.includes("geograf") ||
    norm.includes("ciudadan") ||
    norm.includes("civic")
  ) {
    return {
      border: "border-purple-500/20",
      bg: "bg-purple-500/[0.03]",
      badgeBg: "bg-purple-500/10",
      badgeBorder: "border-purple-500/25",
      badgeText: "text-purple-600 dark:text-purple-400",
      text: "text-purple-600 dark:text-purple-400",
      hoverBorder: "hover:border-purple-500/40",
      icon: IconWorld,
      gradient: "from-purple-500/10 to-transparent",
    };
  }

  if (norm.includes("ingl") || norm.includes("foreign") || norm.includes("idiom")) {
    return {
      border: "border-cyan-500/20",
      bg: "bg-cyan-500/[0.03]",
      badgeBg: "bg-cyan-500/10",
      badgeBorder: "border-cyan-500/25",
      badgeText: "text-cyan-600 dark:text-cyan-400",
      text: "text-cyan-600 dark:text-cyan-400",
      hoverBorder: "hover:border-cyan-500/40",
      icon: IconLanguage,
      gradient: "from-cyan-500/10 to-transparent",
    };
  }

  if (
    norm.includes("relig") ||
    norm.includes("espirit") ||
    norm.includes("valor") ||
    norm.includes("fe")
  ) {
    return {
      border: "border-rose-500/20",
      bg: "bg-rose-500/[0.03]",
      badgeBg: "bg-rose-500/10",
      badgeBorder: "border-rose-500/25",
      badgeText: "text-rose-600 dark:text-rose-400",
      text: "text-rose-600 dark:text-rose-400",
      hoverBorder: "hover:border-rose-500/40",
      icon: IconHeart,
      gradient: "from-rose-500/10 to-transparent",
    };
  }

  if (
    norm.includes("arte") ||
    norm.includes("cultur") ||
    norm.includes("music") ||
    norm.includes("danz")
  ) {
    return {
      border: "border-fuchsia-500/20",
      bg: "bg-fuchsia-500/[0.03]",
      badgeBg: "bg-fuchsia-500/10",
      badgeBorder: "border-fuchsia-500/25",
      badgeText: "text-fuchsia-600 dark:text-fuchsia-400",
      text: "text-fuchsia-600 dark:text-fuchsia-400",
      hoverBorder: "hover:border-fuchsia-500/40",
      icon: IconPalette,
      gradient: "from-fuchsia-500/10 to-transparent",
    };
  }

  if (
    norm.includes("fisic") ||
    norm.includes("deport") ||
    norm.includes("psicomotr")
  ) {
    return {
      border: "border-teal-500/20",
      bg: "bg-teal-500/[0.03]",
      badgeBg: "bg-teal-500/10",
      badgeBorder: "border-teal-500/25",
      badgeText: "text-teal-600 dark:text-teal-400",
      text: "text-teal-600 dark:text-teal-400",
      hoverBorder: "hover:border-teal-500/40",
      icon: IconRun,
      gradient: "from-teal-500/10 to-transparent",
    };
  }

  if (
    norm.includes("comput") ||
    norm.includes("inform") ||
    norm.includes("tic") ||
    norm.includes("tecnolog") ||
    norm.includes("robot")
  ) {
    return {
      border: "border-sky-500/20",
      bg: "bg-sky-500/[0.03]",
      badgeBg: "bg-sky-500/10",
      badgeBorder: "border-sky-500/25",
      badgeText: "text-sky-600 dark:text-sky-400",
      text: "text-sky-600 dark:text-sky-400",
      hoverBorder: "hover:border-sky-500/40",
      icon: IconDeviceLaptop,
      gradient: "from-sky-500/10 to-transparent",
    };
  }

  // Tema predeterminado
  return {
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/[0.03]",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/25",
    badgeText: "text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverBorder: "hover:border-indigo-500/40",
    icon: IconBook,
    gradient: "from-indigo-500/10 to-transparent",
  };
}

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function formatCourseHorarios(horarios?: HorarioResumen[]): string | null {
  if (!horarios || horarios.length === 0) return null;
  const daysList = Array.from(
    new Set(horarios.map((h) => DAYS_SHORT[h.diaSemana] || "Día"))
  );
  const first = horarios[0];
  return `${daysList.join(", ")} · ${first.horaInicio} - ${first.horaFin}`;
}
