"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { EstadoUsuarioRowActions } from "./row-actions";
import {
  IconLock,
  IconLockOpen,
  IconSettings,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "codigo",
    header: "Código",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
        {row.getValue("codigo")}
      </span>
    ),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const color = row.original.color;
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: color || "#3b82f6" }}
          />
          <span className="font-medium">{row.getValue("nombre")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "permiteLogin",
    header: "Login",
    cell: ({ row }) => {
      const permite = row.getValue("permiteLogin") as boolean;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center w-full">
                {permite ? (
                  <IconLockOpen className="h-4 w-4 text-green-500" />
                ) : (
                  <IconLock className="h-4 w-4 text-destructive" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {permite ? "Permite iniciar sesión" : "Acceso bloqueado"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "esActivo",
    header: "Operativo",
    cell: ({ row }) => {
      const activo = row.getValue("esActivo") as boolean;
      return (
        <Badge variant={activo ? "secondary" : "outline"} className="gap-1">
          {activo ? (
            <IconCheck className="h-3 w-3" />
          ) : (
            <IconX className="h-3 w-3" />
          )}
          {activo ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sistemico",
    header: "Sistémico",
    cell: ({ row }) => {
      const sistemico = row.getValue("sistemico") as boolean;
      if (!sistemico) return null;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center w-full">
                <IconSettings className="h-4 w-4 text-muted-foreground animate-pulse" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Estado crítico del sistema (no eliminable)
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    id: "_count.usuarios",
    accessorFn: (row) => row._count?.usuarios || 0,
    header: "Usuarios",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-medium">
        {row.original._count?.usuarios || 0} users
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <EstadoUsuarioRowActions row={row} />,
  },
];
