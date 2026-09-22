"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  IconSend,
  IconLoader2,
  IconHistory,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { searchStudentsAction } from "@/actions/students";
import { sendManualStudentNotificationAction } from "@/actions/notifications";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import {
  StudentSearchSelector,
  ChannelSelectorButtons,
} from "./communications-direct-sender-fields";

export function CommunicationsDirectSender() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados del Formulario
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<
    ("EMAIL" | "SMS" | "WHATSAPP")[]
  >(["EMAIL"]);
  const [searching, setSearching] = useState(false);

  // Buscar estudiantes asíncronamente
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchStudentsAction(searchQuery);
        if (res.data) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error("Error buscando alumnos:", err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleToggleChannel = (channel: "EMAIL" | "SMS" | "WHATSAPP") => {
    if (selectedChannels.includes(channel)) {
      if (selectedChannels.length > 1) {
        setSelectedChannels(selectedChannels.filter((c) => c !== channel));
      } else {
        toast.warning("Debe seleccionar al menos un canal de comunicación.");
      }
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  const handleSend = () => {
    if (!selectedStudent) {
      toast.error("Debe seleccionar un estudiante para notificar.");
      return;
    }
    if (!subject.trim() && selectedChannels.includes("EMAIL")) {
      toast.error("El asunto es requerido para envíos por correo.");
      return;
    }
    if (!message.trim()) {
      toast.error("El mensaje no puede estar vacío.");
      return;
    }

    startTransition(async () => {
      const res = await sendManualStudentNotificationAction({
        studentId: selectedStudent.id,
        subject: subject || `Notificación Escolar`,
        message,
        channels: selectedChannels,
      });

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(
          `Despachado con éxito: ${res.success.succeeded} exitosos, ${res.success.failed} fallidos de ${res.success.totalDispatched} envíos.`
        );
        setSubject("");
        setMessage("");
        setSelectedStudent(null);
        router.refresh();
      }
    });
  };

  return (
    <Card className="lg:col-span-8 p-6 rounded-2xl bg-card/80 border-border/40 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-border/30 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Envío de Notificación Directa
          </h3>
          <p className="text-xs text-muted-foreground">
            Despacha comunicados a los tutores de un alumno.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/gestion/comunicaciones/logs")}
          className="rounded-xl border-border/40 text-xs font-semibold h-8 gap-1.5 bg-background/80"
        >
          <IconHistory className="size-3.5" />
          <span>Ver Historial</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* Buscador de Estudiante */}
        <StudentSearchSelector
          selectedStudent={selectedStudent}
          onSelectStudent={handleSelectStudent}
          onClearStudent={() => setSelectedStudent(null)}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchResults={searchResults}
          searching={searching}
        />

        {/* Selector de Canales */}
        <ChannelSelectorButtons
          selectedChannels={selectedChannels}
          onToggleChannel={handleToggleChannel}
        />

        {/* Asunto */}
        {selectedChannels.includes("EMAIL") && (
          <div className="space-y-1.5">
            <label
              htmlFor="comunicacion-asunto"
              className="text-xs font-medium text-foreground/80"
            >
              Asunto del Correo
            </label>
            <Input
              id="comunicacion-asunto"
              placeholder="Ej. Comunicado oficial: Citación para entrevista..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-background border-border/40 rounded-xl text-xs h-9"
            />
          </div>
        )}

        {/* Mensaje */}
        <div className="space-y-1.5">
          <label
            htmlFor="comunicacion-mensaje"
            className="text-xs font-medium text-foreground/80"
          >
            Cuerpo del Mensaje
          </label>
          <Textarea
            id="comunicacion-mensaje"
            placeholder="Escriba aquí el mensaje detallado para enviar..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
          />
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botón Enviar */}
        <Button
          disabled={isPending}
          onClick={handleSend}
          className="w-full h-10 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <IconLoader2 className="size-4 animate-spin" />
              <span>Despachando notificaciones...</span>
            </>
          ) : (
            <>
              <IconSend className="size-4" />
              <span>Enviar Alerta Multicanal Ahora</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
