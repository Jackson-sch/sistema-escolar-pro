"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconEdit,
  IconTrash,
  IconChevronRight,
  IconLayersSubtract,
} from "@tabler/icons-react";
import { deleteAreaAction } from "@/actions/academic";
import { AreaForm } from "@/components/gestion/academico/areas/area-form";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { toast } from "sonner";
import { getIconComponent } from "@/components/ui/icon-utils";

interface Nivel {
  id: string;
  nombre: string;
  [key: string]: any;
}

export interface AreaWithNivel {
  id: string;
  nombre: string;
  descripcion?: string | null;
  color?: string | null;
  icono?: string | null;
  nivelId?: string | null;
  nivel?: Nivel | null;
  [key: string]: any;
}

interface AreaCardProps {
  area: AreaWithNivel;
  isSelected: boolean;
  onClick: () => void;
  areaCompsCount: number;
  institucionId: string;
  niveles: Nivel[];
}

export function AreaCard({
  area,
  isSelected,
  onClick,
  areaCompsCount,
  institucionId,
  niveles,
}: AreaCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAreaAction(area.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const IconComp = getIconComponent(area.icono);
  const areaColor = area.color || "#4f46e5";

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 rounded-2xl border overflow-hidden relative group shadow-xs",
          isSelected
            ? "border-l-4 border-l-indigo-500 bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/40 shadow-sm"
            : "bg-card/70 border-border/40 hover:bg-card hover:border-indigo-500/30 hover:shadow-sm",
        )}
        onClick={onClick}
      >
        {/* Background watermark icon */}
        <div
          className="absolute right-[-8px] bottom-[-8px] transition-[opacity,transform] duration-500 opacity-[0.06] group-hover:opacity-15 group-hover:scale-110 pointer-events-none"
          style={{ color: areaColor }}
        >
          <IconComp className="w-20 h-20" />
        </div>

        {/* Hover actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-0.5 rounded-lg border border-border/40 shadow-xs">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowEditDialog(true);
            }}
            title="Editar área"
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            title="Eliminar área"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>

        <CardContent className="p-3.5 relative z-0 space-y-2">
          <div className="flex items-start gap-2.5 pr-10">
            <div
              className="size-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs mt-0.5"
              style={{
                backgroundColor: `${areaColor}15`,
                color: areaColor,
                border: `1px solid ${areaColor}30`,
              }}
            >
              <IconComp className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-bold text-xs text-foreground truncate leading-snug">
                  {area.nombre}
                </h4>
                {area.nivel && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground border border-border/40 uppercase">
                    {area.nivel.nombre}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                {area.descripcion || "Sin descripción asignada"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full gap-1 uppercase tracking-wider",
                isSelected
                  ? "bg-indigo-600 text-white border-none shadow-xs"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              )}
            >
              <IconLayersSubtract className="size-3" />
              {areaCompsCount}{" "}
              {areaCompsCount === 1 ? "Competencia" : "Competencias"}
            </Badge>
            <IconChevronRight
              className={cn(
                "size-3.5 transition-transform duration-300",
                isSelected
                  ? "text-indigo-500 translate-x-0.5"
                  : "text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5",
              )}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Área Curricular"
        description={`¿Estás seguro de eliminar el área "${area.nombre}"? Se perderán las competencias asociadas.`}
      />

      <FormModal
        title="Editar Área Curricular"
        description="Actualice la información general del área curricular."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-lg"
      >
        <AreaForm
          id={area.id}
          initialData={area}
          institucionId={institucionId}
          niveles={niveles}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>
    </>
  );
}
