"use client";

import * as React from "react";
import {
  IconSun,
  IconReceipt,
  IconSend,
} from "@tabler/icons-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  getDailyAbsenceAlertsAction,
  sendBulkAbsenceAlertsAction,
  getUpcomingDuePensionsAlertsAction,
} from "@/actions/alerts-center";
import { AbsentStudentAlert, DuePensionAlert } from "@/actions/alerts-center/types";

import { AbsenceAlertsTab } from "./components/absence-alerts-tab";
import { PensionsAlertsTab } from "./components/pensions-alerts-tab";
import { BroadcastTab } from "./components/broadcast-tab";

export function AlertsHubView() {
  const [activeTab, setActiveTab] = React.useState("inasistencias");

  // ESTADO PESTAÑA 1: INASISTENCIAS
  const [absenceData, setAbsenceData] = React.useState<{
    fecha: string;
    items: AbsentStudentAlert[];
    resumen: any;
  } | null>(null);
  const [isLoadingAbsences, setIsLoadingAbsences] = React.useState(false);
  const [selectedAbsenceIds, setSelectedAbsenceIds] = React.useState<string[]>(
    [],
  );
  const [isSendingAbsenceAlerts, setIsSendingAbsenceAlerts] =
    React.useState(false);

  // ESTADO PESTAÑA 2: PENSIONES
  const [diasAnticipacion, setDiasAnticipacion] = React.useState("5");
  const [pensionsData, setPensionsData] = React.useState<{
    items: DuePensionAlert[];
    resumen: any;
  } | null>(null);
  const [isLoadingPensions, setIsLoadingPensions] = React.useState(false);

  // ESTADO PESTAÑA 3: COMUNICADO MULTICANAL
  const [customSubject, setCustomSubject] = React.useState("");
  const [customMessage, setCustomMessage] = React.useState("");
  const [targetScope, setTargetScope] = React.useState("ALL");
  const [isSendingCustom] = React.useState(false);

  // Cargar inasistencias del día
  const loadAbsences = React.useCallback(async () => {
    setIsLoadingAbsences(true);
    try {
      const res = await getDailyAbsenceAlertsAction();
      if (res.success && res.data) {
        setAbsenceData(res.data);
        setSelectedAbsenceIds(res.data.items.map((i) => i.id));
      } else {
        toast.error(res.error || "No se pudieron cargar las inasistencias");
      }
    } catch {
      toast.error("Error al consultar inasistencias del día");
    } finally {
      setIsLoadingAbsences(false);
    }
  }, []);

  // Cargar pensiones por vencer
  const loadPensions = React.useCallback(async (dias: number) => {
    setIsLoadingPensions(true);
    try {
      const res = await getUpcomingDuePensionsAlertsAction(dias);
      if (res.success && res.data) {
        setPensionsData(res.data);
      } else {
        toast.error(res.error || "No se pudieron cargar las pensiones");
      }
    } catch {
      toast.error("Error al consultar pensiones por vencer");
    } finally {
      setIsLoadingPensions(false);
    }
  }, []);

  React.useEffect(() => {
    loadAbsences();
    loadPensions(parseInt(diasAnticipacion, 10));
  }, [loadAbsences, loadPensions, diasAnticipacion]);

  // Disparar alertas masivas de inasistencia
  const handleSendBulkAbsences = async () => {
    if (selectedAbsenceIds.length === 0) {
      toast.error("Seleccione al menos un alumno ausente para notificar.");
      return;
    }

    setIsSendingAbsenceAlerts(true);
    try {
      const res = await sendBulkAbsenceAlertsAction({
        studentAlertIds: selectedAbsenceIds,
        canal: "WHATSAPP",
      });

      if (res.success) {
        toast.success(res.mensaje || "Alertas despachadas correctamente");
        loadAbsences();
      } else {
        toast.error(res.error || "Error al despachar alertas");
      }
    } catch {
      toast.error("Error al procesar el envío masivo.");
    } finally {
      setIsSendingAbsenceAlerts(false);
    }
  };

  const toggleSelectAbsence = (id: string) => {
    setSelectedAbsenceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* PESTAÑAS DE CONTROL */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="h-auto p-1 bg-muted/40 rounded-xl border border-border/50 flex flex-wrap items-center gap-1 w-full justify-start">
          <TabsTrigger
            value="inasistencias"
            className="rounded-lg text-xs font-bold gap-1.5 h-8.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconSun className="size-4 text-amber-500" />
            <span>
              Inasistencias de Hoy ({absenceData?.items?.length || 0})
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="pensiones"
            className="rounded-lg text-xs font-bold gap-1.5 h-8.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconReceipt className="size-4 text-emerald-500" />
            <span>
              Pensiones por Vencer ({pensionsData?.items?.length || 0})
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="comunicados"
            className="rounded-lg text-xs font-bold gap-1.5 h-8.5 px-3 data-[state=active]:bg-background data-[state=active]:shadow-2xs cursor-pointer"
          >
            <IconSend className="size-4 text-primary" />
            <span>Comunicado Masivo Multicanal</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INASISTENCIAS DEL DÍA */}
        <TabsContent value="inasistencias">
          <AbsenceAlertsTab
            absenceData={absenceData}
            isLoading={isLoadingAbsences}
            selectedIds={selectedAbsenceIds}
            isSending={isSendingAbsenceAlerts}
            onRefresh={loadAbsences}
            onSendBulk={handleSendBulkAbsences}
            onToggleSelect={toggleSelectAbsence}
          />
        </TabsContent>

        {/* TAB 2: PENSIONES POR VENCER */}
        <TabsContent value="pensiones">
          <PensionsAlertsTab
            pensionsData={pensionsData}
            isLoading={isLoadingPensions}
            diasAnticipacion={diasAnticipacion}
            onDiasChange={(v: string) => {
              setDiasAnticipacion(v);
              loadPensions(parseInt(v, 10));
            }}
            onRefresh={() => loadPensions(parseInt(diasAnticipacion, 10))}
          />
        </TabsContent>

        {/* TAB 3: COMUNICADO MASIVO MULTICANAL */}
        <TabsContent value="comunicados">
          <BroadcastTab
            targetScope={targetScope}
            onTargetScopeChange={setTargetScope}
            customSubject={customSubject}
            onCustomSubjectChange={setCustomSubject}
            customMessage={customMessage}
            onCustomMessageChange={setCustomMessage}
            isSending={isSendingCustom}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
