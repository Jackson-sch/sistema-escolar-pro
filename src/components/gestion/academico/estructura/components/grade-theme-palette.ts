export interface GradeTheme {
  name: string;
  indicator: string;
  badge: string;
  headerGradient: string;
  borderAccent: string;
  buttonText: string;
  buttonBorder: string;
  iconColor: string;
  slotBg: string;
}

export const GRADE_COLOR_THEMES: GradeTheme[] = [
  {
    name: "indigo",
    indicator: "bg-indigo-500",
    badge: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    headerGradient: "from-indigo-500/10 via-indigo-500/5 to-transparent hover:from-indigo-500/15",
    borderAccent: "border-indigo-500/25 hover:border-indigo-500/40",
    buttonText: "text-indigo-600 dark:text-indigo-400",
    buttonBorder: "border-indigo-500/30 hover:bg-indigo-500/10",
    iconColor: "text-indigo-500",
    slotBg: "bg-indigo-950/10 dark:bg-indigo-950/20",
  },
  {
    name: "sky",
    indicator: "bg-sky-500",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    headerGradient: "from-sky-500/10 via-sky-500/5 to-transparent hover:from-sky-500/15",
    borderAccent: "border-sky-500/25 hover:border-sky-500/40",
    buttonText: "text-sky-600 dark:text-sky-400",
    buttonBorder: "border-sky-500/30 hover:bg-sky-500/10",
    iconColor: "text-sky-500",
    slotBg: "bg-sky-950/10 dark:bg-sky-950/20",
  },
  {
    name: "emerald",
    indicator: "bg-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    headerGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent hover:from-emerald-500/15",
    borderAccent: "border-emerald-500/25 hover:border-emerald-500/40",
    buttonText: "text-emerald-600 dark:text-emerald-400",
    buttonBorder: "border-emerald-500/30 hover:bg-emerald-500/10",
    iconColor: "text-emerald-500",
    slotBg: "bg-emerald-950/10 dark:bg-emerald-950/20",
  },
  {
    name: "amber",
    indicator: "bg-amber-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    headerGradient: "from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/15",
    borderAccent: "border-amber-500/25 hover:border-amber-500/40",
    buttonText: "text-amber-600 dark:text-amber-400",
    buttonBorder: "border-amber-500/30 hover:bg-amber-500/10",
    iconColor: "text-amber-500",
    slotBg: "bg-amber-950/10 dark:bg-amber-950/20",
  },
  {
    name: "purple",
    indicator: "bg-purple-500",
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    headerGradient: "from-purple-500/10 via-purple-500/5 to-transparent hover:from-purple-500/15",
    borderAccent: "border-purple-500/25 hover:border-purple-500/40",
    buttonText: "text-purple-600 dark:text-purple-400",
    buttonBorder: "border-purple-500/30 hover:bg-purple-500/10",
    iconColor: "text-purple-500",
    slotBg: "bg-purple-950/10 dark:bg-purple-950/20",
  },
  {
    name: "rose",
    indicator: "bg-rose-500",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    headerGradient: "from-rose-500/10 via-rose-500/5 to-transparent hover:from-rose-500/15",
    borderAccent: "border-rose-500/25 hover:border-rose-500/40",
    buttonText: "text-rose-600 dark:text-rose-400",
    buttonBorder: "border-rose-500/30 hover:bg-rose-500/10",
    iconColor: "text-rose-500",
    slotBg: "bg-rose-950/10 dark:bg-rose-950/20",
  },
  {
    name: "cyan",
    indicator: "bg-cyan-500",
    badge: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    headerGradient: "from-cyan-500/10 via-cyan-500/5 to-transparent hover:from-cyan-500/15",
    borderAccent: "border-cyan-500/25 hover:border-cyan-500/40",
    buttonText: "text-cyan-600 dark:text-cyan-400",
    buttonBorder: "border-cyan-500/30 hover:bg-cyan-500/10",
    iconColor: "text-cyan-500",
    slotBg: "bg-cyan-950/10 dark:bg-cyan-950/20",
  },
];

export function getGradeTheme(index: number = 0, orden?: number): GradeTheme {
  const chosenIndex = orden !== undefined && orden >= 0 ? orden : index;
  const safeIndex = Math.abs(chosenIndex) % GRADE_COLOR_THEMES.length;
  return GRADE_COLOR_THEMES[safeIndex];
}
