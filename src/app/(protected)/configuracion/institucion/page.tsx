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
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSettings size={14} />
            Parámetros del Sistema
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Configuración Institucional
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Administra la identidad legal de la institución, sedes operativas, cuentas bancarias y variables dinámicas.
          </p>
        </div>
      </div>

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
