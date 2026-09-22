"use client";

import {
  IconCamera,
  IconLoader2,
  IconLock,
  IconChevronRight,
  IconSchool,
  IconId,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/formats";
import { TEACHER_PROFILE_TABS, TeacherTabId } from "./teacher-types";

interface TeacherProfileSidebarProps {
  profile: any;
  avatarImage: string | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeTab: TeacherTabId;
  setActiveTab: (tab: TeacherTabId) => void;
  onOpenPasswordDialog: () => void;
}

export function TeacherProfileSidebar({
  profile,
  avatarImage,
  isUploading,
  fileInputRef,
  openFilePicker,
  handleFileChange,
  activeTab,
  setActiveTab,
  onOpenPasswordDialog,
}: TeacherProfileSidebarProps) {
  const fullName = [
    profile.name,
    profile.apellidoPaterno,
    profile.apellidoMaterno,
  ]
    .filter(Boolean)
    .join(" ");

  const totalCursos = profile.cursosImpartidos?.length || 0;

  return (
    <div className="w-full lg:w-80 shrink-0 space-y-4">
      {/* ── CARD DE IDENTIDAD ── */}
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-xl backdrop-blur-md p-0">
        <div className="h-24 bg-linear-to-r from-indigo-900/40 via-violet-800/30 to-slate-900/50 relative">
          <div className="absolute inset-0 from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
          {/* Avatar con botón de cámara */}
          <div className="relative group mb-3.5">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Avatar className="size-24 border-4 border-card shadow-2xl bg-muted relative z-10">
              <AvatarImage
                src={avatarImage ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                {getInitials(profile.name, profile.apellidoPaterno)}
              </AvatarFallback>
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-20 rounded-full">
                  <IconLoader2 className="size-8 text-white animate-spin" />
                </div>
              )}
            </Avatar>
            {!isUploading && (
              <Button
                size="icon"
                aria-label="Cambiar foto de perfil"
                title="Actualizar foto de perfil"
                className="absolute bottom-0 right-0 z-30 size-8.5 rounded-full border-2 border-card bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
                onClick={openFilePicker}
              >
                <IconCamera className="size-4" />
              </Button>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground capitalize leading-snug">
            {fullName || "Docente"}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
            <Badge
              variant="outline"
              className="rounded-full text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
            >
              {profile.especialidad || "DOCENTE TITULAR"}
            </Badge>
          </div>

          {/* Micro-resumen */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 w-full pt-3.5 border-t border-border/40 text-left">
            <div className="p-2 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <IconSchool size={12} className="text-indigo-500" />
                Cursos
              </span>
              <span className="text-xs font-black text-foreground block mt-0.5">
                {totalCursos} Asignaturas
              </span>
            </div>
            <div className="p-2 rounded-2xl bg-muted/30 border border-border/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <IconId size={12} className="text-emerald-500" />
                DNI
              </span>
              <span className="text-xs font-mono font-bold text-foreground block mt-0.5">
                {profile.dni || "—"}
              </span>
            </div>
          </div>

          <Separator className="my-3.5 bg-border/40" />

          {/* Botón Cambiar Contraseña directo */}
          <Button
            variant="outline"
            onClick={onOpenPasswordDialog}
            className="w-full rounded-2xl h-9.5 text-xs font-bold border-border/60 hover:bg-muted text-foreground/80 hover:text-foreground gap-2 cursor-pointer shadow-xs"
          >
            <IconLock className="size-4 text-amber-500" />
            <span>Seguridad & Contraseña</span>
          </Button>
        </div>
      </Card>

      {/* ── NAVEGACIÓN EN 3 PESTAÑAS ── */}
      <Card className="rounded-3xl border border-border/60 bg-card/90 p-2 shadow-sm backdrop-blur-md">
        <div className="space-y-1">
          {TEACHER_PROFILE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-semibold",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-8 rounded-xl flex items-center justify-center shrink-0 border",
                      isActive
                        ? "bg-white/20 border-white/30 text-white"
                        : "bg-muted/60 border-border/40 text-muted-foreground",
                    )}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs block truncate leading-tight">
                      {tab.label}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] block truncate mt-0.5",
                        isActive ? "text-white/80" : "text-muted-foreground/70",
                      )}
                    >
                      {tab.id === "cursos"
                        ? `${totalCursos} aulas a cargo`
                        : tab.id === "profesional"
                          ? "Filiación, contrato y títulos"
                          : "Teléfono, dirección y auxilio"}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <IconChevronRight size={16} className="shrink-0 text-white" />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
