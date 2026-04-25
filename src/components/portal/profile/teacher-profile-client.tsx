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
  { id: "personal", label: "Datos Personales", icon: IconUser, color: "bg-blue-500" },
  { id: "laboral", label: "Datos Laborales", icon: IconBriefcase, color: "bg-amber-500" },
  { id: "academico", label: "Perfil Académico", icon: IconCertificate, color: "bg-purple-500" },
  { id: "contacto", label: "Contacto", icon: IconPhone, color: "bg-emerald-500" },
  { id: "emergencia", label: "Emergencia", icon: IconHeartbeat, color: "bg-rose-500" },
  { id: "cursos", label: "Mis Cursos", icon: IconLayoutGrid, color: "bg-indigo-500" },
  { id: "seguridad", label: "Seguridad", icon: IconLock, color: "bg-slate-500" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------- Main Component ----------
export function TeacherProfileClient({ profile: initialProfile }: TeacherProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<TabId>("personal");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const router = useRouter();

  const fullName = [profile.name, profile.apellidoPaterno, profile.apellidoMaterno]
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
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── BARRA LATERAL (Izquierda) ── */}
      <div className="w-full lg:w-80 shrink-0 space-y-6">
        {/* Card Identidad */}
        <Card className="overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-xl liquid-glass rounded-[2rem] p-0">
          <div className="h-32 bg-linear-to-br from-primary/40 via-primary/20 to-transparent" />
          <div className="px-6 pb-10 -mt-16 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="absolute -inset-1.5 rounded-full bg-linear-to-tr from-primary via-primary/40 to-transparent blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
              <Avatar className="size-32 border-4 border-background shadow-2xl bg-muted relative z-10 transition-transform group-hover:scale-[1.02]">
                <AvatarImage src={avatarImage ?? undefined} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                  {getInitials(profile.name, profile.apellidoPaterno)}
                </AvatarFallback>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 rounded-full">
                    <IconLoader2 className="size-10 text-white animate-spin" />
                  </div>
                )}
              </Avatar>
              {!isUploading && (
                <Button 
                  size="icon" 
                  className="absolute bottom-1 right-1 z-30 rounded-full size-10 shadow-xl border-2 border-background hover:scale-110 active:scale-95 transition-all"
                  onClick={openFilePicker}
                >
                  <IconCamera size={18} />
                </Button>
              )}
            </div>
            
            <h3 className="text-2xl font-black tracking-tight leading-tight mb-2 capitalize">{fullName}</h3>
            <Badge variant="secondary" className="rounded-full text-[10px] font-black uppercase tracking-widest px-4 py-1 bg-primary/10 text-primary border-primary/20">
              {profile.especialidad || "DOCENTE"}
            </Badge>
          </div>
        </Card>

        {/* Menú Navegación */}
        <Card className="border-none shadow-xl bg-card/40 backdrop-blur-xl liquid-glass rounded-[2rem] p-3">
          <div className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-between gap-3 px-5 py-4 rounded-2xl text-[13px] font-black uppercase tracking-tighter transition-all w-full text-left group",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} strokeWidth={2.5} className={cn(
                      "transition-colors",
                      activeTab === tab.id ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{tab.label}</span>
                  </div>
                  {activeTab === tab.id && <IconChevronRight size={18} />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── CONTENIDO PRINCIPAL (Derecha) ── */}
      <div className="flex-1 min-w-0">
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl liquid-glass rounded-[2.5rem] min-h-[700px] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-6 mb-12">
              <div className={cn(
                "size-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transform -rotate-3",
                TABS.find(t => t.id === activeTab)?.color || "bg-primary"
              )}>
                {(() => {
                  const Icon = TABS.find(t => t.id === activeTab)?.icon || IconUser;
                  return <Icon size={32} strokeWidth={2.5} />;
                })()}
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <div className="h-1 w-20 bg-primary/40 rounded-full" />
              </div>
            </div>

            <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeTab === "personal" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InlineEditableField
                    label="Fecha de Nacimiento"
                    value={profile.fechaNacimiento ? new Date(profile.fechaNacimiento) : null}
                    type="date"
                    icon={<IconCalendar size={18} />}
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
                    icon={<IconWorld size={18} />}
                    onSave={(v) => saveField("nacionalidad", v)}
                  />
                  <InlineEditableField
                    label="DNI / Documento"
                    value={profile.dni}
                    icon={<IconId size={18} />}
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
                    value={profile.fechaContratacion ? new Date(profile.fechaContratacion) : null}
                    type="date"
                    onSave={(v) => saveField("fechaContratacion", v)}
                  />
                  <InlineEditableField
                    label="Fecha de Ingreso"
                    value={profile.fechaIngreso ? new Date(profile.fechaIngreso) : null}
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
                    icon={<IconMail size={18} />}
                    readOnly
                    onSave={() => Promise.resolve()}
                  />
                  <InlineEditableField
                    label="Teléfono Móvil"
                    value={profile.telefono}
                    icon={<IconPhone size={18} />}
                    onSave={(v) => saveField("telefono", v)}
                  />
                  <InlineEditableField
                    label="Dirección Actual"
                    value={profile.direccion}
                    icon={<IconMapPin size={18} />}
                    onSave={(v) => saveField("direccion", v)}
                  />
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/40">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Ubigeo (Referencial)</p>
                    <p className="font-bold text-sm">{`${profile.distrito || ""} - ${profile.provincia || ""}`.trim() || "No especificado"}</p>
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
                    icon={<IconPhone size={18} />}
                    onSave={(v) => saveField("telefonoEmergencia", v)}
                  />
                </div>
              )}

              {activeTab === "cursos" && (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.cursosImpartidos?.map((curso: any) => (
                      <div
                        key={curso.id}
                        className="group relative p-8 rounded-[2.5rem] bg-card/20 border border-border/40 hover:bg-card/40 transition-all hover:scale-[1.02] hover:shadow-2xl"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className="size-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform"
                            style={{ backgroundColor: curso.areaCurricular?.color || "#94a3b8" }}
                          >
                            <span className="text-2xl font-black">{curso.areaCurricular?.nombre?.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-black text-lg leading-tight">{curso.nombre}</h4>
                            <Badge variant="outline" className="mt-1 text-[9px] uppercase font-black tracking-widest bg-background/50">
                              {curso.nivelAcademico?.nivel?.nombre}
                            </Badge>
                          </div>
                        </div>
                        <Separator className="bg-border/20 mb-4" />
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
                          {curso.nivelAcademico?.grado?.nombre} - SECCIÓN {curso.nivelAcademico?.seccion}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {activeTab === "seguridad" && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="size-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center mb-8 shadow-inner">
                    <IconLock size={48} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Seguridad de la Cuenta</h3>
                  <p className="text-muted-foreground text-sm font-bold max-w-xs mb-10 opacity-70">
                    Cambia tu contraseña periódicamente para mantener tu cuenta segura.
                  </p>
                  <Button
                    className="rounded-2xl font-black px-10 py-7 h-auto shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all text-lg gap-3"
                    onClick={() => setShowPasswordDialog(true)}
                  >
                    <IconLock size={20} />
                    Actualizar Contraseña
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <ChangePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </div>
  );
}
