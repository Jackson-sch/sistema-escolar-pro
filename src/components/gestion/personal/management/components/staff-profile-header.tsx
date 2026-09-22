"use client";

import {
  IconEdit,
  IconLoader2,
  IconCamera,
  IconTrash,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/formats";

interface StaffProfileHeaderProps {
  staff: any;
  isAdminGlobal: boolean;
  avatarImage?: string | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
  onEditFullForm: () => void;
  statusColor: string;
}

export function StaffProfileHeader({
  staff,
  isAdminGlobal,
  avatarImage,
  isUploading,
  fileInputRef,
  onImageClick,
  onFileChange,
  onDeleteImage,
  onEditFullForm,
  statusColor,
}: StaffProfileHeaderProps) {
  return (
    <div className="relative w-full shrink-0">
      {/* Banner de fondo */}
      <div className="h-28 w-full relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/30" />

      {/* Botón Editar Formulario Completo */}
      {!isAdminGlobal && (
        <div className="absolute top-3.5 right-3.5 z-20">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-3 rounded-xl bg-background/80 hover:bg-background border border-border/40 shadow-xs text-xs font-semibold gap-1.5 transition-[background-color,transform] hover:scale-105 cursor-pointer"
            onClick={onEditFullForm}
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
            onChange={onFileChange}
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
                onClick={onImageClick}
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
                onClick={onDeleteImage}
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
  );
}
