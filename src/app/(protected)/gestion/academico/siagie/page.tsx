import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { SiagieAuditConsole } from "@/components/evaluaciones/siagie/siagie-audit-console";
import { getSiagieInstitutionalOverviewAction } from "@/actions/siagie-audit";
import { IconFileSpreadsheet, IconArrowLeft } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Validador y Exportador Oficial SIAGIE / CNEB | Sistema Escolar Pro",
  description: "Auditoría de consistencia pedagógica y exportación masiva de calificaciones para el SIAGIE del MINEDU.",
};

export default async function SiagieAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { periodo } = await searchParams;
  const res = await getSiagieInstitutionalOverviewAction(periodo);

  if (!res.data || res.error) {
    return (
      <div className="space-y-4">
        <div className="p-12 text-center text-muted-foreground border border-dashed rounded-2xl">
          {res.error || "No se pudo cargar la información de auditoría."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <IconFileSpreadsheet className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                Validador & Exportador SIAGIE
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              >
                CNEB Oficial
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Auditoría pedagógica y generación de nóminas oficiales para el MINEDU
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-xl h-8.5 text-xs font-bold gap-1.5 border-border/60 bg-card cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Link href="/evaluaciones">
            <IconArrowLeft className="size-3.5" />
            <span>Registro de Evaluaciones</span>
          </Link>
        </Button>
      </div>

      <SiagieAuditConsole initialData={res.data} />
    </div>
  );
}
