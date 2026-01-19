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

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escribe un comando o busca..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Sugerencias">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <IconLayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/finanzas"))}
          >
            <IconCreditCard className="mr-2 h-4 w-4" />
            <span>Finanzas</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/gestion/estudiantes"))
            }
          >
            <IconUsers className="mr-2 h-4 w-4" />
            <span>Estudiantes</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Módulos">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/asistencia"))}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            <span>Asistencia</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/evaluaciones"))}
          >
            <IconClipboardCheck className="mr-2 h-4 w-4" />
            <span>Evaluaciones</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/comunicaciones"))}
          >
            <IconUser className="mr-2 h-4 w-4" />
            <span>Comunicaciones</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Configuración">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/configuracion"))}
          >
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Configuración del Sistema</span>
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
