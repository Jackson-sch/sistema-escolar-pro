"use client";

import * as React from "react";
import {
  IconEye,
  IconEyeOff,
  IconDotsVertical,
  IconCheck,
  IconX,
  IconPencil,
  IconTrash,
  IconCopy,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VariableSistema } from "./types";
import { formatDate } from "@/lib/formats";
import { toast } from "sonner";

interface VariableItemProps {
  variable: VariableSistema;
  onUpdate: (variable: VariableSistema) => Promise<void>;
  onDelete: (id: string) => void;
}

export function VariableItem({
  variable,
  onUpdate,
  onDelete,
}: VariableItemProps) {
  const [showValue, setShowValue] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(variable.valor);

  // Sincronizar el valor de edición cuando cambia la prop (ajuste durante render)
  const [prevValor, setPrevValor] = React.useState(variable.valor);
  if (prevValor !== variable.valor) {
    setPrevValor(variable.valor);
    setEditValue(variable.valor);
  }

  const handleSaveEdit = async () => {
    if (editValue === variable.valor) {
      setIsEditing(false);
      return;
    }
    await onUpdate({ ...variable, valor: editValue });
    setIsEditing(false);
  };

  const handleToggleActive = async () => {
    await onUpdate({ ...variable, activo: !variable.activo });
  };

  const handleCopyClave = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.clave);
    toast.success(`Clave copiada: ${variable.clave}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 bg-card/80 border border-border/40 rounded-xl transition-colors hover:bg-card/80 shadow-xs",
        !variable.activo && "opacity-50",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
        {/* Clave */}
        <div className="min-w-0 sm:w-[240px] shrink-0">
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={handleCopyClave}
              className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer truncate text-left bg-transparent border-none p-0"
              title="Click para copiar clave"
            >
              {variable.clave}
            </button>
            {variable.seccion && (
              <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-muted/40 text-muted-foreground border-none uppercase">
                {variable.seccion}
              </Badge>
            )}
          </div>
          {variable.descripcion && (
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
              {variable.descripcion}
            </div>
          )}
        </div>

        {/* Valor */}
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-background/50 p-2 sm:p-1.5 rounded-xl border border-border/30">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono text-xs h-8 flex-1 rounded-lg bg-background border-border/40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
              />
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded-lg text-emerald-600 hover:bg-emerald-500/10"
                  onClick={handleSaveEdit}
                >
                  <IconCheck className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 rounded-lg text-rose-500 hover:bg-rose-500/10"
                  onClick={() => setIsEditing(false)}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setShowValue(!showValue)}
                title={showValue ? "Ocultar valor" : "Ver valor"}
              >
                {showValue ? (
                  <IconEyeOff className="size-3.5" />
                ) : (
                  <IconEye className="size-3.5" />
                )}
              </Button>
              <span className="font-mono text-xs text-foreground/90 truncate select-all">
                {showValue ? variable.valor : "••••••••••••••••••••"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border/20">
        <div className="text-[10px] text-muted-foreground/60 font-mono">
          {formatDate(variable.createdAt, "dd/MM/yy")}
        </div>

        <div className="flex items-center gap-2.5">
          <Switch
            checked={variable.activo}
            onCheckedChange={handleToggleActive}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl border-border/40">
              <DropdownMenuItem 
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold rounded-lg cursor-pointer"
              >
                <IconPencil className="size-3.5 mr-2 text-indigo-500" />
                Editar Valor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(variable.id)}
                className="text-xs font-semibold rounded-lg text-rose-600 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer"
              >
                <IconTrash className="size-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
