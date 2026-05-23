"use client";

import {
  IconAlertCircle,
  IconArrowRight,
  IconCircleCheckFilled,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromocionesAuditoriaProps {
  anioOrigen: number;
  anioDestino: number;
  onProceed: () => void;
}

const validationItems = [
  {
    id: "grades",
    label: "Cierre de Notas",
    description: "Todas las notas y promedios finales registrados.",
    status: "complete",
  },
  {
    id: "attendance",
    label: "Control de Asistencia",
    description: "Asistencia institucional validada y cerrada.",
    status: "complete",
  },
  {
    id: "finance",
    label: "Solvencia Estudiantil",
    description: "Sincronización de estados de pago.",
    status: "warning",
  },
];

export function PromocionesAuditoria({
  anioOrigen,
  anioDestino,
  onProceed,
}: PromocionesAuditoriaProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase tracking-tighter">
          Auditoría Académica {anioOrigen}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Validación inteligente de prerrequisitos institucionales para
          garantizar una promoción sin errores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {validationItems.map((item) => (
          <Card
            key={item.id}
            className="liquid-glass p-6 rounded-[2.5rem] border-border/40 group hover:scale-[1.02]"
          >
            <div className="space-y-4">
              <div
                className={cn(
                  "size-12 rounded-2xl flex items-center justify-center border transition-all",
                  item.status === "complete"
                    ? "bg-green-500/10 border-green-500/30 text-green-500"
                    : "bg-warning/10 border-warning/30 text-warning"
                )}
              >
                {item.status === "complete" ? (
                  <IconCircleCheckFilled className="size-6" />
                ) : (
                  <IconAlertCircle className="size-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base">{item.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
              <Badge
                variant={item.status === "complete" ? "secondary" : "outline"}
                className="rounded-full px-3 py-1"
              >
                {item.status === "complete"
                  ? "Validado"
                  : "Revisión Sugerida"}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <Card className="liquid-glass p-8 rounded-[3rem] border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-visible relative">
        <div className="absolute -top-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl animate-blob"></div>
        <div className="space-y-2 text-center md:text-left z-10">
          <h2 className="text-2xl font-bold italic tracking-tighter">
            ¿SISTEMA LISTO?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            El año lectivo {anioOrigen} cumple con los estándares
            institucionales básicos. Puedes proceder al mapeo de secciones para
            el nuevo ciclo {anioDestino}.
          </p>
        </div>
        <Button
          onClick={onProceed}
          className="rounded-3xl h-14 px-10 font-bold bg-primary text-primary-foreground shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest gap-3 z-10"
        >
          Configurar Mapeo
          <IconArrowRight size={18} />
        </Button>
      </Card>
    </div>
  );
}
