import { useCallback } from "react"

export const translations = {
  es: {
    "imageUpload.uploading": "Subiendo...",
    "imageUpload.uploadImage": "Subir Imagen",
    "imageUpload.maxSize": "PNG, JPG, WEBP (Máx. 4MB)",
    "imageUpload.success": "Imagen subida correctamente",
    "imageUpload.error": "Error al subir la imagen",
    "imageUpload.invalidType": "El archivo debe ser una imagen",
    "imageUpload.failed": "No se pudo subir la imagen",
    "imageUpload.preview": "Vista previa",
  },
  en: {
    "imageUpload.uploading": "Uploading...",
    "imageUpload.uploadImage": "Upload Image",
    "imageUpload.maxSize": "PNG, JPG, WEBP (Max. 4MB)",
    "imageUpload.success": "Image uploaded successfully",
    "imageUpload.error": "Error uploading image",
    "imageUpload.invalidType": "The file must be an image",
    "imageUpload.failed": "Could not upload image",
    "imageUpload.preview": "Preview",
  }
} as const

export type TranslationKey = keyof typeof translations.es

export function useTranslation() {
  // Currently Spanish is the default language of the application
  const locale = "es"

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale]?.[key] || key
  }, [locale])

  return { t, locale }
}
