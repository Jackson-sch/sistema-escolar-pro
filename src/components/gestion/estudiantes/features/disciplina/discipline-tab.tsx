"use client";

import { useState, useEffect } from "react";
import {
  IconMessageReport,
  IconPlus,
  IconCalendar,
  IconTrash,
  IconEdit,
  IconStethoscope,
  IconDots,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { PsychopedagogicalForm } from "@/components/gestion/estudiantes/features/psicopedagogico/psychopedagogical-form";
import {
  getStudentPsychHistoryAction,
  deletePsychopedagogicalAction,
} from "@/actions/discipline";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DisciplineTabProps {
  studentId: string;
}

export function DisciplineTab({ studentId }: DisciplineTabProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    const res = await getStudentPsychHistoryAction(studentId);
    if (res.data) setHistory(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [studentId]);

  const onDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deletePsychopedagogicalAction(deletingId);
      if (res.success) {
        toast.success(res.success);
        setDeletingId(null);
        loadHistory();
      } else {
        toast.error(res.error);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            Registro Psicopedagógico
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            Seguimiento de conducta y bienestar emocional.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="rounded-full"
        >
          <IconPlus className="mr-2 h-4 w-4" /> Nuevo Registro
        </Button>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border/40 before:to-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <IconLoader2 className="animate-spin size-8 text-muted-foreground/40" />
          </div>
        ) : history.length > 0 ? (
          history.map((item) => (
            <div
              key={item.id}
              className="relative flex items-start gap-6 group"
            >
              {/* Timeline Indicator */}
              <div className="relative flex items-center justify-center shrink-0 w-10">
                <div className="size-10 rounded-xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground group-hover:border-emerald-500/40 group-hover:bg-emerald-500/5 transition-all shadow-xl shadow-black/5">
                  <IconAlertCircle className="size-5" />
                </div>
              </div>

              {/* Card */}
              <div className="flex-1 bg-background/40 backdrop-blur-sm border border-border/40 rounded-2xl p-5 hover:border-emerald-500/20 transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 h-5 shadow-none"
                    >
                      {item.categoria.nombre}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                      <IconCalendar className="size-3" />
                      {new Date(item.fecha).toLocaleDateString()}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full hover:bg-muted/50"
                      >
                        <IconDots className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[160px] border-border/40"
                    >
                      <DropdownMenuItem
                        onClick={() => setEditingItem(item)}
                        className="text-xs py-2 cursor-pointer"
                      >
                        <IconEdit className="mr-2 h-3.5 w-3.5 text-blue-500" />{" "}
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingId(item.id)}
                        className="text-xs py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      >
                        <IconTrash className="mr-2 h-3.5 w-3.5" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-sm uppercase tracking-tight text-foreground/90">
                    {item.motivo}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                    {item.descripcion}
                  </p>

                  {item.recomendaciones && (
                    <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10 mt-4">
                      <p className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <IconStethoscope className="size-3" /> Recomendaciones
                      </p>
                      <p className="text-[11px] text-emerald-500/90 font-medium leading-normal italic">
                        "{item.recomendaciones}"
                      </p>
                    </div>
                  )}

                  <Separator className="bg-border/20 my-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 border border-border/40">
                        <AvatarImage src={item.especialista.image || ""} />
                        <AvatarFallback className="text-[8px] bg-violet-500/10 text-violet-500 font-bold">
                          {item.especialista.name?.[0]}
                          {item.especialista.apellidoPaterno?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-tighter">
                        Registrado por {item.especialista.name}{" "}
                        {item.especialista.apellidoPaterno}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-border/40 rounded-3xl bg-muted/5 relative z-10 mx-4">
            <div className="size-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
              <IconMessageReport className="size-10 text-muted-foreground/30" />
            </div>
            <p className="text-base font-black text-muted-foreground uppercase tracking-widest">
              Sin antecedentes
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1.5 max-w-[200px] text-center font-medium">
              No se han registrado incidentes o seguimientos psicológicos aún.
            </p>
          </div>
        )}
      </div>

      <FormModal
        title="Nuevo Registro Psicopedagógico"
        description="Ficha de seguimiento de bienestar y conducta."
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        className="sm:max-w-xl"
      >
        <PsychopedagogicalForm
          studentId={studentId}
          onSuccess={() => {
            setShowAddModal(false);
            loadHistory();
          }}
        />
      </FormModal>

      <FormModal
        title="Editar Registro"
        isOpen={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        className="sm:max-w-xl"
      >
        {editingItem && (
          <PsychopedagogicalForm
            studentId={studentId}
            initialData={editingItem}
            onSuccess={() => {
              setEditingItem(null);
              loadHistory();
            }}
          />
        )}
      </FormModal>

      <ConfirmModal
        title="Eliminar Registro"
        description="¿Está seguro de eliminar este registro psicopedagógico? Esta acción no se puede deshacer."
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
