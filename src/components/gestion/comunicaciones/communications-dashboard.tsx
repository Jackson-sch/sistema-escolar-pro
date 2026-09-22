"use client";

import {
  CommunicationsStatsGrid,
  CommunicationsIntegrationsSidebar,
} from "./communications-dashboard-widgets";
import { CommunicationsDirectSender } from "./communications-direct-sender";

interface CommunicationsDashboardProps {
  stats: {
    totalEsteMes: number;
    tendencia: number;
    tasaExito: number;
    canales: {
      EMAIL: number;
      SMS: number;
      WHATSAPP: number;
    };
    integrations: {
      resend: boolean;
      twilio: boolean;
    };
  };
}

export function CommunicationsDashboard({ stats }: CommunicationsDashboardProps) {
  return (
    <div className="space-y-6 pb-8">
      {/* 1. Bento Grid de Estadísticas Analíticas */}
      <CommunicationsStatsGrid stats={stats} />

      {/* 2. Cuerpo Principal: Formulario de Envíos & Proveedores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario Multicanal (8/12 de ancho) */}
        <CommunicationsDirectSender />

        {/* Proveedores & Guías (4/12 de ancho) */}
        <CommunicationsIntegrationsSidebar stats={stats} />
      </div>
    </div>
  );
}
