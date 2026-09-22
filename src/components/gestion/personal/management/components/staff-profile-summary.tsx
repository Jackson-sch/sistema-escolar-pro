"use client";

import {
  IconBuilding,
  IconBrandWhatsapp,
  IconId,
  IconMail,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface StaffProfileSummaryProps {
  staff: any;
  onCopyText: (text: string, label: string) => void;
  onOpenWhatsapp: () => void;
}

export function StaffProfileSummary({
  staff,
  onCopyText,
  onOpenWhatsapp,
}: StaffProfileSummaryProps) {
  return (
    <div className="px-6 pt-12 pb-3 shrink-0 space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight capitalize">
            {staff.name} {staff.apellidoPaterno} {staff.apellidoMaterno}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
            >
              {staff.cargo?.nombre || "Sin cargo"}
            </Badge>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium">
              <IconBuilding className="size-3.5 text-indigo-500" />
              {staff.area || "General"}
            </span>
          </div>
        </div>

        {/* Botón WhatsApp Directo */}
        {staff.telefono && (
          <Button
            size="sm"
            type="button"
            onClick={onOpenWhatsapp}
            className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
            title={`Enviar WhatsApp a ${staff.name} (${staff.telefono})`}
          >
            <IconBrandWhatsapp className="size-3.5" />
            <span>WhatsApp</span>
          </Button>
        )}
      </div>

      {/* DNI & Email Badges copiables */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {staff.dni && (
          <Badge
            variant="outline"
            onClick={() => onCopyText(staff.dni!, "DNI")}
            className="cursor-pointer border-border/40 hover:border-indigo-500/30 text-xs font-mono font-medium gap-1 py-0.5 px-2 rounded-lg"
            title="Haga clic para copiar DNI"
          >
            <IconId className="size-3 text-muted-foreground" />
            <span>DNI: {staff.dni}</span>
          </Badge>
        )}
        {staff.email && (
          <Badge
            variant="outline"
            onClick={() => onCopyText(staff.email, "Correo")}
            className="cursor-pointer border-border/40 hover:border-indigo-500/30 text-xs font-medium gap-1 py-0.5 px-2 rounded-lg"
            title="Haga clic para copiar correo"
          >
            <IconMail className="size-3 text-muted-foreground" />
            <span className="truncate max-w-[200px]">{staff.email}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
