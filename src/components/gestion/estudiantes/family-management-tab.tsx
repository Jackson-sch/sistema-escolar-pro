"use client";

import { useState } from "react";
import {
  IconUsers,
  IconPlus,
  IconPhone,
  IconId,
  IconCheck,
  IconTrash,
  IconEdit,
  IconHome,
  IconWalk,
  IconDots,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormModal } from "@/components/modals/form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FamilyMemberForm } from "./family-member-form";
import {
  removeFamilyRelationAction,
  togglePrimaryContactAction,
} from "@/actions/family";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCurrentRole } from "@/hooks/use-current-role";

interface FamilyManagementTabProps {
  studentId: string;
  familyRelations: any[];
}

export function FamilyManagementTab({
  studentId,
  familyRelations,
}: FamilyManagementTabProps) {
  const role = useCurrentRole();
  const isProfessor = role === "profesor";

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRelation, setEditingRelation] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onRemove = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      const res = await removeFamilyRelationAction(deletingId);
      if (res.success) {
        toast.success(res.success);
        setDeletingId(null);
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onTogglePrimary = async (relationId: string) => {
    try {
      const res = await togglePrimaryContactAction(studentId, relationId);
      if (res.success) toast.success(res.success);
      else toast.error(res.error);
    } catch (error) {
      toast.error("Error al actualizar contacto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">Núcleo Familiar</h3>
          <p className="text-xs text-muted-foreground font-medium">
            Gestiona los padres, tutores y contactos autorizados.
          </p>
        </div>
        {!isProfessor && (
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl h-9"
          >
            <IconPlus className="mr-2 h-4 w-4" /> Agregar Familiar
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {familyRelations.length > 0 ? (
          familyRelations.map((rel) => (
            <div
              key={rel.id}
              className={cn(
                "group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300",
                "bg-background/40 backdrop-blur-sm border-border/40 hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/5",
                rel.contactoPrimario &&
                  "border-emerald-500/20 bg-emerald-500/5 shadow-none"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="size-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                    <IconUser className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-base uppercase tracking-tight">
                        {rel.padreTutor.name} {rel.padreTutor.apellidoPaterno}
                      </p>
                      {rel.contactoPrimario && (
                        <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-widest h-5 px-2">
                          Principal
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mt-0.5">
                      {rel.parentesco}
                    </p>
                  </div>
                </div>

                {!isProfessor && (
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
                      className="w-[180px] border-border/40"
                    >
                      <DropdownMenuItem
                        onClick={() => setEditingRelation(rel)}
                        className="text-xs py-2 cursor-pointer"
                      >
                        <IconEdit className="mr-2 h-3.5 w-3.5 text-blue-500" />{" "}
                        Editar Datos
                      </DropdownMenuItem>
                      {!rel.contactoPrimario && (
                        <DropdownMenuItem
                          onClick={() => onTogglePrimary(rel.id)}
                          className="text-xs py-2 cursor-pointer"
                        >
                          <IconCheck className="mr-2 h-3.5 w-3.5 text-emerald-500" />{" "}
                          Marcar Principal
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setDeletingId(rel.id)}
                        className="text-xs py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      >
                        <IconTrash className="mr-2 h-3.5 w-3.5" /> Eliminar
                        Vínculo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start gap-2">
                  <IconPhone className="size-3.5 text-muted-foreground/60 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                      Teléfono
                    </span>
                    <span className="text-xs font-bold leading-tight">
                      {rel.padreTutor.telefono || "Sin registrar"}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <IconId className="size-3.5 text-muted-foreground/60 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
                      Documento
                    </span>
                    <span className="text-xs font-bold leading-tight">
                      {rel.padreTutor.dni}
                    </span>
                  </div>
                </div>
                {rel.autorizadoRecoger && (
                  <div className="flex items-start gap-2">
                    <IconWalk className="size-3.5 text-emerald-500/60 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-500/40 tracking-widest uppercase">
                        Movilidad
                      </span>
                      <span className="text-xs font-bold leading-tight text-emerald-500/80">
                        AUTORIZADO RECOGER
                      </span>
                    </div>
                  </div>
                )}
                {rel.viveCon && (
                  <div className="flex items-start gap-2">
                    <IconHome className="size-3.5 text-blue-500/60 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-blue-500/40 tracking-widest uppercase">
                        Hogar
                      </span>
                      <span className="text-xs font-bold leading-tight text-blue-500/80">
                        VIVE CON ALUMNO
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
            <div className="size-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <IconUsers className="size-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">
              Sin familiares registrados
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Haga clic en agregar para registrar padres o tutores.
            </p>
          </div>
        )}
      </div>

      <FormModal
        title="Agregar Familiar"
        description="Ficha de datos del padre, madre o tutor legal."
        isOpen={showAddModal}
        onOpenChange={setShowAddModal}
        className="sm:max-w-xl"
      >
        <FamilyMemberForm
          studentId={studentId}
          onSuccess={() => setShowAddModal(false)}
        />
      </FormModal>

      <FormModal
        title="Editar Familiar"
        description="Actualice la información del pariente."
        isOpen={!!editingRelation}
        onOpenChange={(open) => !open && setEditingRelation(null)}
        className="sm:max-w-xl"
      >
        {editingRelation && (
          <FamilyMemberForm
            studentId={studentId}
            relationId={editingRelation.id}
            initialData={editingRelation}
            onSuccess={() => setEditingRelation(null)}
          />
        )}
      </FormModal>

      <ConfirmModal
        title="Eliminar Vínculo Familiar"
        description="¿Está seguro de eliminar esta relación familiar? El usuario no será eliminado del sistema, solo su vínculo con este estudiante."
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={onRemove}
        loading={loading}
      />
    </div>
  );
}

function IconUser({ className }: { className?: string }) {
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
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
