"use client";

import {
  IconShieldCheck,
  IconTrendingUp,
  IconRocket,
} from "@tabler/icons-react";
import { StepperItem } from "../stepper-item";
import { ActiveTab } from "./promociones-types";

interface PromotionStepperProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function PromotionStepper({
  activeTab,
  onTabChange,
}: PromotionStepperProps) {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-3 py-1">
      <StepperItem
        active={activeTab === "auditoria"}
        completed={activeTab !== "auditoria"}
        icon={<IconShieldCheck className="size-4" />}
        label="Paso 1"
        title="Auditoría de Cierre"
        onClick={() => onTabChange("auditoria")}
      />
      <div className="hidden md:block w-8 h-0.5 bg-border/40" />
      <StepperItem
        active={activeTab === "mapeo"}
        completed={activeTab === "ejecucion"}
        icon={<IconTrendingUp className="size-4" />}
        label="Paso 2"
        title="Mapeo & Nómina"
        onClick={() =>
          activeTab !== "auditoria" ? onTabChange("mapeo") : null
        }
        disabled={activeTab === "auditoria"}
      />
      <div className="hidden md:block w-8 h-0.5 bg-border/40" />
      <StepperItem
        active={activeTab === "ejecucion"}
        completed={false}
        icon={<IconRocket className="size-4" />}
        label="Paso 3"
        title="Confirmación & Cierre"
        disabled={activeTab !== "ejecucion"}
      />
    </div>
  );
}
