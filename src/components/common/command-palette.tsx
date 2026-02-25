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
  IconAccessPoint,
  IconUserSearch,
  IconSchool,
  IconHierarchy2,
  IconBook,
  IconCertificate,
  IconClock,
  IconId,
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

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  useComponentShortcuts({
    onSearch: () => setOpen((prev) => !prev),
  });

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Escribe un comando o busca..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
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
            onSelect={() => runCommand(() => router.push("/configuracion/institucion?tab=variables"))}
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
