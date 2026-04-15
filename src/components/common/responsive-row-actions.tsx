"use client";

import React from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ActionItem {
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  onClick?: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "ghost"
    | "secondary"
    | "link";
  className?: string;
  showInDesktop?: boolean; // Default true
  showInMobile?: boolean; // Default true
  disabled?: boolean;
  isSeparator?: boolean;
  tooltip?: string;
}

interface ResponsiveRowActionsProps {
  actions: ActionItem[];
  label?: string; // For the dropdown header
  className?: string;
}

export function ResponsiveRowActions({
  actions,
  label = "Acciones",
  className,
}: ResponsiveRowActionsProps) {
  const desktopActions = actions.filter(
    (action) => action.showInDesktop !== false,
  );
  const mobileActions = actions.filter(
    (action) => action.showInMobile !== false,
  );

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-1">
        <TooltipProvider>
          {desktopActions.map((action, index) => {
            if (action.isSeparator) return null;

            const Icon = action.icon;
            if (!Icon || !action.label || !action.onClick) return null;

            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    variant={action.variant || "ghost"}
                    size="icon-sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      "h-8 w-8 transition-colors",
                      action.variant === "destructive"
                        ? "text-destructive hover:bg-destructive/10"
                        : "text-muted-foreground hover:text-foreground",
                      action.className,
                    )}
                  >
                    <Icon className="size-4" />
                    <span className="sr-only">{action.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px] font-medium">
                  {action.tooltip || action.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
              <span className="sr-only">Abrir menú</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[180px] bg-background/95 backdrop-blur-xl border-border/40"
          >
            {label && (
              <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5">
                {label}
              </DropdownMenuLabel>
            )}
            {mobileActions.map((action, index) => {
              if (action.isSeparator) {
                return (
                  <DropdownMenuSeparator key={index} className="bg-border/40" />
                );
              }
              const Icon = action.icon;
              if (!Icon || !action.label || !action.onClick) return null;

              return (
                <DropdownMenuItem
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    "text-[13px] py-2 cursor-pointer transition-colors",
                    action.variant === "destructive"
                      ? "text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      : "",
                    action.className,
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-2 h-4 w-4",
                      action.variant === "destructive"
                        ? "text-red-500"
                        : "text-muted-foreground",
                    )}
                  />
                  {action.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
