"use client";

import { useState } from "react";
import {
  IconUser,
  IconBriefcase,
  IconCertificate,
  IconPhone,
  IconHeartbeat,
  IconLock,
  IconCamera,
  IconLoader2,
  IconLayoutGrid,
  IconMapPin,
  IconMail,
  IconCalendar,
  IconChevronRight,
  IconWorld,
  IconId,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordDialog } from "./change-password-dialog";
import { InlineEditableField } from "@/components/gestion/personal/management/inline-editable-field";
import { cn } from "@/lib/utils";
import { updateTeacherProfileAction } from "@/actions/portal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getInitials } from "@/lib/formats";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import {
  SEXO_OPTIONS,
  ESTADO_CIVIL_OPTIONS,
  TIPO_CONTRATO_OPTIONS,
  TURNO_OPTIONS,
  ESCALA_MAGISTERIAL_OPTIONS,
} from "@/lib/constants";

// ---------- Types ----------
interface TeacherProfileClientProps {
  profile: any;
}

const TABS = [
  {
    id: "personal",
    label: "Datos Personales",
    icon: IconUser,
    color: "bg-blue-500",
  },
  {
    id: "laboral",
    label: "Datos Laborales",
    icon: IconBriefcase,
    color: "bg-amber-500",
  },
  {
    id: "academico",
    label: "Perfil Académico",
    icon: IconCertificate,
    color: "bg-purple-500",
  },
  {
    id: "contacto",
    label: "Contacto",
    icon: IconPhone,
    color: "bg-emerald-500",
  },
  {
    id: "emergencia",
    label: "Emergencia",
    icon: IconHeartbeat,
    color: "bg-rose-500",
  },
  {
    id: "cursos",
    label: "Mis Cursos",
    icon: IconLayoutGrid,
    color: "bg-indigo-500",
  },
  {
    id: "seguridad",
    label: "Seguridad",
    icon: IconLock,
    color: "bg-slate-500",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------- Main Component ----------
export function TeacherProfileClient({
  profile: initialProfile,
}: TeacherProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const router = useRouter();

  const fullName = [
    profile.name,
    profile.apellidoPaterno,
    profile.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(" ");

  // Avatar Upload Logic
  const {
    image: avatarImage,
    isUploading,
    fileInputRef,
    openFilePicker,
    handleFileChange,
  } = useAvatarUpload({
    initialImage: profile.image,
    onSave: async (imageUrl) => {
      const result = await updateTeacherProfileAction({ image: imageUrl });
      if (result.error) return { error: result.error };

      setProfile((prev: any) => ({ ...prev, image: imageUrl }));
      router.refresh();

      return { success: "Imagen actualizada" };
    },
  });

  // Helper para guardar un campo individual
  const saveField = async (field: string, value: any) => {
    const res = await updateTeacherProfileAction({ [field]: value });
    if (res.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    toast.success("Campo actualizado");
    router.refresh();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in animation-duration-">
      {/* ── BARRA LATERAL (Izquierda) ── */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Card Identidad */}
        <Card className="overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-xl">
          <div className="h-24 bg-linear-to-r from-indigo-600/20 via-primary/10 to-indigo-600/20" />
          <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
            <div className="relative group mb-3">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Avatar className="size-24 border-4 border-card shadow-xl bg-muted relative z-10">
                <AvatarImage
                  src={avatarImage ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-indigo-600 text-white">
                  {getInitials(profile.name, profile.apellidoPaterno)}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 rounded-full">
                    <IconLoader2 className="size-8 text-white animate-spin" />
                  </div>
                )}
              </Avatar>
              {!isUploading && (
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 z-30 size-8 rounded-xl border-2 border-card bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                  onClick={openFilePicker}
                >
                  <IconCamera className="size-4" />
                </Button>
              )}
            </div>

            <h3 className="text-lg font-bold tracking-tight text-foreground capitalize leading-tight mb-1">
              {fullName}
            </h3>
            <Badge
              variant="outline"
              className="rounded-full text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            >
              {profile.especialidad || "DOCENTE DE AULA"}
            </Badge>
          </div>
        </Card>

        {/* Menú Navegación */}
        <Card className="rounded-2xl border border-border/40 bg-card/80 p-2 shadow-sm">
          <div className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold transition-[color,background-color,box-shadow] cursor-pointer",
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:bg-card/80 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && <IconChevronRight className="size-4" />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── CONTENIDO PRINCIPAL (Derecha) ── */}
      <div className="flex-1 min-w-0">
        <Card className="min-h-[600px] overflow-hidden rounded-2xl border border-border/40 bg-card/80 shadow-xl">
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-border/20 pb-4">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl text-white shadow-xs shrink-0",
                  TABS.find((t) => t.id === activeTab)?.color || "bg-indigo-600",
                )}
              >
                {(() => {
                  const Icon =
                    TABS.find((t) => t.id === activeTab)?.icon || IconUser;
                  return <Icon className="size-5" />;
                })()}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  {TABS.find((t) => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Gestión y actualización de información personal del docente.
                </p>
              </div>
            </div>

            <div className="animate-in fade-in animation-duration-">
              {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Fecha de Nacimiento"
                    value={
                      profile.fechaNacimiento
                        ? new Date(profile.fechaNacimiento)
                        : null
                    }
                    type="date"
                    icon={<IconCalendar className="size-4" />}
                    onSave={(v) => saveField("fechaNacimiento", v)}
                  />
                  <InlineEditableField
                    label="Sexo"
                    value={profile.sexo}
                    type="select"
                    options={SEXO_OPTIONS}
                    onSave={(v) => saveField("sexo", v)}
                  />
                  <InlineEditableField
                    label="Estado Civil"
                    value={profile.estadoCivil}
                    type="select"
                    options={ESTADO_CIVIL_OPTIONS}
                    onSave={(v) => saveField("estadoCivil", v)}
                  />
                  <InlineEditableField
                    label="Nacionalidad"
                    value={profile.nacionalidad}
                    icon={<IconWorld className="size-4" />}
                    onSave={(v) => saveField("nacionalidad", v)}
                  />
                  <InlineEditableField
                    label="DNI / Documento"
                    value={profile.dni}
                    icon={<IconId className="size-4" />}
                    readOnly
                    onSave={() => Promise.resolve()}
                  />
                </div>
              )}

              {activeTab === "laboral" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Tipo de Contrato"
                    value={profile.tipoContrato}
                    type="select"
                    options={TIPO_CONTRATO_OPTIONS}
                    onSave={(v) => saveField("tipoContrato", v)}
                  />
                  <InlineEditableField
                    label="Fecha de Contratación"
                    value={
                      profile.fechaContratacion
                        ? new Date(profile.fechaContratacion)
                        : null
                    }
                    type="date"
                    onSave={(v) => saveField("fechaContratacion", v)}
                  />
                  <InlineEditableField
                    label="Fecha de Ingreso"
                    value={
                      profile.fechaIngreso
                        ? new Date(profile.fechaIngreso)
                        : null
                    }
                    type="date"
                    onSave={(v) => saveField("fechaIngreso", v)}
                  />
                  <InlineEditableField
                    label="Turno Asignado"
                    value={profile.turno}
                    type="select"
                    options={TURNO_OPTIONS}
                    onSave={(v) => saveField("turno", v)}
                  />
                </div>
              )}

              {activeTab === "academico" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Especialidad Principal"
                    value={profile.especialidad}
                    onSave={(v) => saveField("especialidad", v)}
                  />
                  <InlineEditableField
                    label="Título Obtenido"
                    value={profile.titulo}
                    onSave={(v) => saveField("titulo", v)}
                  />
                  <InlineEditableField
                    label="N° Colegiatura Profesores"
                    value={profile.colegioProfesor}
                    onSave={(v) => saveField("colegioProfesor", v)}
                  />
                  <InlineEditableField
                    label="Escala Magisterial"
                    value={profile.escalaMagisterial}
                    type="select"
                    options={ESCALA_MAGISTERIAL_OPTIONS}
                    onSave={(v) => saveField("escalaMagisterial", v)}
                  />
                </div>
              )}

              {activeTab === "contacto" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Correo Electrónico"
                    value={profile.email}
                    icon={<IconMail className="size-4" />}
                    readOnly
                    onSave={() => Promise.resolve()}
                  />
                  <InlineEditableField
                    label="Teléfono Móvil"
                    value={profile.telefono}
                    icon={<IconPhone className="size-4" />}
                    onSave={(v) => saveField("telefono", v)}
                  />
                  <InlineEditableField
                    label="Dirección Actual"
                    value={profile.direccion}
                    icon={<IconMapPin className="size-4" />}
                    onSave={(v) => saveField("direccion", v)}
                  />
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Ubigeo Referencial
                    </p>
                    <p className="font-semibold text-xs text-foreground">
                      {`${profile.distrito || ""} - ${profile.provincia || ""}`.trim() ||
                        "No especificado"}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "emergencia" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Nombre Contacto Emergencia"
                    value={profile.contactoEmergencia}
                    onSave={(v) => saveField("contactoEmergencia", v)}
                  />
                  <InlineEditableField
                    label="Teléfono Emergencia"
                    value={profile.telefonoEmergencia}
                    icon={<IconPhone className="size-4" />}
                    onSave={(v) => saveField("telefonoEmergencia", v)}
                  />
                </div>
              )}

              {activeTab === "cursos" && (
                <ScrollArea className="h-[480px] pr-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.cursosImpartidos?.map((curso: any) => (
                      <div
                        key={curso.id}
                        className="group relative rounded-2xl border border-border/40 bg-card/80 p-5 shadow-xs transition-shadow hover:shadow-md"
                      >
                        <div className="flex items-center gap-3.5 mb-3">
                          <div
                            className="flex size-11 items-center justify-center rounded-xl text-white shadow-xs font-bold text-lg shrink-0"
                            style={{
                              backgroundColor:
                                curso.areaCurricular?.color || "#4f46e5",
                            }}
                          >
                            <span>
                              {curso.areaCurricular?.nombre?.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-foreground leading-tight truncate">
                              {curso.nombre}
                            </h4>
                            <Badge
                              variant="outline"
                              className="mt-1 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border-border/40"
                            >
                              {curso.nivelAcademico?.nivel?.nombre}
                            </Badge>
                          </div>
                        </div>
                        <Separator className="bg-border/20 mb-3" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {curso.nivelAcademico?.grado?.nombre} • SECCIÓN{" "}
                          &quot;{curso.nivelAcademico?.seccion}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {activeTab === "seguridad" && (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="size-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-xs">
                    <IconLock className="size-8" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <h3 className="text-lg font-bold text-foreground">
                      Seguridad de la Cuenta
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Actualiza tu contraseña regularmente para mantener la seguridad de tus accesos al portal.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowPasswordDialog(true)}
                    className="rounded-xl h-10 px-5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
                  >
                    <IconLock className="size-4" />
                    <span>Actualizar Contraseña</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  );
}
