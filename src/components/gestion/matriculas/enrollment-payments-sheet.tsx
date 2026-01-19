"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EnrollmentTableType } from "./columns"
import { EnrollmentPayments } from "./enrollment-payments"
import { IconId, IconSchool } from "@tabler/icons-react"
import { getInitials } from "@/lib/formats"

interface EnrollmentPaymentsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  enrollment: EnrollmentTableType
}

export function EnrollmentPaymentsSheet({ open, onOpenChange, enrollment }: EnrollmentPaymentsSheetProps) {

  const name = `${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno} ${enrollment.estudiante.name}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full border-l">
        
        {/* ENCABEZADO: Perfil del Estudiante */}
        <SheetHeader className="px-6 py-6 bg-muted/30 border-b space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-card shadow-lg">
              <AvatarImage src={enrollment.estudiante.image || ""} alt="Foto del estudiante" />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {getInitials(enrollment.estudiante.name, enrollment.estudiante.apellidoPaterno)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 pt-1">
              <SheetTitle className="text-xl font-bold leading-tight">
                {name}
              </SheetTitle>
              <SheetDescription className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <IconId className="h-3.5 w-3.5" />
                  DNI: {enrollment.estudiante.dni || "Sin documento"}
                </span>
                {/* Asumiendo que enrollment tiene datos del nivel, si no, puedes quitar esta línea */}
                {enrollment.nivelAcademico && (
                   <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <IconSchool className="h-3.5 w-3.5" />
                    {enrollment.nivelAcademico.grado?.nombre} - {enrollment.nivelAcademico.seccion}
                  </span>
                )}
              </SheetDescription>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-background font-normal text-muted-foreground">
              Periodo {enrollment.anioAcademico}
            </Badge>
            <Badge variant={enrollment.estado === 'activo' ? 'default' : 'secondary'} className="capitalize">
              {enrollment.estado}
            </Badge>
          </div>
        </SheetHeader>

        {/* CUERPO: Componente de Pagos */}
        <div className="flex-1 overflow-y-auto bg-background p-4">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Detalle de Cobranza</h3>
             </div>
             {/* Renderizamos el componente de pagos optimizado */}
             <EnrollmentPayments estudianteId={enrollment.estudiante.id} />
          </div>
        </div>

        {/* PIE: Botones de Acción */}
        <SheetFooter className="p-4 border-t bg-muted/10 sm:justify-between sm:space-x-0">
          <SheetClose asChild>
            <Button variant="outline" className="text-muted-foreground hover:text-foreground">
              Cerrar
            </Button>
          </SheetClose>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}