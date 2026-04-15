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
} from "@tabler/icons-react";
import { StaffTableType } from "@/components/gestion/personal/components/columns";
import { getInitials } from "@/lib/formats";
import { useState } from "react";
import { updateStaffAction } from "@/actions/staff";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { toast } from "sonner";
import { IconCamera, IconLoader2, IconTrash } from "@tabler/icons-react";
import { InlineEditableField } from "./inline-editable-field";
import { cn } from "@/lib/utils";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

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

  // Admin Global is read-only — no editing allowed
  const isAdminGlobal = staff.cargo?.codigo === "ADMIN_GLOBAL" || staff.email === "admin@colegio.edu.pe";

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

  // Helper para guardar un campo individual
  const saveField = async (field: string, value: any) => {
    const res = await updateStaffAction(staff.id, { [field]: value });
    if (res.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    setStaff((prev) => ({ ...prev, [field]: value }));
    toast.success("Actualizado correctamente");
  };

  // Filter tabs: hide "academico" for non-professors
  const visibleTabs = TABS.filter(
    (tab) => tab.id !== "academico" || staff.role === "profesor",
  );

  return (
    <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
      <SheetContent className="sm:max-w-[560px] w-[90%] p-0 overflow-y-auto bg-background flex flex-col">
        {/* Accesibilidad */}
        <SheetHeader className="sr-only">
          <SheetTitle>Perfil del Colaborador</SheetTitle>
          <SheetDescription>
            Expediente detallado de {staff.name} {staff.apellidoPaterno}
          </SheetDescription>
        </SheetHeader>

        {/* HEADER DESIGN - Premium Redesign */}
        <div className="relative w-full shrink-0">
          {/* Banner Premium */}
          <div className="h-28 w-full relative overflow-hidden">
            <BackgroundRippleEffect />
          </div>

          {/* Edit button — glass pill (hidden for admin global) */}
          {!isAdminGlobal && (
            <div className="absolute top-3.5 right-3.5 z-20">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full 
               bg-black/10 dark:bg-white/10 
               backdrop-blur-md 
               border border-black/20 dark:border-white/20 
               shadow-lg 
               hover:bg-black/20 dark:hover:bg-white/20 
               hover:border-black/30 dark:hover:border-white/30 
               transition-all duration-200 
               hover:scale-105 active:scale-95"
                onClick={() => setShowEditDialog(true)}
              >
                <IconEdit className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Avatar zone */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-10">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* Premium ring: outer glow + gradient border */}
              <div className="absolute -inset-[3px] rounded-full bg-linear-to-br from-primary via-primary/60 to-transparent opacity-80 blur-[1px]" />
              <div className="absolute -inset-[2px] rounded-full bg-linear-to-br from-primary/70 to-transparent" />

              <Avatar className="size-24 border-[3px] border-background shadow-2xl bg-muted relative overflow-hidden ring-0 z-10">
                <AvatarImage src={avatarImage ?? undefined} alt={staff.name} />
                <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary to-primary/70 text-primary-foreground">
                  {getInitials(staff.name, staff.apellidoPaterno)}
                </AvatarFallback>

                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 backdrop-blur-sm">
                    <IconLoader2 className="size-7 text-white animate-spin" />
                  </div>
                )}
              </Avatar>

              {/* Camera button — hidden for admin global */}
              {!isAdminGlobal && (
                <button
                  disabled={isUploading}
                  onClick={handleImageClick}
                  className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-primary/40 hover:shadow-lg active:scale-95 z-30"
                  title="Cambiar imagen de perfil"
                >
                  {isUploading ? (
                    <IconLoader2 className="size-3 animate-spin" />
                  ) : (
                    <IconCamera className="size-3" />
                  )}
                </button>
              )}

              {/* Delete button — hidden for admin global */}
              {avatarImage && !isUploading && !isAdminGlobal && (
                <button
                  onClick={handleDeleteImage}
                  className="absolute -bottom-1 -left-1 size-7 rounded-full bg-background border border-border/60 text-muted-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:scale-110 active:scale-95 z-30"
                  title="Eliminar imagen de perfil"
                >
                  <IconTrash className="size-3" />
                </button>
              )}

              {/* Status indicator — premium dot with pulse */}
              {!isUploading && (
                <div className="absolute top-0.5 right-0.5 z-30">
                  <span
                    className="relative flex size-3.5"
                    title={`Estado: ${staff.estado?.nombre || "N/A"}`}
                  >
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                      style={{
                        backgroundColor: staff.estado?.color || "#94a3b8",
                      }}
                    />
                    <span
                      className="relative inline-flex rounded-full size-3.5 border-2 border-background shadow-sm"
                      style={{
                        backgroundColor: staff.estado?.color || "#94a3b8",
                      }}
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-14 pb-4 shrink-0">
          <h1 className="text-xl font-bold text-foreground tracking-tight leading-none mb-2 capitalize">
            {staff.name} {staff.apellidoPaterno} {staff.apellidoMaterno}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-xs font-medium"
            >
              {staff.cargo?.nombre || "Sin cargo"}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <IconBuilding className="size-3" /> {staff.area || "General"}
            </span>
          </div>
        </div>

        {/* ── FACEBOOK-STYLE LAYOUT ── */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0">
          {/* Sidebar */}
          <nav className="sm:w-44 shrink-0 border-b sm:border-b-0 sm:border-r border-border/50 px-3 py-2 sm:py-4">
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 mb-2 hidden sm:block">
              Información
            </p>
            <div className="flex sm:flex-col overflow-x-auto sm:overflow-x-visible gap-0.5">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap w-full text-left",
                      activeTab === tab.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 px-4 py-4 overflow-y-auto space-y-1">
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
                  label="Sexo"
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
                  label="Documento de Identidad"
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
                  label="Fecha de Ingreso"
                  value={
                    staff.fechaIngreso ? new Date(staff.fechaIngreso) : null
                  }
                  type="date"
                  placeholder="Seleccionar fecha"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("fechaIngreso", v)}
                />
                <InlineEditableField
                  label="Turno"
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
                  label="Especialidad"
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
                  label="Teléfono"
                  value={staff.telefono}
                  type="text"
                  placeholder="Agregar teléfono"
                  readOnly={isAdminGlobal}
                  onSave={(v) => saveField("telefono", v)}
                />
                <InlineEditableField
                  label="Dirección"
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
                  label="Nombre de Contacto"
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
