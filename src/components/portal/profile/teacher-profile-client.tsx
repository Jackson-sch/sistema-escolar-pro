"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChangePasswordDialog } from "./change-password-dialog";
import { updateTeacherProfileAction } from "@/actions/portal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { cn } from "@/lib/utils";
import { TEACHER_PROFILE_TABS, TeacherTabId } from "./teacher/teacher-types";
import { TeacherProfileSidebar } from "./teacher/teacher-profile-sidebar";
import { TeacherTabProfesional } from "./teacher/teacher-tab-profesional";
import { TeacherTabContacto } from "./teacher/teacher-tab-contacto";
import { TeacherTabCursos } from "./teacher/teacher-tab-cursos";

interface TeacherProfileClientProps {
  profile: any;
}

export function TeacherProfileClient({
  profile: initialProfile,
}: TeacherProfileClientProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<TeacherTabId>("profesional");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const router = useRouter();

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

      return { success: "Imagen de perfil actualizada" };
    },
  });

  // Guardar campo individual
  const saveField = async (field: string, value: any) => {
    const res = await updateTeacherProfileAction({ [field]: value });
    if (res.error) {
      toast.error(res.error);
      throw new Error(res.error);
    }
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    toast.success("Información actualizada");
    router.refresh();
  };

  const currentTabConfig =
    TEACHER_PROFILE_TABS.find((t) => t.id === activeTab) ||
    TEACHER_PROFILE_TABS[0];
  const CurrentTabIcon = currentTabConfig.icon;

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full animate-in fade-in duration-300">
      {/* ── BARRA LATERAL (Izquierda) ── */}
      <TeacherProfileSidebar
        profile={profile}
        avatarImage={avatarImage}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        openFilePicker={openFilePicker}
        handleFileChange={handleFileChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPasswordDialog={() => setShowPasswordDialog(true)}
      />

      {/* ── CONTENIDO PRINCIPAL (Derecha) ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Cabecera del Panel Activo */}
        <Card className="rounded-3xl border border-border/60 bg-card/90 shadow-xs backdrop-blur-md p-5 md:p-6">
          <div className="flex items-center gap-3.5 border-b border-border/30 pb-4 mb-6">
            <div
              className={cn(
                "size-11 rounded-2xl flex items-center justify-center text-white shadow-xs shrink-0",
                activeTab === "profesional"
                  ? "bg-indigo-600"
                  : activeTab === "contacto"
                    ? "bg-emerald-600"
                    : "bg-amber-600",
              )}
            >
              <CurrentTabIcon size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                {currentTabConfig.label}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentTabConfig.description}
              </p>
            </div>
          </div>

          {/* Vistas según pestaña */}
          <div className="transition-all duration-200">
            {activeTab === "profesional" && (
              <TeacherTabProfesional
                profile={profile}
                saveField={saveField}
              />
            )}
            {activeTab === "contacto" && (
              <TeacherTabContacto
                profile={profile}
                saveField={saveField}
              />
            )}
            {activeTab === "cursos" && (
              <TeacherTabCursos cursos={profile.cursosImpartidos} />
            )}
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
