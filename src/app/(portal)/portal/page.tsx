import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  IconReceipt,
  IconCheck,
  IconAlertTriangle,
  IconUser,
  IconSchool,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/formats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WelcomeBanner } from "@/components/portal/welcome-banner";
import { PortalStatCard } from "@/components/portal/portal-stat-card";
import { StudentCard } from "@/components/portal/student-card";

export default async function PortalDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Obtener hijos del padre (a través de RelacionFamiliar)
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        include: {
          nivelAcademico: {
            include: {
              grado: true,
              nivel: true,
            },
          },
          cronogramaPagos: {
            where: { pagado: false },
            include: { concepto: true },
          },
        },
      },
    },
  });

  const hijos = relaciones.map((r) => r.hijo);

  // Calcular estadísticas
  const totalDeuda = hijos.reduce((acc, hijo) => {
    return (
      acc +
      hijo.cronogramaPagos.reduce(
        (sum, c) => sum + (c.monto - Number(c.montoPagado)),
        0
      )
    );
  }, 0);

  const vencidas = hijos.reduce((acc, hijo) => {
    return (
      acc +
      hijo.cronogramaPagos.filter(
        (c) => new Date(c.fechaVencimiento) < new Date()
      ).length
    );
  }, 0);

  // Obtener comprobantes pendientes
  const comprobantesPendientes = await prisma.comprobantePago.count({
    where: {
      padreId: session.user.id,
      estado: "PENDIENTE",
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main animate-in fade-in duration-500">
      {/* Premium Welcome Banner */}
      <WelcomeBanner userName={session.user.name || ""} />

      {/* Estadísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalStatCard
          title="Hijos Registrados"
          value={hijos.length.toString()}
          icon={IconUser}
          color="blue"
          description="Estudiantes vinculados"
        />
        <PortalStatCard
          title="Deuda Pendiente"
          value={formatCurrency(totalDeuda)}
          icon={IconReceipt}
          color="amber"
          description="Total por cancelar"
        />
        <PortalStatCard
          title="Cuotas Vencidas"
          value={vencidas.toString()}
          icon={IconAlertTriangle}
          color="red"
          description="Requieren atención"
        />
        <PortalStatCard
          title="Pendientes Revisión"
          value={comprobantesPendientes.toString()}
          icon={IconCheck}
          color="violet"
          description="Pagos por verificar"
        />
      </div>

      {/* Lista de Hijos */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <IconSchool className="size-8 text-primary" />
            Mis Hijos
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/portal/deudas" className="text-primary font-semibold">
              Ver todos <IconChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hijos.length === 0 ? (
            <Card className="col-span-full border-dashed p-12 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <IconUser className="size-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-bold">No tienes hijos registrados</p>
              <p className="text-sm text-muted-foreground mt-2">
                Contacta a la administración para vincular a tus hijos al
                sistema.
              </p>
            </Card>
          ) : (
            hijos.map((hijo) => <StudentCard key={hijo.id} hijo={hijo} />)
          )}
        </div>
      </div>
    </div>
  );
}
