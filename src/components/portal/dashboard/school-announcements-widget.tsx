import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconCircleFilled } from "@tabler/icons-react";
import Link from "next/link";

export default function SchoolAnnouncementsWidget({
  anuncios,
  studentId,
}: {
  anuncios: any[];
  studentId: string;
}) {
  return (
    <Card className="p-6 flex flex-col h-full min-h-[300px]">
      <div className="flex flex-col @sm:flex-row @sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wider">
          Anuncios Escolares
        </h3>
        <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black uppercase w-fit">
          {anuncios.length} NUEVOS
        </Badge>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {anuncios.length > 0 ? (
          anuncios.map((anuncio: any) => (
            <div key={anuncio.id} className="space-y-2">
              <div className="flex items-start gap-3">
                <IconCircleFilled className="size-2 text-emerald-500 mt-1.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">{anuncio.titulo}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {new Date(anuncio.fechaPublicacion).toLocaleDateString(
                      "es-ES",
                      { month: "short", day: "2-digit" },
                    )}
                  </p>
                  <Link
                    href={`/portal/comunicaciones?hijoId=${studentId}`}
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
            No hay anuncios disponibles.
          </p>
        )}
      </div>
    </Card>
  );
}
