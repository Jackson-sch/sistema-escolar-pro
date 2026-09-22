import { getInstitucionAction } from "@/actions/institucion";
import { getVariablesAction } from "@/actions/variables";
import { getSedesAction } from "@/actions/sedes";
import { getBankAccountsAction } from "@/actions/bancos";
import { InstitucionForm } from "@/components/configuracion/institucion-form";
import { VariablesPanel } from "@/components/configuracion/variables/variables-panel";
import { SedesList } from "@/components/configuracion/sedes/sedes-list";
import { BankAccountList } from "@/components/configuracion/bancos/bank-account-list";
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs";
import { Badge } from "@/components/ui/badge";
import { IconSettings } from "@tabler/icons-react";

import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Configuración de la Institución | Sistema Escolar Pro",
  description: "Gestión de datos institucionales, sedes y variables del sistema.",
};

export default async function ConfiguracionPage() {
  const [institucionRes, variablesRes, sedesRes, bancosRes] = await Promise.all(
    [
      getInstitucionAction(),
      getVariablesAction(),
      getSedesAction(),
      getBankAccountsAction({ onlyActive: false }),
    ],
  );

  if (
    institucionRes.error ||
    variablesRes.error ||
    sedesRes.error ||
    bancosRes.error
  ) {
    return (
      <div className="p-6 text-center text-rose-600 font-semibold border border-rose-500/20 rounded-2xl bg-rose-500/10">
        {institucionRes.error ||
          variablesRes.error ||
          sedesRes.error ||
          bancosRes.error}
      </div>
    );
  }

  const institucion = institucionRes.data;
  const variables = variablesRes.data || [];
  const sedes = sedesRes.data || [];
  const bancos = bancosRes.success || [];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL ── */}
      <PageHeader
        icon={<IconSettings size={20} />}
        title="Datos de la Institución"
        badge="Parámetros I.E."
        description={`Identidad escolar, sedes operativas, cuentas bancarias y variables del sistema · ${institucion?.nombreInstitucion || "I.E."}`}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Configuración", href: "/configuracion/institucion" },
          { label: "Datos de la I.E." },
        ]}
      />

      <div className="px-1">
        <ConfiguracionTabs>
          {{
            datos: <InstitucionForm initialData={institucion} />,
            sedes: <SedesList initialData={sedes} />,
            variables: <VariablesPanel initialData={variables} />,
            bancos: <BankAccountList initialData={bancos} />,
          }}
        </ConfiguracionTabs>
      </div>
    </div>
  );
}
