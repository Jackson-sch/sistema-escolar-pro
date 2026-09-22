import { IconUsers } from "@tabler/icons-react";
import {
  getStaffAction,
  getInstitucionesAction,
  getUserStatusesAction,
  getCargosAction,
} from "@/actions/staff";
import { columns } from "@/components/gestion/personal/components/columns";
import { StaffTable } from "@/components/gestion/personal/management/staff-table";
import { AddStaffButton } from "@/components/gestion/personal/components/add-staff-button";
import { DownloadStaffButton } from "@/components/gestion/personal/components/download-staff-button";
import { StaffKPIs } from "@/components/gestion/personal/components/staff-kpis";
import { PageHeader } from "@/components/common/page-header";
import { Suspense } from "react";

export default async function PersonalPage() {
  // Fetch de todos los datos necesarios en paralelo para optimizar carga
  const [
    { data: staff = [] },
    { data: instituciones = [] },
    { data: estados = [] },
    { data: cargos = [] },
  ] = await Promise.all([
    getStaffAction(),
    getInstitucionesAction(),
    getUserStatusesAction(),
    getCargosAction(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-in fade-in duration-200">
      <PageHeader
        icon={<IconUsers size={20} />}
        title="Gestión de Personal"
        badge={`${staff.length} Registrados`}
        description="Administración de perfiles, cargos, asignaciones y nómina del equipo docente y administrativo."
        breadcrumbs={[
          { label: "Personas", href: "/gestion/personal" },
          { label: "Personal & Docentes" },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <DownloadStaffButton rows={staff} />
            <AddStaffButton
              instituciones={instituciones as any}
              estados={estados as any}
              cargos={cargos as any}
            />
          </div>
        }
      />

      <StaffKPIs staffList={staff} />

      <Suspense
        fallback={
          <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-2xl border border-border/40" />
        }
      >
        <StaffTable
          columns={columns}
          data={staff as any}
          meta={{ instituciones, estados, cargos }}
        />
      </Suspense>
    </div>
  );
}
