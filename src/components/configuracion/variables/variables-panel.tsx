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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Cloudy, Copy, Check, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/modals/confirm-modal";

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

  const onCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Copiado: ${code}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <li
      className="group flex items-center justify-between hover:bg-blue-200/50 dark:hover:bg-blue-800/20 px-2 py-0.5 rounded transition-all cursor-pointer border border-transparent hover:border-blue-300/30"
      onClick={onCopy}
      title="Click para copiar"
    >
      <span className="flex items-center gap-2 overflow-hidden">
        <code className="bg-blue-200/30 dark:bg-blue-900/40 px-1 rounded text-blue-900 dark:text-blue-100">
          {code}
        </code>
        {children}
      </span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 shrink-0" />
      )}
    </li>
  );
}

export function VariablesPanel({ initialData }: VariablesPanelProps) {
  const [variables, setVariables] =
    React.useState<VariableSistema[]>(initialData);

  const formatoComprobante =
    initialData.find((v) => v.clave === FORMATO_COMPROBANTE_KEY)?.valor || "A4";
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [variableToDeleteId, setVariableToDeleteId] = React.useState<
    string | null
  >(null);
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
    const result = await sendSmsAction({
      to: testPhone,
      mensaje:
        "¡Prueba de Twilio exitosa! El Sistema Escolar Pro está listo para enviar alertas SMS. 🚀",
    });
    if (result.success) {
      toast.success("SMS enviado. Verifique su teléfono.");
    } else {
      toast.error(result.error || "Error en la prueba.");
    }
    setIsTestLoading(false);
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
    const result = await sendEmailAction({
      to: testEmail,
      subject: "Prueba de Configuración - Sistema Escolar Pro",
      mensaje:
        "¡Prueba de Resend exitosa! Tu sistema está configurado para enviar notificaciones por correo.",
      nombre: "Administrador",
      accionLabel: "Ir al Dashboard",
      accionUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    });
    if (result.success) {
      toast.success("Email enviado. Verifique su bandeja.");
    } else {
      toast.error("Error al enviar el email.");
    }
    setIsEmailLoading(false);
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
    setVariableToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!variableToDeleteId) return;

    setIsDeleting(true);
    const result = await deleteVariableAction(variableToDeleteId);

    if (result.success) {
      setVariables((prev) => prev.filter((v) => v.id !== variableToDeleteId));
      toast.success("Variable eliminada correctamente");
    } else {
      toast.error(result.error || "Error al eliminar la variable");
    }

    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setVariableToDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <Alert className="lg:col-span-3 w-full bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 flex flex-col">
        <AlertTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Guía de Integraciones Externas
        </AlertTitle>
        <AlertDescription className="text-blue-700/80 dark:text-blue-400/80 mt-4">
          <div className="flex flex-wrap gap-4 items-stretch">
            {/* Cloudinary */}
            <div className="flex flex-col h-full flex-1 min-w-[200px] bg-blue-100/30 dark:bg-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-3">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1 text-sm">
                <Cloudy className="h-4 w-4" /> Cloudinary
              </span>
              <p className="text-[10px] mb-3 opacity-70 leading-tight">
                Almacenamiento multimedia:
              </p>
              <ul className="mt-auto space-y-1 font-mono text-[10px]">
                <CopyableCode code="CLOUDINARY_CLOUD_NAME" />
                <CopyableCode code="CLOUDINARY_API_KEY" />
                <CopyableCode code="CLOUDINARY_API_SECRET" />
              </ul>
            </div>

            {/* Resend */}
            <div className="flex flex-col h-full flex-1 min-w-[150px] bg-blue-100/30 dark:bg-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-3">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1 text-sm">
                <Mail className="h-4 w-4" /> Resend
              </span>
              <p className="text-[10px] mb-3 opacity-70 leading-tight">
                Envío de correos automáticos:
              </p>
              <ul className="mt-auto space-y-1 font-mono text-[10px]">
                <CopyableCode code="RESEND_API_KEY" />
              </ul>
            </div>

            {/* Twilio */}
            <div className="flex flex-col h-full flex-1 min-w-[250px] bg-blue-100/30 dark:bg-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-3">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1 text-sm">
                <Send className="h-4 w-4" /> Twilio (SMS)
              </span>
              <p className="text-[10px] mb-3 opacity-70 leading-tight">
                Notificaciones de texto (SMS):
              </p>
              <ul className="mt-auto space-y-1 font-mono text-[10px]">
                <CopyableCode code="TWILIO_ACCOUNT_SID" />
                <CopyableCode code="TWILIO_AUTH_TOKEN" />
                <CopyableCode code="TWILIO_PHONE_NUMBER">
                  <span className="text-blue-600/70 dark:text-blue-400/50 font-sans italic">
                    - (+51...)
                  </span>
                </CopyableCode>
                <CopyableCode code="SMS_AUTO_ANUNCIOS">
                  <span className="text-blue-600/70 dark:text-blue-400/50 font-sans italic">
                    - (true/false) Envíos auto.
                  </span>
                </CopyableCode>
              </ul>
            </div>

            {/* Google Gemini */}
            <div className="flex flex-col h-full flex-1 min-w-[200px] bg-blue-100/30 dark:bg-blue-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50 p-3">
              <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2 mb-1 text-sm">
                🤖 Google Gemini
              </span>
              <p className="text-[10px] mb-3 opacity-70 leading-tight">
                IA y análisis de datos:
              </p>
              <ul className="mt-auto space-y-1 font-mono text-[10px]">
                <CopyableCode code="GOOGLE_GENERATIVE_AI_API_KEY" />
                <CopyableCode code="GEMINI_MODEL" />
              </ul>
            </div>
          </div>

          {/* Panel de Pruebas */}
          <div className="mt-6 pt-4 border-t border-blue-200/50 dark:border-blue-800/50">
            <span className="text-xs font-semibold text-blue-800 dark:text-blue-300 block mb-3">
              🧪 Banco de Pruebas (Validación Rápida)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Test SMS */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Probar SMS
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Número (9XXXXXXXX)"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    className="h-8 text-xs bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800"
                    disabled={isTestLoading}
                  />
                  <Button
                    size="sm"
                    onClick={onTestSms}
                    disabled={isTestLoading}
                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white flex gap-1 items-center"
                  >
                    {isTestLoading ? "..." : <Send className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              {/* Test Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Probar Email
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="correo@ejemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="h-8 text-xs bg-white/50 dark:bg-black/20 border-blue-200 dark:border-blue-800"
                    disabled={isEmailLoading}
                  />
                  <Button
                    size="sm"
                    onClick={onTestEmail}
                    disabled={isEmailLoading}
                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex gap-1 items-center"
                  >
                    {isEmailLoading ? "..." : <Mail className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
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
        description="¿Estás seguro de que deseas eliminar esta variable? Esta acción no se puede deshacer."
        variant="danger"
      />
    </div>
  );
}
