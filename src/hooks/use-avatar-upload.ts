"use client";

import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface UseAvatarUploadOptions {
  /** Server action to persist the image URL. Receives the entity ID and image URL (or null for delete). */
  onSave: (imageUrl: string | null) => Promise<{ error?: string; success?: string }>;
  /** Initial image URL */
  initialImage?: string | null;
  /** Max file size in bytes (default: 4MB) */
  maxSize?: number;
}

export function useAvatarUpload({
  onSave,
  initialImage = null,
  maxSize = 4 * 1024 * 1024,
}: UseAvatarUploadOptions) {
  const [image, setImage] = useState<string | null>(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecciona una imagen válida");
        return;
      }

      if (file.size > maxSize) {
        const sizeMB = Math.round(maxSize / (1024 * 1024));
        toast.error(`La imagen es demasiado grande (máximo ${sizeMB}MB)`);
        return;
      }

      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`Error de subida (${response.status})`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        const uploadUrl = data.url;

        const result = await onSave(uploadUrl);
        if (result.error) throw new Error(result.error);

        setImage(uploadUrl);
        toast.success("Imagen de perfil actualizada");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Error al subir la imagen");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [maxSize, onSave],
  );

  const handleDelete = useCallback(async () => {
    try {
      setIsUploading(true);
      const result = await onSave(null);
      if (result.error) throw new Error(result.error);

      setImage(null);
      toast.success("Imagen de perfil eliminada");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Error al eliminar la imagen");
    } finally {
      setIsUploading(false);
    }
  }, [onSave]);

  return {
    image,
    setImage,
    isUploading,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    handleDelete,
  };
}
