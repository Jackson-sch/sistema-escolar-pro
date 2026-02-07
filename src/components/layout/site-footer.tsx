"use client";

import { IconHeartFilled, IconShieldCheck, IconCpu } from "@tabler/icons-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-10 border-t border-border/40 bg-card/20 backdrop-blur-md px-6 py-4 sm:py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Marca y Versión */}
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
            <IconCpu className="size-3.5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">
              EduPeru Pro
            </span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tighter">
              v2.1.0 • Enterprise Edition
            </span>
          </div>
        </div>

        {/* Centro - Copyright */}
        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground/60">
          <span>&copy; {currentYear} Todos los derechos reservados</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            Hecho con{" "}
            <IconHeartFilled className="size-3 text-red-500/80 animate-pulse" />{" "}
            por
            <span className="text-foreground/80 font-bold hover:text-primary transition-colors cursor-default">
              JSC DEV Team
            </span>
          </div>
        </div>

        {/* Lado Derecho - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-tight">
              System Online
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground/40 text-[10px]">
            <IconShieldCheck className="size-3.5" />
            <span>Encrypted Session</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
