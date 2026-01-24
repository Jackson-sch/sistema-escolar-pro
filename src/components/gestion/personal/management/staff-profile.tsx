import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconCertificate,
  IconEdit,
  IconBuilding,
  IconId,
} from "@tabler/icons-react";
import { StaffTableType } from "@/components/gestion/personal/components/columns";
import { getInitials } from "@/lib/formats";

interface StaffProfileProps {
  staff: StaffTableType;
  showViewSheet: boolean;
  setShowViewSheet: (value: boolean) => void;
  setShowEditDialog: (value: boolean) => void;
}

export default function StaffProfile({
  staff,
  showViewSheet,
  setShowViewSheet,
  setShowEditDialog,
}: StaffProfileProps) {
  return (
    <Sheet open={showViewSheet} onOpenChange={setShowViewSheet}>
      <SheetContent className="sm:max-w-[420px] p-0 overflow-y-auto bg-background flex flex-col">
        {/* Accesibilidad */}
        <SheetHeader className="sr-only">
          <SheetTitle>Perfil del Colaborador</SheetTitle>
          <SheetDescription>
            Expediente detallado de {staff.name} {staff.apellidoPaterno}
          </SheetDescription>
        </SheetHeader>

        {/* HEADER DESIGN - Fondo degradado curvo */}
        <div className="relative w-full shrink-0">
          {/* Fondo con degradado */}
          <div className="h-24 w-full bg-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent" />
            {/* Patrón decorativo */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute left-10 bottom-0 w-20 h-20 bg-primary/5 rounded-full blur-xl" />
          </div>

          {/* Borde inferior curvo decorativo */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
            <svg
              className="relative block w-full h-[20px]"
              data-name="Layer 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
                className="fill-background opacity-50"
              ></path>
            </svg>
          </div>

          {/* Botón Editar Flotante */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => setShowEditDialog(true)}
            >
              <IconEdit className="size-3.5" />
            </Button>
          </div>

          {/* Avatar */}
          <div className="absolute bottom-0 left-6 transform translate-y-1/2 z-10">
            <div className="relative group">
              <Avatar className="size-24 border-4 border-background shadow-lg bg-muted">
                <AvatarImage src={staff.image || ""} alt={staff.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {getInitials(staff.name, staff.apellidoPaterno)}
                </AvatarFallback>
              </Avatar>
              {/* Indicador de estado */}
              <div
                className="absolute bottom-1 right-1 size-4 rounded-full border-2 border-background shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-110"
                style={{ backgroundColor: staff.estado?.color || "#94a3b8" }}
              />
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 px-6 pt-14 pb-8 space-y-8">
          {/* Título y Status */}
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight leading-none mb-2 capitalize">
              {staff.name} {staff.apellidoPaterno} {staff.apellidoMaterno}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="px-2 py-0.5 text-xs font-medium"
              >
                {staff.cargo?.nombre || "Sin cargo"}
              </Badge>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <IconBuilding className="size-3" /> {staff.area || "General"}
              </span>
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Grid de Datos Básicos */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <IconId className="size-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Documento
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground font-mono">
                {staff.dni}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <IconMail className="size-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Contacto
                </span>
              </div>
              <a
                href={`mailto:${staff.email}`}
                className="text-sm font-medium text-primary hover:underline block truncate"
              >
                {staff.email}
              </a>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <IconPhone className="size-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Teléfono
                </span>
              </div>
              <p className="text-sm text-foreground">
                {staff.telefono || (
                  <span className="italic opacity-50">No registrado</span>
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <IconMapPin className="size-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Dirección
                </span>
              </div>
              <p className="text-sm text-foreground truncate">
                {staff.direccion || (
                  <span className="italic opacity-50">No registrada</span>
                )}
              </p>
            </div>
          </div>

          {/* SECCIÓN DOCENTE - Tarjeta Premium */}
          {staff.role === "profesor" && (
            <>
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary/90 flex items-center gap-2">
                  <IconCertificate className="size-4" strokeWidth={2} />
                  Expediente Académico
                </h3>

                <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.02] to-background p-5 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-colors">
                  {/* Decoración sutil */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">
                          Especialidad
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {staff.especialidad || (
                            <span className="text-muted-foreground italic">
                              No especificada
                            </span>
                          )}
                        </p>
                      </div>
                      {staff.escalaMagisterial && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-primary/30 bg-primary/5 text-primary"
                        >
                          {staff.escalaMagisterial}
                        </Badge>
                      )}
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Grado Académico / Título
                      </p>
                      <p className="text-sm text-foreground leading-snug">
                        {staff.titulo || (
                          <span className="text-muted-foreground italic">
                            Pendiente
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <div className="h-px bg-border flex-1" />
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 h-5"
                      >
                        CPP: {staff.colegioProfesor || "N/A"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
