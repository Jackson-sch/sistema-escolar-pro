"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StaffTableType } from "@/components/gestion/personal/components/columns";
import { useState } from "react";
import { updateStaffAction } from "@/actions/staff";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { toast } from "sonner";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

import { StaffProfileHeader } from "./components/staff-profile-header";
import { StaffProfileSummary } from "./components/staff-profile-summary";
import { StaffProfileTabs } from "./components/staff-profile-tabs";
import {
  STAFF_TABS,
  type StaffTabId,
} from "./components/staff-profile-tabs.constants";

interface StaffProfileProps {
  staff: StaffTableType;
  showViewSheet: boolean;
  setShowViewSheet: (value: boolean) => void;
  setShowEditDialog: (value: boolean) => void;
}

export default function StaffProfile({
  staff: initialStaff,
  showViewSheet,
  setShowViewSheet,
  setShowEditDialog,
}: StaffProfileProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [activeTab, setActiveTab] = useState<StaffTabId>("personal");
  const { copy } = useCopyToClipboard();

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

  // Guardar campo individual
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
    const fullPhone =
      cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Estimado(a) ${staff.name}, le saludamos de la dirección de la institución educativa.`,
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  // Filtrar pestañas: ocultar "academico" si no es docente
  const visibleTabs = STAFF_TABS.filter(
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

        {/* HEADER DESIGN */}
        <StaffProfileHeader
          staff={staff}
          isAdminGlobal={isAdminGlobal}
          avatarImage={avatarImage}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onImageClick={handleImageClick}
          onFileChange={handleFileChange}
          onDeleteImage={handleDeleteImage}
          onEditFullForm={() => setShowEditDialog(true)}
          statusColor={statusColor}
        />

        {/* Título y Datos Rápidos de Cabecera */}
        <StaffProfileSummary
          staff={staff}
          onCopyText={handleCopyText}
          onOpenWhatsapp={handleOpenWhatsapp}
        />

        {/* NAVEGACIÓN Y EDICIÓN INLINE */}
        <StaffProfileTabs
          staff={staff}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          visibleTabs={visibleTabs as any}
          isAdminGlobal={isAdminGlobal}
          onSaveField={saveField}
        />
      </SheetContent>
    </Sheet>
  );
}

export type { StaffProfileProps };
