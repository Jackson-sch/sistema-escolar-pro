"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  IconShieldCheck,
  IconPhone,
  IconId,
  IconUserCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type { AuthorizedGuardian } from "../scanner-types";

interface KioskAuthorizedGuardiansProps {
  guardians?: AuthorizedGuardian[];
  compact?: boolean;
}

export function KioskAuthorizedGuardians({
  guardians = [],
  compact = false,
}: KioskAuthorizedGuardiansProps) {
  if (!guardians || guardians.length === 0) {
    return (
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
        <IconAlertTriangle className="size-4 shrink-0" />
        <span>Sin apoderados registrados con autorización expresa. Verificar con dirección.</span>
      </div>
    );
  }

  const authorizedList = guardians.filter((g) => g.autorizadoRecoger);

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <IconShieldCheck className="size-3.5 text-emerald-500" />
          Retiro Autorizado (Pick-up)
        </span>
        <Badge
          variant="outline"
          className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        >
          {authorizedList.length} personas autorizadas
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
        {authorizedList.map((guardian) => (
          <div
            key={guardian.id}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-card/80 border border-border/50 shadow-xs hover:border-emerald-500/40 transition-colors"
          >
            <Avatar className="size-9 border border-emerald-500/30 shrink-0">
              <AvatarImage src={guardian.image || undefined} className="object-cover" />
              <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                {guardian.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs truncate text-foreground">
                  {guardian.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium flex-wrap">
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 rounded font-semibold capitalize bg-muted"
                >
                  {guardian.parentesco}
                </Badge>
                {guardian.dni && (
                  <span className="flex items-center gap-0.5 font-mono">
                    <IconId className="size-2.5 opacity-70" />
                    {guardian.dni}
                  </span>
                )}
                {guardian.telefono && (
                  <span className="flex items-center gap-0.5 font-mono text-emerald-600 dark:text-emerald-400">
                    <IconPhone className="size-2.5" />
                    {guardian.telefono}
                  </span>
                )}
              </div>
            </div>

            <IconUserCheck className="size-4 text-emerald-500 shrink-0" title="Autorizado" />
          </div>
        ))}
      </div>
    </div>
  );
}
