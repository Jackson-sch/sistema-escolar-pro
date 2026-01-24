"use client";

import { useState, useEffect } from "react";
import {
  IconTrophy,
  IconPlus,
  IconCalendar,
  IconBookmark,
  IconTrash,
  IconAward,
  IconStar,
  IconBalloon,
  IconArtboard,
  IconDotsVertical,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { AchievementForm } from "@/components/gestion/estudiantes/features/logros/achievement-form";
import {
  getStudentAchievementsAction,
  deleteAchievementAction,
} from "@/actions/achievement";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCurrentRole } from "@/hooks/use-current-role";

interface AchievementsTabProps {
  studentId: string;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; bg: string }
> = {
  ACADEMICO: {
    label: "Académico",
    icon: IconAward,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  DEPORTIVO: {
    label: "Deportivo",
    icon: IconTrophy,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  CULTURAL: {
    label: "Cultural",
    icon: IconArtboard,
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  VALORES: {
    label: "Valores",
    icon: IconStar,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  OTROS: {
    label: "Otros",
    icon: IconBookmark,
    color: "text-slate-500",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
};

export function AchievementsTab({ studentId }: AchievementsTabProps) {
  const role = useCurrentRole();
  const isProfessor = role === "profesor" || role === "administrativo";

  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAchievements = async () => {
    try {
      const res = await getStudentAchievementsAction(studentId);
      if (res.data) setAchievements(res.data);
    } catch (error) {
      toast.error("Error al cargar logros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [studentId]);

  const onDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteAchievementAction(deletingId);
      if (res.success) {
        toast.success(res.success);
        setAchievements((prev) => prev.filter((a) => a.id !== deletingId));
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="animate-spin size-8 text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            Logros y Reconocimientos
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Historial de éxitos, premios y menciones destacadas.
          </p>
        </div>
        {isProfessor && (
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="rounded-full w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
          >
            <IconPlus className="mr-2 h-4 w-4" /> Registrar Logro
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {achievements.length > 0 ? (
          achievements.map((logro) => {
            const config =
              CATEGORY_CONFIG[logro.categoria] || CATEGORY_CONFIG.OTROS;
            const Icon = config.icon;

            return (
              <div
                key={logro.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
                  "bg-background/40 backdrop-blur-sm border-border/40 hover:border-amber-500/20 hover:shadow-xl hover:shadow-amber-500/5",
                )}
              >
                {/* Glow efecto en hover */}
                <div className="absolute top-0 right-0 size-24 bg-amber-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "size-12 shrink-0 rounded-xl flex items-center justify-center border",
                      config.bg,
                    )}
                  >
                    <Icon className={cn("size-6", config.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "mb-2 text-[9px] font-black uppercase tracking-widest",
                            config.bg,
                            config.color,
                          )}
                        >
                          {config.label}
                        </Badge>
                        <h4 className="font-bold text-sm md:text-base tracking-tight text-foreground truncate">
                          {logro.titulo}
                        </h4>
                      </div>

                      {isProfessor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-muted-foreground hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-all"
                          onClick={() => setDeletingId(logro.id)}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconCalendar className="size-3.5 text-blue-400" />
                        <span className="font-medium">
                          {format(new Date(logro.fecha), "dd 'de' MMMM, yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      {logro.institucion && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <IconAward className="size-3.5 text-emerald-400" />
                          <span className="truncate">{logro.institucion}</span>
                        </div>
                      )}
                    </div>

                    {logro.descripcion && (
                      <p className="mt-3 text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">
                        "{logro.descripcion}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
            <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <IconTrophy className="size-8 text-amber-500/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">
              Sin logros registrados
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px] text-center">
              Aún no se han registrado reconocimientos para este estudiante.
            </p>
          </div>
        )}
      </div>

      <FormModal
        title="Registrar Nuevo Logro"
        description="Añada un nuevo reconocimiento al expediente del estudiante."
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        className="sm:max-w-xl"
      >
        <AchievementForm
          studentId={studentId}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAchievements();
          }}
        />
      </FormModal>

      <ConfirmModal
        title="Eliminar Logro"
        description="¿Está seguro de eliminar este registro? Esta acción no se puede deshacer."
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={onDelete}
        loading={isDeleting}
      />
    </div>
  );
}

function IconLoader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
    </svg>
  );
}
