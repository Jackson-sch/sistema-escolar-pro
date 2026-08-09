"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  IconSearch,
  IconUser,
  IconCreditCard,
  IconSettings,
  IconCalendar,
  IconClipboardCheck,
  IconLogout,
  IconLayoutDashboard,
  IconUsers,
  IconBuilding,
  IconUserSearch,
  IconSchool,
  IconHierarchy2,
  IconBook,
  IconCertificate,
  IconClock,
  IconId,
  IconLoader2,
  IconUserCheck,
} from "@tabler/icons-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

import { useComponentShortcuts } from "@/hooks/use-component-shortcuts";
import { globalSearchAction, GlobalSearchResult } from "@/actions/global-search";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  useComponentShortcuts({
    onSearch: () => setOpen((prev) => !prev),
  });

  React.useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-command-palette", handleOpen);
    return () => window.removeEventListener("open-command-palette", handleOpen);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    setQuery("");
    command();
  }, []);

  // Debounced search effect
  React.useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await globalSearchAction(query);
        setResults(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={!query}>
      <CommandInput
        placeholder="Buscar por DNI, estudiante, personal o comando..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading ? (
          <div className="flex items-center justify-center py-6 gap-2 text-xs font-semibold text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin text-primary" />
            <span>Buscando en la base de datos...</span>
          </div>
        ) : (
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        )}

        {/* Dynamic Search Results */}
        {results.length > 0 && (
          <>
            <CommandGroup heading="Resultados de Búsqueda (Omnisearch)">
              {results.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.label} ${item.sublabel} ${item.id}`}
                  onSelect={() => runCommand(() => router.push(item.url))}
                  className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {item.type === "estudiante" ? (
                      <IconUsers className="size-4 text-primary shrink-0" />
                    ) : item.type === "personal" ? (
                      <IconUserCheck className="size-4 text-indigo-500 shrink-0" />
                    ) : (
                      <IconUser className="size-4 text-amber-500 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-micro text-muted-foreground font-medium pl-6">
                    {item.sublabel}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Acceso Rápido">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <IconLayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard Principal</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/estudiantes"))
            }
          >
            <IconUsers className="mr-2 h-4 w-4" />
            <span>Estudiantes (Padrón)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/finanzas"))}
          >
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Finanzas y Pagos</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Gestión Académica">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/academico/carga-horaria"))
            }
          >
            <IconClock className="mr-2 h-4 w-4" />
            <span>Carga Horaria / Cursos</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/academico/areas"))
            }
          >
            <IconBook className="mr-2 h-4 w-4" />
            <span>Áreas Curriculares</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/academico/competencias"))
            }
          >
            <IconCertificate className="mr-2 h-4 w-4" />
            <span>Competencias y Capacidades</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/academico/estructura"))
            }
          >
            <IconHierarchy2 className="mr-2 h-4 w-4" />
            <span>Estructura (Niveles, Grados, Secciones)</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Operaciones">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/matriculas"))
            }
          >
            <IconSchool className="mr-2 h-4 w-4" />
            <span>Matrículas Actuales</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/admisiones"))
            }
          >
            <IconUserSearch className="mr-2 h-4 w-4" />
            <span>Admisiones (Prospectos)</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/gestion/personal"))}
          >
            <IconId className="mr-2 h-4 w-4" />
            <span>Personal y Docentes</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/asistencia"))}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            <span>Asistencia Diaria</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/evaluaciones"))}
          >
            <IconClipboardCheck className="mr-2 h-4 w-4" />
            <span>Evaluaciones y Notas</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/comunicaciones"))}
          >
            <IconUser className="mr-2 h-4 w-4" />
            <span>Centro de Comunicaciones</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />

        <CommandGroup heading="Configuración">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/configuracion/institucion"))
            }
          >
            <IconBuilding className="mr-2 h-4 w-4" />
            <span>Datos de la Institución</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/configuracion/institucion?tab=variables"))
            }
          >
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Configuración General</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log("Logout"))}>
            <IconLogout className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
