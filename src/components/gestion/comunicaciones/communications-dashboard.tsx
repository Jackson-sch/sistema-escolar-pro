"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  IconMail,
  IconMessage,
  IconBrandWhatsapp,
  IconCheck,
  IconX,
  IconSearch,
  IconSend,
  IconLoader2,
  IconHistory,
  IconInfoCircle,
  IconPlug,
  IconChevronRight,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { searchStudentsAction } from "@/actions/students";
import { sendManualStudentNotificationAction } from "@/actions/notifications";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados del Formulario
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<("EMAIL" | "SMS" | "WHATSAPP")[]>(["EMAIL"]);
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
    <div className="space-y-6 pb-8">
      {/* 1. Bento Grid de Estadísticas Analíticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Envíos del Mes */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Envíos de este Mes
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              <IconTrendingUp className="size-3 mr-1" />
              +{stats.tendencia}%
            </Badge>
          </div>
          <div>
            <h3 className="text-3xl font-bold font-mono text-foreground">{stats.totalEsteMes}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Notificaciones despachadas</p>
          </div>
        </div>

        {/* Tasa de Entrega / Éxito */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Tasa de Éxito
            </span>
            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-3xl font-bold font-mono text-foreground">{stats.tasaExito}%</h3>
            <div className="w-full bg-muted/40 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${stats.tasaExito}%` }} />
            </div>
          </div>
        </div>

        {/* Canales Utilizados */}
        <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36 col-span-1 md:col-span-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Distribución por Canal
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">Mes en curso</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <IconMail className="size-4 mb-0.5" />
              <span className="text-base font-bold font-mono">{stats.canales.EMAIL}</span>
              <span className="text-[9px] font-bold uppercase">Correo</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <IconMessage className="size-4 mb-0.5" />
              <span className="text-base font-bold font-mono">{stats.canales.SMS}</span>
              <span className="text-[9px] font-bold uppercase">SMS</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <IconBrandWhatsapp className="size-4 mb-0.5" />
              <span className="text-base font-bold font-mono">{stats.canales.WHATSAPP}</span>
              <span className="text-[9px] font-bold uppercase">WhatsApp</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo Principal: Formulario de Envíos & Proveedores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario Multicanal (8/12 de ancho) */}
        <Card className="lg:col-span-8 p-6 rounded-2xl bg-card/80 border-border/40 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Envío de Notificación Directa</h3>
              <p className="text-xs text-muted-foreground">Despacha comunicados a los tutores de un alumno.</p>
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
            <div className="space-y-1.5 relative">
              <span className="text-xs font-medium text-foreground/80">
                Seleccionar Estudiante Destinatario
              </span>
              {selectedStudent ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2.5">
                    <IconUser className="size-5 text-indigo-500" />
                    <div>
                      <div className="font-bold text-xs text-foreground capitalize">
                        {selectedStudent.apellidoPaterno} {selectedStudent.apellidoMaterno}, {selectedStudent.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>DNI: {selectedStudent.dni}</span>
                        {selectedStudent.nivelAcademico?.grado && (
                          <span>• {selectedStudent.nivelAcademico.grado.nombre} &quot;{selectedStudent.nivelAcademico.seccion}&quot;</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-lg size-7 hover:bg-rose-500/10 hover:text-rose-500"
                    onClick={() => setSelectedStudent(null)}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
                  <Input
                    placeholder="Escriba nombre, apellido o DNI del alumno..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                  {searching && (
                    <div className="absolute right-3 top-2.5">
                      <IconLoader2 className="animate-spin text-muted-foreground/60 size-4" />
                    </div>
                  )}
                </div>
              )}

              {/* Resultados flotantes */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <LazyMotion features={domAnimation}>
                    <m.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-50 left-0 right-0 top-16 rounded-xl border border-border/40 bg-background shadow-lg overflow-hidden max-h-56 overflow-y-auto"
                    >
                      {searchResults.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleSelectStudent(student)}
                          className="w-full text-left p-3 hover:bg-indigo-500/10 border-b border-border/20 last:border-b-0 transition-colors flex justify-between items-center group cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-xs text-foreground group-hover:text-indigo-600">
                              {student.apellidoPaterno} {student.apellidoMaterno}, {student.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              DNI: {student.dni} — {student.nivelAcademico?.grado?.nombre || "Sin Sección"} &quot;{student.nivelAcademico?.seccion || ""}&quot;
                            </div>
                          </div>
                          <IconChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </m.div>
                  </LazyMotion>
                )}
              </AnimatePresence>
            </div>

            {/* Selector de Canales */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-foreground/80">Canales de Envío Simultáneo</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Email */}
                <button
                  type="button"
                  onClick={() => handleToggleChannel("EMAIL")}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
                    selectedChannels.includes("EMAIL")
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                      : "bg-background border-border/40 hover:bg-muted/40"
                  )}
                >
                  <IconMail className={cn("size-4 shrink-0", selectedChannels.includes("EMAIL") ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground")} />
                  <div>
                    <span className="font-bold block text-xs">Correo Electrónico</span>
                    <span className="text-[10px] text-muted-foreground">Resend API</span>
                  </div>
                </button>

                {/* SMS */}
                <button
                  type="button"
                  onClick={() => handleToggleChannel("SMS")}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
                    selectedChannels.includes("SMS")
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
                      : "bg-background border-border/40 hover:bg-muted/40"
                  )}
                >
                  <IconMessage className={cn("size-4 shrink-0", selectedChannels.includes("SMS") ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                  <div>
                    <span className="font-bold block text-xs">SMS de Texto</span>
                    <span className="text-[10px] text-muted-foreground">Twilio Engine</span>
                  </div>
                </button>

                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleToggleChannel("WHATSAPP")}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-xl border transition-[color,background-color,border-color,box-shadow] text-left outline-none cursor-pointer",
                    selectedChannels.includes("WHATSAPP")
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-background border-border/40 hover:bg-muted/40"
                  )}
                >
                  <IconBrandWhatsapp className={cn("size-4 shrink-0", selectedChannels.includes("WHATSAPP") ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
                  <div>
                    <span className="font-bold block text-xs">WhatsApp</span>
                    <span className="text-[10px] text-muted-foreground">Twilio Gateway</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Asunto */}
            {selectedChannels.includes("EMAIL") && (
              <div className="space-y-1.5">
                <label htmlFor="comunicacion-asunto" className="text-xs font-medium text-foreground/80">Asunto del Correo</label>
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
              <label htmlFor="comunicacion-mensaje" className="text-xs font-medium text-foreground/80">Cuerpo del Mensaje</label>
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

        {/* Proveedores & Guías (4/12 de ancho) */}
        <div className="space-y-4 lg:col-span-4">
          <Card className="p-5 rounded-2xl bg-card/80 border-border/40 shadow-xl space-y-3">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <IconPlug className="size-4 text-indigo-500" />
              Estado de Integraciones
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Estado operativo de los proveedores de telecomunicaciones.
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <IconMail className="size-4 text-indigo-500" />
                  <span className="text-xs font-semibold">Resend Email API</span>
                </div>
                {stats.integrations.resend ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <IconCheck className="size-3 mr-0.5" /> Activo
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <IconX className="size-3 mr-0.5" /> Inactivo
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/30">
                <div className="flex items-center gap-2">
                  <IconBrandWhatsapp className="size-4 text-emerald-500" />
                  <span className="text-xs font-semibold">Twilio SMS / WhatsApp</span>
                </div>
                {stats.integrations.twilio ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <IconCheck className="size-3 mr-0.5" /> Activo
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                    <IconX className="size-3 mr-0.5" /> Inactivo
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl bg-indigo-500/5 border-indigo-500/15 space-y-3">
            <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 uppercase tracking-wider">
              <IconInfoCircle className="size-4 text-indigo-500" />
              Guía de Despacho
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed font-medium">
              <div className="flex gap-2">
                <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                <p>Escriba el nombre o DNI del alumno para vincular a sus apoderados.</p>
              </div>
              <div className="flex gap-2">
                <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                <p>Seleccione los canales activos por los que desea enviar la alerta.</p>
              </div>
              <div className="flex gap-2">
                <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                <p>Consulte el registro de auditoría en la opción &ldquo;Ver Historial&rdquo;.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
