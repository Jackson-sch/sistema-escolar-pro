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
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VariableSistema } from "./types";
import { formatDate } from "@/lib/formats";

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

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 bg-card border border-border rounded-2xl transition-all hover:bg-white/5",
        !variable.activo && "opacity-50",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
        {/* Clave */}
        <div className="min-w-0 sm:min-w-[180px] lg:min-w-[240px]">
          <div className="font-mono text-sm font-medium text-primary">
            {variable.clave}
          </div>
          {variable.descripcion && (
            <div className="text-xs text-muted-foreground truncate max-w-full">
              {variable.descripcion}
            </div>
          )}
        </div>

        {/* Valor */}
        <div className="flex items-center gap-2 flex-1 min-w-0 bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/5 sm:border-0">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="font-mono text-sm h-9 flex-1 rounded-full bg-background"
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
                  className="size-9 rounded-full hover:bg-green-500/10"
                  onClick={handleSaveEdit}
                >
                  <IconCheck className="size-4 text-green-500" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-9 rounded-full hover:bg-red-500/10"
                  onClick={() => setIsEditing(false)}
                >
                  <IconX className="size-4 text-red-500" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 rounded-full hover:bg-white/10"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? (
                  <IconEyeOff className="size-4 text-muted-foreground" />
                ) : (
                  <IconEye className="size-4 text-muted-foreground" />
                )}
              </Button>
              <span className="font-mono text-xs sm:text-sm text-muted-foreground truncate select-all">
                {showValue ? variable.valor : "••••••••••••••••••••"}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
        <div className="hidden xs:block text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider whitespace-nowrap">
          {formatDate(variable.createdAt, "dd/MM/yy")}
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={variable.activo}
            onCheckedChange={handleToggleActive}
            className="data-[state=checked]:bg-green-500"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full hover:bg-white/10"
              >
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <IconPencil className="size-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(variable.id)}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <IconTrash className="size-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
