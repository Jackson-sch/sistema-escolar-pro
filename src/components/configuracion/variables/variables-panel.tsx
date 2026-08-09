"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  upsertVariableAction,
  deleteVariableAction,
} from "@/actions/variables";
import { VariableForm } from "./variable-form";
import { VariableList } from "./variable-list";
import { VariableSistema } from "./types";

import { sendSmsAction } from "@/actions/sms";
import { sendEmailAction } from "@/actions/email";
import { ComprobanteFormatConfig } from "./comprobante-format-config";
import { FORMATO_COMPROBANTE_KEY } from "@/lib/comprobante-constants";
import { 
  IconInfoCircle, 
  IconCloud, 
  IconCopy, 
  IconCheck, 
  IconSend, 
  IconMail,
  IconSparkles,
  IconFlask
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VariablesPanelProps {
  initialData: VariableSistema[];
}

function CopyableCode({
  code,
  children,
}: {
  code: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copiado: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li>
      <button
        type="button"
        className="group flex w-full items-center justify-between hover:bg-indigo-500/10 px-2 py-1 rounded-lg transition-[background-color,border-color] cursor-pointer border border-transparent hover:border-indigo-500/20 text-left bg-transparent"
        onClick={onCopy}
        title="Click para copiar clave"
      >
        <span className="flex items-center gap-1.5 overflow-hidden">
          <code className="bg-muted/40 px-1.5 py-0.5 rounded text-[11px] font-mono text-foreground font-semibold">
            {code}
          </code>
          {children}
        </span>
        {copied ? (
          <IconCheck className="size-3.5 text-emerald-500 shrink-0" />
        ) : (
          <IconCopy className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
        )}
      </button>
    </li>
  );
}

export function VariablesPanel({ initialData }: VariablesPanelProps) {
  const [variables, setVariables] =
    React.useState<VariableSistema[]>(initialData);

  const formatoComprobante =
    initialData.find((v) => v.clave === FORMATO_COMPROBANTE_KEY)?.valor || "A4";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const variableToDeleteIdRef = React.useRef<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Estados para prueba de SMS
  const [testPhone, setTestPhone] = React.useState("");
  const [isTestLoading, setIsTestLoading] = React.useState(false);

  const onTestSms = async () => {
    if (!testPhone || testPhone.trim().length < 9) {
      toast.error("Ingrese un número válido (ej: 987654321 o con +51)");
      return;
    }
    setIsTestLoading(true);
    try {
      const result = await sendSmsAction({
        to: testPhone,
        mensaje:
          "¡Prueba de alerta SMS exitosa! El Sistema Escolar Pro está listo para notificaciones. 🚀",
      });
      if (result.success) {
        toast.success("SMS enviado correctamente");
      } else {
        toast.error(result.error || "Error al realizar la prueba de SMS");
      }
    } finally {
      setIsTestLoading(false);
    }
  };

  // Estados para prueba de Email
  const [testEmail, setTestEmail] = React.useState("");
  const [isEmailLoading, setIsEmailLoading] = React.useState(false);

  const onTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Ingrese un correo válido");
      return;
    }
    setIsEmailLoading(true);
    try {
      const result = await sendEmailAction({
        to: testEmail,
        subject: "Prueba de Notificación — Sistema Escolar Pro",
        mensaje:
          "¡Prueba de envío por correo exitosa! Tu plataforma está correctamente integrada con el servicio de despacho.",
        nombre: "Administrador",
        accionLabel: "Ir al Sistema",
        accionUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      });
      if (result.success) {
        toast.success("Email enviado. Verifique su bandeja de entrada");
      } else {
        toast.error("Error al enviar el correo de prueba");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleVariableSaved = (variable: VariableSistema) => {
    setVariables((prev) => {
      const exists = prev.find((p) => p.clave === variable.clave);
      if (exists) {
        return prev.map((p) => (p.clave === variable.clave ? variable : p));
      }
      return [variable, ...prev];
    });
  };

  const handleUpdateVariable = async (variable: VariableSistema) => {
    const result = await upsertVariableAction({
      clave: variable.clave,
      valor: variable.valor,
      tipo: variable.tipo,
      descripcion: variable.descripcion || undefined,
      seccion: variable.seccion || undefined,
      activo: variable.activo,
    });

    if (result.data) {
      setVariables((prev) =>
        prev.map((v) => (v.id === variable.id ? result.data : v)),
      );
    } else {
      toast.error(result.error || "Error al actualizar la variable");
    }
  };

  const handleDeleteClick = (id: string) => {
    variableToDeleteIdRef.current = id;
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    const idToDelete = variableToDeleteIdRef.current;
    if (!idToDelete) return;

    setIsDeleting(true);
    const result = await deleteVariableAction(idToDelete);

    if (result.success) {
      setVariables((prev) => prev.filter((v) => v.id !== idToDelete));
      toast.success("Variable eliminada correctamente");
    } else {
      toast.error(result.error || "Error al eliminar la variable");
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    variableToDeleteIdRef.current = null;
  };

  return (
    <div className="space-y-6">
      {/* Guía de Integraciones Externas */}
      <Card className="p-5 rounded-2xl bg-card/80 border-border/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <IconInfoCircle className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Guía de Variables e Integraciones</h3>
              <p className="text-xs text-muted-foreground">Claves de API y parámetros para conectar servicios externos al colegio.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Cloudinary */}
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <IconCloud className="size-4 text-sky-500" /> Cloudinary
              </span>
              <Badge variant="outline" className="text-[9px] font-bold bg-sky-500/10 text-sky-600 border-none">Imágenes</Badge>
            </div>
            <ul className="space-y-1">
              <CopyableCode code="CLOUDINARY_CLOUD_NAME" />
              <CopyableCode code="CLOUDINARY_API_KEY" />
              <CopyableCode code="CLOUDINARY_API_SECRET" />
            </ul>
          </div>

          {/* Resend */}
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <IconMail className="size-4 text-indigo-500" /> Resend
              </span>
              <Badge variant="outline" className="text-[9px] font-bold bg-indigo-500/10 text-indigo-600 border-none">Correo</Badge>
            </div>
            <ul className="space-y-1">
              <CopyableCode code="RESEND_API_KEY" />
            </ul>
          </div>

          {/* Twilio */}
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <IconSend className="size-4 text-emerald-500" /> Twilio SMS
              </span>
              <Badge variant="outline" className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-none">SMS</Badge>
            </div>
            <ul className="space-y-1">
              <CopyableCode code="TWILIO_ACCOUNT_SID" />
              <CopyableCode code="TWILIO_AUTH_TOKEN" />
              <CopyableCode code="TWILIO_PHONE_NUMBER" />
            </ul>
          </div>

          {/* Google Gemini */}
          <div className="p-3.5 rounded-xl bg-background/50 border border-border/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                <IconSparkles className="size-4 text-amber-500" /> Gemini AI
              </span>
              <Badge variant="outline" className="text-[9px] font-bold bg-amber-500/10 text-amber-600 border-none">IA</Badge>
            </div>
            <ul className="space-y-1">
              <CopyableCode code="GOOGLE_GENERATIVE_AI_API_KEY" />
              <CopyableCode code="GEMINI_MODEL" />
            </ul>
          </div>
        </div>

        {/* Banco de Pruebas Integrado */}
        <div className="pt-3 border-t border-border/30 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <IconFlask className="size-4 text-indigo-500" />
            <span>Banco de Pruebas de Despacho Directo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Test SMS */}
            <div className="p-3 rounded-xl bg-background/40 border border-border/30 space-y-2">
              <label htmlFor="test-sms-phone" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Probar Despacho de SMS
              </label>
              <div className="flex gap-2">
                <Input
                  id="test-sms-phone"
                  placeholder="Número de celular (ej. 987654321)"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="h-9 text-xs bg-background border-border/40 rounded-xl"
                  disabled={isTestLoading}
                />
                <Button
                  size="sm"
                  onClick={onTestSms}
                  disabled={isTestLoading}
                  className="rounded-xl px-4 h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 shrink-0 gap-1.5 cursor-pointer"
                >
                  <IconSend className="size-3.5" />
                  <span>{isTestLoading ? "..." : "Enviar SMS"}</span>
                </Button>
              </div>
            </div>

            {/* Test Email */}
            <div className="p-3 rounded-xl bg-background/40 border border-border/30 space-y-2">
              <label htmlFor="test-email-addr" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Probar Despacho de Correo
              </label>
              <div className="flex gap-2">
                <Input
                  id="test-email-addr"
                  placeholder="correo@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="h-9 text-xs bg-background border-border/40 rounded-xl"
                  disabled={isEmailLoading}
                />
                <Button
                  size="sm"
                  onClick={onTestEmail}
                  disabled={isEmailLoading}
                  className="rounded-xl px-4 h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 shrink-0 gap-1.5 cursor-pointer"
                >
                  <IconMail className="size-3.5" />
                  <span>{isEmailLoading ? "..." : "Enviar Email"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ComprobanteFormatConfig currentValue={formatoComprobante} />

      <VariableForm onVariableSaved={handleVariableSaved} />
      
      <VariableList
        variables={variables}
        onUpdateVariable={handleUpdateVariable}
        onDeleteVariable={handleDeleteClick}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="Eliminar Variable"
        description="¿Estás seguro de que deseas eliminar esta variable? Esta acción afectará a las configuraciones que la requieran."
        variant="danger"
      />
    </div>
  );
}
