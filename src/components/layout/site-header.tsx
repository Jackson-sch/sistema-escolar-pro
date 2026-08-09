"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconSearch } from "@tabler/icons-react";

import { SedeSelector } from "@/components/layout/sede-selector";

interface SiteHeaderProps {
  anioAcademico?: number;
  institucionName?: string;
}

export function SiteHeader({
  anioAcademico = 2026,
  institucionName = "EduNova Pro",
}: SiteHeaderProps) {
  const handleOpenSearch = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-command-palette"));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) rounded-tl-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium truncate max-w-[180px] sm:max-w-none">{institucionName}</h1>
        
        {/* Visual Command Palette Search Trigger & Multi-Sede Selector */}
        <div className="ml-auto flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenSearch}
            className="h-8 px-3 rounded-xl border-border/50 bg-muted/30 text-xs font-semibold text-muted-foreground hover:bg-muted/70 hover:text-foreground gap-2 transition-colors shadow-2xs"
          >
            <IconSearch className="size-3.5 text-primary" />
            <span className="hidden md:inline">Buscar por DNI, alumno o comando...</span>
            <span className="md:hidden">Buscar...</span>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <SedeSelector />

          <div className="hidden lg:flex items-center">
            <span className="text-xs text-muted-foreground">
              Periodo {anioAcademico}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
