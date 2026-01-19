import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface SiteHeaderProps {
  anioAcademico?: number;
}

export function SiteHeader({ anioAcademico = 2025 }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/80 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) rounded-tl-xl">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">EduPeru Pro</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center">
            <span className="text-xs text-muted-foreground mr-4">
              Periodo Académico {anioAcademico}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
