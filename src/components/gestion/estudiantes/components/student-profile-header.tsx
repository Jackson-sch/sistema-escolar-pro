"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import {
  IconCopy,
  IconCheck,
  IconCamera,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { updateStudentAction } from "@/actions/students";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";

interface StudentProfileHeaderProps {
  student: StudentTableType;
}

export function StudentProfileHeader({
  student: initialStudent,
}: StudentProfileHeaderProps) {
  const { copied, copy } = useCopyToClipboard();

  const {
    image: studentImage,
    isUploading,
    fileInputRef,
    openFilePicker: handleImageClick,
    handleFileChange,
    handleDelete: handleDeleteImage,
  } = useAvatarUpload({
    initialImage: initialStudent.image,
    onSave: async (imageUrl) => {
      const result = await updateStudentAction(initialStudent.id, {
        image: imageUrl,
      });
      return result;
    },
  });


  // Memoizar valores calculados para evitar recálculos innecesarios
  const initials = useMemo(() => {
    return `${initialStudent.name?.[0] || ""}${initialStudent.apellidoPaterno?.[0] || ""}`;
  }, [initialStudent.name, initialStudent.apellidoPaterno]);

  const fullName = useMemo(() => {
    return `${initialStudent.name} ${initialStudent.apellidoPaterno} ${initialStudent.apellidoMaterno}`;
  }, [initialStudent.name, initialStudent.apellidoPaterno, initialStudent.apellidoMaterno]);

  // Color del estado con fallback seguro
  const statusColor = initialStudent.estado?.color || "#6b7280";

  const handleCopyDni = () => {
    copy(initialStudent.dni || "", "DNI copiado al portapapeles");
  };

  return (
    <div className="relative pt-8 md:pt-12 px-4 md:px-6 overflow-hidden pb-2 bg-background/50">
      {/* Decoración de fondo */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        aria-hidden="true"
      />

      {/* Gradientes ambientales */}
      <div
        className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent z-0"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 -right-24 size-64 bg-primary/10 blur-[100px] rounded-full z-0"
        aria-hidden="true"
      />
      <div
        className="absolute -top-24 -left-24 size-64 bg-primary/10 blur-[100px] rounded-full z-0"
        aria-hidden="true"
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Avatar con indicador de estado */}
        <div className="relative mb-1 group">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            className="absolute inset-0 blur-2xl rounded-full opacity-40 transition-opacity group-hover:opacity-60"
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />

          <div className="relative p-1 rounded-full bg-primary/80 backdrop-blur-sm shadow-xl overflow-visible">
            <Avatar className="size-16 md:size-20 border-2 border-background shadow-inner relative overflow-hidden">
              <AvatarImage src={studentImage ?? undefined} className="object-cover" />
              <AvatarFallback className="text-2xl md:text-3xl font-black bg-linear-to-br from-primary to-primary/50 text-white uppercase">
                {initials}
              </AvatarFallback>

              {/* Overlay de carga */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-[2px]">
                  <IconLoader2 className="size-6 text-white animate-spin" />
                </div>
              )}
            </Avatar>

            {/* Botón de Cámara */}
            <button
              disabled={isUploading}
              onClick={handleImageClick}
              className="absolute -bottom-1 -right-1 size-7 rounded-full bg-primary text-primary-foreground border-2 border-background shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
              title="Cambiar imagen"
            >
              {isUploading ? (
                <IconLoader2 className="size-3 animate-spin" />
              ) : (
                <IconCamera className="size-3.5" />
              )}
            </button>

            {/* Botón de Borrar */}
            {studentImage && !isUploading && (
              <button
                onClick={handleDeleteImage}
                className="absolute -bottom-1 -left-1 size-7 rounded-full bg-red-500 text-white border-2 border-background shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
                title="Eliminar imagen"
              >
                <IconTrash className="size-3.5" />
              </button>
            )}

            {/* Indicador circular de estado (Movido arriba si hay botones) */}
            <div
              className="absolute top-0 right-0 size-3.5 rounded-full border-2 border-background shadow-sm z-30"
              style={{ backgroundColor: statusColor }}
              aria-label={`Estado: ${initialStudent.estado?.nombre || "Desconocido"}`}
              role="status"
            />
          </div>
        </div>

        {/* Nombre del estudiante */}
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground capitalize drop-shadow-sm line-clamp-2 md:line-clamp-none">
          {fullName}
        </h1>

        {/* Badges interactivos */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {/* Badge DNI copiable */}
          <Badge
            variant="secondary"
            onClick={handleCopyDni}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCopyDni();
              }
            }}
            className={cn(
              "group cursor-pointer pl-2 pr-3 h-7 gap-1.5 transition-all duration-300",
              "bg-muted/50 hover:bg-muted border-border/40 hover:border-violet-500/30 backdrop-blur-md",
              "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
            )}
            role="button"
            tabIndex={0}
            aria-label={`Copiar DNI: ${initialStudent.dni || "S/N"}`}
            aria-pressed={copied}
          >
            <div className="p-1 bg-background rounded-full shadow-xs group-hover:text-violet-600 transition-colors">
              {copied ? (
                <IconCheck size={10} stroke={3} aria-label="Copiado" />
              ) : (
                <IconCopy size={10} />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
              {initialStudent.dni || "S/N"}
            </span>
          </Badge>

          {/* Badge de estado */}
          {initialStudent.estado && (
            <Badge
              variant="outline"
              className="h-7 px-3 border shadow-none backdrop-blur-md transition-all hover:brightness-105"
              style={{
                borderColor: `${statusColor}40`,
                backgroundColor: `${statusColor}10`,
                color: statusColor,
              }}
              role="badge"
              aria-label={`Estado: ${initialStudent.estado.nombre}`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: statusColor }}
                  aria-hidden="true"
                />
                {initialStudent.estado.nombre}
              </span>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
