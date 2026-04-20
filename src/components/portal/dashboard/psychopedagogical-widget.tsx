import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconCircleFilled } from "@tabler/icons-react";
import Link from "next/link";

export default function PsychopedagogicalWidget({
  fichas,
  studentId,
}: {
  fichas: any[];
  studentId: string;
}) {
  return (
    <Card className="p-6 flex flex-col h-full min-h-[300px] liquid-glass relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
      <div className="relative z-10 w-full h-full flex flex-col">
      <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wider">
          Reportes Psicopedagógicos
        </h3>
        <Badge className="bg-amber-500/10 text-amber-500 border-none text-[10px] font-black uppercase w-fit">
          {fichas.length} NUEVOS
        </Badge>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {fichas.length > 0 ? (
          fichas.map((ficha: any) => (
            <div key={ficha.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <IconCircleFilled className="size-2 text-amber-500 mt-1.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">{ficha.categoria.nombre}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Dr. {ficha.especialista.name.split(" ")[0]} •{" "}
                    {new Date(ficha.fecha).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </p>
                  <Link
                    href={`/portal/disciplina?hijoId=${studentId}`}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4"
                  >
                    Leer más
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No hay reportes disponibles.
          </p>
        )}
      </div>
      </div>
    </Card>
  );
}
