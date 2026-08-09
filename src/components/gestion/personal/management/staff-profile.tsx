"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconEdit,
  IconBuilding,
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconPhone,
  IconHeartbeat,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
  IconMail,
  IconId,
  IconBulb,
} from "@tabler/icons-react";
import { StaffTableType } from "@/components/gestion/personal/components/columns";
import { getInitials } from "@/lib/formats";
import { useState, useMemo } from "react";
import { updateStaffAction } from "@/actions/staff";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { toast } from "sonner";
import { IconCamera, IconLoader2, IconTrash } from "@tabler/icons-react";
import { InlineEditableField } from "./inline-editable-field";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  TURNO_OPTIONS,
  ESCALA_MAGISTERIAL_OPTIONS,
} from "@/lib/constants";

interface StaffProfileProps {
  staff: StaffTableType;
  showViewSheet: boolean;
  setShowViewSheet: (value: boolean) => void;
  setShowEditDialog: (value: boolean) => void;
}

const TABS = [
  { id: "personal", label: "Datos Personales", icon: IconUser },
  { id: "laboral", label: "Datos Laborales", icon: IconBriefcase },
  { id: "academico", label: "Perfil Académico", icon: IconCertificate },
  { id: "contacto", label: "Contacto", icon: IconPhone },
  { id: "emergencia", label: "Emergencia", icon: IconHeartbeat },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function StaffProfile({
  staff: initialStaff,
  showViewSheet,
  setShowViewSheet,
  setShowEditDialog,
}: StaffProfileProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const { copied, copy } = useCopyToClipboard();

  // Admin Global es solo lectura
  const isAdminGlobal =
    staff.cargo?.codigo === "ADMIN_GLOBAL" ||
    staff.email === "admin@colegio.edu.pe";

  const {
    image: avatarImage,
    isUploading,
    fileInputRef,
    openFilePicker: handleImageClick,
    handleFileChange,
    handleDelete: handleDeleteImage,
  } = useAvatarUpload({
    initialImage: initialStaff.image,
    onSave: async (imageUrl) => {
      const result = await updateStaffAction(staff.id, { image: imageUrl });
      if (!result.error) {
        setStaff((prev) => ({ ...prev, image: imageUrl }));
      }
      return result;
    },
  });

  // Helper para guardar un campo individual (Estilo Facebook)
  const saveField = async (field: string, value: any) => {
    const res = await updateStaffAction(staff.id, { [field]: value });
    if (res.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    setStaff((prev) => ({ ...prev, [field]: value }));
    toast.success("Campo actualizado en tiempo real");
  };

  const handleCopyText = (text: string, label: string) => {
    copy(text, `${label} copiado al portapapeles`);
  };

  const handleOpenWhatsapp = () => {
    if (!staff.telefono) return;
    const cleanPhone = staff.telefono.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Estimado(a) ${staff.name}, le saludamos de la dirección de la institución educativa.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  // Filtrar pestañas: ocultar "academico" si no es docente
  const visibleTabs = TABS.filter(
    (tab) => tab.id !== "academico" || staff.role === "profesor",
  );

  const statusColor = staff.estado?.color || "#6366F1";

  return (
    <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
      <SheetContent className="sm:max-w-[560px] w-[92%] p-0 overflow-y-auto bg-background flex flex-col border-l border-border/40 shadow-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Perfil del Colaborador</SheetTitle>
          <SheetDescription>
            Expediente detallado de {staff.name} {staff.apellidoPaterno}
          </SheetDescription>
        </SheetHeader>

        {/* HEADER DESIGN - EduNova Pro Style */}
        <div className="relative w-full shrink-0">
          {/* Banner de fondo */}
          <div className="h-28 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30" />

          {/* Botón Editar Formulario Completo */}
          {!isAdminGlobal && (
            <div className="absolute top-3.5 right-3.5 z-20">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 rounded-xl bg-background/80 hover:bg-background border border-border/40 shadow-xs text-xs font-semibold gap-1.5 transition-[background-color,transform] hover:scale-105"
                onClick={() => setShowEditDialog(true)}
              >
                <IconEdit className="size-3.5 text-indigo-500" />
                <span>Formulario Completo</span>
              </Button>
            </div>
          )}

          {/* Avatar con Anillo y Estado */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-10">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <div className="relative p-1 rounded-full bg-indigo-500/10 shadow-lg overflow-visible">
                <Avatar className="size-20 border-2 border-background shadow-inner relative overflow-hidden">
                  <AvatarImage src={avatarImage ?? undefined} alt={staff.name} />
                  <AvatarFallback className="text-2xl font-bold bg-indigo-600 text-white uppercase">
                    {getInitials(staff.name, staff.apellidoPaterno)}
                  </AvatarFallback>

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-[2px]">
                      <IconLoader2 className="size-6 text-white animate-spin" />
                    </div>
                  )}
                </Avatar>

                {/* Cambiar Foto */}
                {!isAdminGlobal && (
                  <button
                    disabled={isUploading}
                    onClick={handleImageClick}
                    className="absolute -bottom-1 -right-1 size-7 rounded-full bg-indigo-600 text-white border-2 border-background shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-30 cursor-pointer"
                    title="Cambiar foto de perfil"
                  >
                    {isUploading ? (
                      <IconLoader2 className="size-3 animate-spin" />
                    ) : (
                      <IconCamera className="size-3.5" />
                    )}
                  </button>
                )}

                {/* Borrar Foto */}
                {avatarImage && !isUploading && !isAdminGlobal && (
                  <button
                    onClick={handleDeleteImage}
                    className="absolute -bottom-1 -left-1 size-7 rounded-full bg-rose-500 text-white border-2 border-background shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-30 cursor-pointer"
                    title="Eliminar foto"
                  >
                    <IconTrash className="size-3.5" />
                  </button>
                )}

                {/* Indicador de Estado */}
                {!isUploading && (
                  <div
                    className="absolute top-0 right-0 size-3.5 rounded-full border-2 border-background shadow-xs z-30"
                    style={{ backgroundColor: statusColor }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Título y Datos Rápidos de Cabecera */}
        <div className="px-6 pt-12 pb-3 shrink-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight capitalize">
                {staff.name} {staff.apellidoPaterno} {staff.apellidoMaterno}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                >
                  {staff.cargo?.nombre || "Sin cargo"}
                </Badge>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <IconBuilding className="size-3.5 text-indigo-500" />
                  {staff.area || "General"}
                </span>
              </div>
            </div>

            {/* Botón WhatsApp Directo */}
            {staff.telefono && (
              <Button
                size="sm"
                type="button"
                onClick={handleOpenWhatsapp}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                title={`Enviar WhatsApp a ${staff.name} (${staff.telefono})`}
              >
                <IconBrandWhatsapp className="size-3.5" />
                <span>WhatsApp</span>
              </Button>
            )}
          </div>

          {/* DNI & Email Badges copiables */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {staff.dni && (
              <Badge
                variant="outline"
                onClick={() => handleCopyText(staff.dni!, "DNI")}
                className="cursor-pointer border-border/40 hover:border-indigo-500/30 text-xs font-mono font-medium gap-1 py-0.5 px-2 rounded-lg"
                title="Haga clic para copiar DNI"
              >
                <IconId className="size-3 text-muted-foreground" />
                <span>DNI: {staff.dni}</span>
              </Badge>
            )}
            {staff.email && (
              <Badge
                variant="outline"
                onClick={() => handleCopyText(staff.email, "Correo")}
                className="cursor-pointer border-border/40 hover:border-indigo-500/30 text-xs font-medium gap-1 py-0.5 px-2 rounded-lg"
                title="Haga clic para copiar correo"
              >
                <IconMail className="size-3 text-muted-foreground" />
                <span className="truncate max-w-[200px]">{staff.email}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* ── NAVEGACIÓN Y EDICIÓN INLINE ESTILO FACEBOOK ── */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0 border-t border-border/30">
          {/* Navegación de Pestañas */}
          <nav className="sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border/30 px-3 py-2 sm:py-4 bg-muted/10">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-2 mb-2 hidden sm:block">
              Secciones del Expediente
            </p>
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-[color,background-color,box-shadow] whitespace-nowrap w-full text-left cursor-pointer",
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Panel de Campos Editables Inline (Estilo Facebook) */}
          <div className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
            <div className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mb-3 flex items-center justify-between">
              <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <IconBulb className="size-3.5 shrink-0" />
                Haz clic en cualquier campo para editarlo en tiempo real.
              </span>
            </div>

            {activeTab === "personal" && (
              <>
                <InlineEditableField
                  label="Fecha de Nacimiento"
                  value={
                    staff.fechaNacimiento
                      ? new Date(staff.fechaNacimiento)
                      : null
                  }
                  type="date"
                  placeholder="Agregar fecha de nacimiento"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("fechaNacimiento", v)}
                />
                <InlineEditableField
                  label="Sexo / Género"
                  value={staff.sexo}
                  type="select"
                  options={SEXO_OPTIONS}
                  placeholder="Seleccionar sexo"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("sexo", v)}
                />
                <InlineEditableField
                  label="Estado Civil"
                  value={staff.estadoCivil}
                  type="select"
                  options={ESTADO_CIVIL_OPTIONS}
                  placeholder="Agregar estado civil"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("estadoCivil", v)}
                />
                <InlineEditableField
                  label="Nacionalidad"
                  value={staff.nacionalidad}
                  type="text"
                  placeholder="Agregar nacionalidad"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("nacionalidad", v)}
                />
                <InlineEditableField
                  label="Documento de Identidad (DNI)"
                  value={staff.dni}
                  type="text"
                  placeholder="DNI"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("dni", v)}
                />
              </>
            )}

            {activeTab === "laboral" && (
              <>
                <InlineEditableField
                  label="Tipo de Contrato"
                  value={staff.tipoContrato}
                  type="select"
                  options={TIPO_CONTRATO_OPTIONS}
                  placeholder="Seleccionar tipo de contrato"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("tipoContrato", v)}
                />
                <InlineEditableField
                  label="Número de Contrato"
                  value={staff.numeroContrato}
                  type="text"
                  placeholder="Agregar número de contrato"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("numeroContrato", v)}
                />
                <InlineEditableField
                  label="Fecha de Contratación"
                  value={
                    staff.fechaContratacion
                      ? new Date(staff.fechaContratacion)
                      : null
                  }
                  type="date"
                  placeholder="Seleccionar fecha"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("fechaContratacion", v)}
                />
                <InlineEditableField
                  label="Fecha de Ingreso Institucional"
                  value={
                    staff.fechaIngreso ? new Date(staff.fechaIngreso) : null
                  }
                  type="date"
                  placeholder="Seleccionar fecha"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("fechaIngreso", v)}
                />
                <InlineEditableField
                  label="Turno Laboral"
                  value={staff.turno}
                  type="select"
                  options={TURNO_OPTIONS}
                  placeholder="Seleccionar turno"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("turno", v)}
                />
              </>
            )}

            {activeTab === "academico" && staff.role === "profesor" && (
              <>
                <InlineEditableField
                  label="Especialidad Pedagógica"
                  value={staff.especialidad}
                  type="text"
                  placeholder="Agregar especialidad"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("especialidad", v)}
                />
                <InlineEditableField
                  label="Título / Grado Académico"
                  value={staff.titulo}
                  type="text"
                  placeholder="Agregar título académico"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("titulo", v)}
                />
                <InlineEditableField
                  label="N° Colegiatura (CPP)"
                  value={staff.colegioProfesor}
                  type="text"
                  placeholder="Agregar número de colegiatura"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("colegioProfesor", v)}
                />
                <InlineEditableField
                  label="Escala Magisterial"
                  value={staff.escalaMagisterial}
                  type="select"
                  options={ESCALA_MAGISTERIAL_OPTIONS}
                  placeholder="Seleccionar escala"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("escalaMagisterial", v)}
                />
              </>
            )}

            {activeTab === "contacto" && (
              <>
                <InlineEditableField
                  label="Correo Electrónico"
                  value={staff.email}
                  type="text"
                  placeholder="Agregar correo electrónico"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("email", v)}
                />
                <InlineEditableField
                  label="Teléfono de Contacto"
                  value={staff.telefono}
                  type="text"
                  placeholder="Agregar teléfono"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("telefono", v)}
                />
                <InlineEditableField
                  label="Dirección Domiciliaria"
                  value={staff.direccion}
                  type="text"
                  placeholder="Agregar dirección"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("direccion", v)}
                />
              </>
            )}

            {activeTab === "emergencia" && (
              <>
                <InlineEditableField
                  label="Nombre de Contacto de Emergencia"
                  value={staff.contactoEmergencia}
                  type="text"
                  placeholder="Agregar nombre del contacto"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("contactoEmergencia", v)}
                />
                <InlineEditableField
                  label="Teléfono de Emergencia"
                  value={staff.telefonoEmergencia}
                  type="text"
                  placeholder="Agregar teléfono de emergencia"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("telefonoEmergencia", v)}
                />
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
