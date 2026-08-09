"use client";

import { useState } from "react";
import {
  IconSpeakerphone,
  IconCalendar,
} from "@tabler/icons-react";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnnouncementList } from "@/components/comunicaciones/anuncios/announcement-list";
import { EventCalendar } from "@/components/comunicaciones/eventos/event-calendar";

interface ComunicacionesViewProps {
  anuncios: any[];
  eventos: any[];
}

const COMUNICACIONES_TABS = [
  { 
    id: "anuncios", 
    label: "Anuncios", 
    icon: <IconSpeakerphone className="size-4" /> 
  },
  { 
    id: "eventos", 
    label: "Calendario", 
    icon: <IconCalendar className="size-4" /> 
  },
];

export function ComunicacionesView({
  anuncios,
  eventos,
}: ComunicacionesViewProps) {
  const [activeTab, setActiveTab] = useState("anuncios");

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <AnimatedTabs
          tabs={COMUNICACIONES_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="anuncios" className="mt-0 outline-none">
          <AnnouncementList initialAnuncios={anuncios} />
        </TabsContent>

        <TabsContent value="eventos" className="mt-0 outline-none">
          <EventCalendar initialEventos={eventos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
