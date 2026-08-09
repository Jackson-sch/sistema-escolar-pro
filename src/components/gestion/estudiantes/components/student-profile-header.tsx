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
  IconBrandWhatsapp,
  IconSchool,
} from "@tabler/icons-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { updateStudentAction } from "@/actions/students";
import { useAvatarUpload } from "@/hooks/use-avatar-upload";
import { Button } from "@/components/ui/button";

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

  // Apoderado principal para contacto directo
  const primaryGuardian = useMemo(() => {
    const list = (initialStudent as any).padresTutores || [];
    return (
      list.find((p: any) => p.contactoPrimario)?.padreTutor ||
      list[0]?.padreTutor ||
      null
    );
  }, [initialStudent]);

  // Memoizar valores calculados
  const initials = useMemo(() => {
    return `${initialStudent.name?.[0] || ""}${initialStudent.apellidoPaterno?.[0] || ""}`;
  }, [initialStudent.name, initialStudent.apellidoPaterno]);

  const fullName = useMemo(() => {
    return `${initialStudent.name} ${initialStudent.apellidoPaterno} ${initialStudent.apellidoMaterno}`;
  }, [initialStudent.name, initialStudent.apellidoPaterno, initialStudent.apellidoMaterno]);

  // Color del estado con fallback seguro
  const statusColor = initialStudent.estado?.color || "#6366F1";

  const handleCopyDni = () => {
    copy(initialStudent.dni || "", "DNI copiado al portapapeles");
  };

  const handleOpenWhatsapp = () => {
    if (!primaryGuardian?.telefono) return;
    const cleanPhone = primaryGuardian.telefono.replace(/\D/g, "");
    const fullPhone = cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Estimado(a) ${primaryGuardian.name || "Apoderado"}, le saludamos de la institución educativa con relación al alumno(a) ${fullName}.`
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="relative pt-6 md:pt-8 px-4 md:px-6 overflow-hidden pb-4 bg-background/50 border-b border-border/30">
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
        className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent z-0"
        aria-hidden="true"
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center text-center gap-3">
        {/* Avatar con indicador de estado */}
        <div className="relative group">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="relative p-1 rounded-full bg-indigo-500/10 shadow-lg overflow-visible">
            <Avatar className="size-16 md:size-20 border-2 border-background shadow-inner relative overflow-hidden">
              <AvatarImage src={studentImage ?? undefined} className="object-cover" />
              <AvatarFallback className="text-xl md:text-2xl font-bold bg-indigo-600 text-white uppercase">
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
              className="absolute -bottom-1 -right-1 size-7 rounded-full bg-indigo-600 text-white border-2 border-background shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30 cursor-pointer"
              title="Cambiar foto de perfil"
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
                className="absolute -bottom-1 -left-1 size-7 rounded-full bg-rose-500 text-white border-2 border-background shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-30 cursor-pointer"
                title="Eliminar foto"
              >
                <IconTrash className="size-3.5" />
              </button>
            )}

            {/* Indicador de estado */}
            <div
              className="absolute top-0 right-0 size-3.5 rounded-full border-2 border-background shadow-xs z-30"
              style={{ backgroundColor: statusColor }}
            />
          </div>
        </div>

        {/* Nombre del estudiante */}
        <div className="space-y-1">
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground capitalize drop-shadow-xs line-clamp-1">
            {fullName}
          </h1>

          {/* Grado / Sección Subtítulo */}
          {initialStudent.nivelAcademico && (
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5">
              <IconSchool className="size-3.5" />
              {initialStudent.nivelAcademico.grado.nombre} &quot;{initialStudent.nivelAcademico.seccion}&quot; · {initialStudent.nivelAcademico.nivel?.nombre || "General"}
            </p>
          )}
        </div>

        {/* Badges interactivos y Contacto */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
          {/* Badge DNI copiable */}
          <Badge
            variant="secondary"
            onClick={handleCopyDni}
            className={cn(
              "group cursor-pointer pl-2 pr-3 h-7 gap-1.5 transition-[border-color] duration-200 border border-border/40 hover:border-indigo-500/30 rounded-xl",
            )}
            title="Haga clic para copiar DNI"
          >
            <div className="p-0.5 bg-background rounded-md group-hover:text-indigo-600 transition-colors">
              {copied ? (
                <IconCheck className="size-3 text-emerald-500" />
              ) : (
                <IconCopy className="size-3 text-muted-foreground" />
              )}
            </div>
            <span className="text-xs font-mono font-semibold text-muted-foreground group-hover:text-foreground">
              DNI: {initialStudent.dni || "S/N"}
            </span>
          </Badge>

          {/* Badge de Estado */}
          {initialStudent.estado && (
            <Badge
              variant="outline"
              className="h-7 px-3 border shadow-none rounded-xl text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: `${statusColor}40`,
                backgroundColor: `${statusColor}10`,
                color: statusColor,
              }}
            >
              <span className="size-1.5 rounded-full mr-1.5" style={{ backgroundColor: statusColor }} />
              {initialStudent.estado.nombre}
            </Badge>
          )}

          {/* Botón WhatsApp Directo */}
          {primaryGuardian?.telefono && (
            <Button
              size="sm"
              type="button"
              onClick={handleOpenWhatsapp}
              className="h-7 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs transition-[background-color,transform] hover:scale-105 cursor-pointer"
              title={`Enviar WhatsApp a ${primaryGuardian.name || "Apoderado"} (${primaryGuardian.telefono})`}
            >
              <IconBrandWhatsapp className="size-3.5" />
              <span>WhatsApp</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
