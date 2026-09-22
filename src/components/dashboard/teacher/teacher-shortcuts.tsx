"use client";

import {
  IconSparkles,
  IconUserCheck,
  IconClipboardCheck,
  IconUsers,
  IconSpeakerphone,
  type Icon,
} from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TeacherShortcuts() {
  return (
    <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-indigo-500/5 p-4.5 space-y-3 shadow-xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <IconSparkles size={14} className="text-indigo-500" />
        Acciones Frecuentes
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <QuickShortcutButton
          href="/asistencia"
          icon={IconUserCheck}
          title="Asistencias"
          color="indigo"
        />
        <QuickShortcutButton
          href="/evaluaciones"
          icon={IconClipboardCheck}
          title="Calificaciones"
          color="amber"
        />
        <QuickShortcutButton
          href="/gestion/estudiantes"
          icon={IconUsers}
          title="Estudiantes"
          color="blue"
        />
        <QuickShortcutButton
          href="/comunicaciones"
          icon={IconSpeakerphone}
          title="Comunicados"
          color="rose"
        />
      </div>
    </div>
  );
}

const SHORTCUT_COLOR_MAP = {
  indigo:
    "hover:border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5",
  amber:
    "hover:border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5",
  blue: "hover:border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/5",
  emerald:
    "hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5",
  rose:
    "hover:border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/5",
};

function QuickShortcutButton({
  href,
  icon: Icon,
  title,
  color,
}: {
  href: string;
  icon: Icon;
  title: string;
  color: "indigo" | "amber" | "blue" | "emerald" | "rose";
}) {

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-2xl border border-border/50 transition-all duration-200 text-center gap-1.5 shadow-xs hover:shadow-sm cursor-pointer",
        SHORTCUT_COLOR_MAP[color],
      )}
    >
      <Icon size={18} />
      <span className="text-[11px] font-bold text-foreground">{title}</span>
    </Link>
  );
}
