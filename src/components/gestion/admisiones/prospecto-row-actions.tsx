"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconFileCertificate,
  IconUserCheck,
  IconArrowRight,
  IconClipboardCheck
} from "@tabler/icons-react"
import { useState } from "react"
import { convertProspectoToAdmisionAction } from "@/actions/admissions"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AdmisionFlow } from "./admision-flow"
import { FormModal } from "@/components/modals/form-modal"
import { ProspectoForm } from "./prospecto-form"

interface ProspectoRowActionsProps {
  row: any
  table: any
}

export function ProspectoRowActions({ row, table }: ProspectoRowActionsProps) {
  const p = row.original
  const [loading, setLoading] = useState(false)
  const [showFlow, setShowFlow] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  // Extraer metadata del table
  const meta = (table.options.meta as any) || {}
  const { grados = [], instituciones = [] } = meta

  const onStartAdmision = async () => {
    setLoading(true)
    try {
      const res = await convertProspectoToAdmisionAction(p.id)
      if (res.success) toast.success(res.success)
      else toast.error(res.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <IconDots className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] border-border/40 bg-background/95 backdrop-blur-xl">
          <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest p-2">Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowEdit(true)}
            className="text-[13px] py-2 cursor-pointer"
          >
            <IconEdit className="mr-2 h-4 w-4 text-blue-500" /> Editar Datos
          </DropdownMenuItem>

          {p.estado === "INTERESADO" && (
            <DropdownMenuItem
              onClick={onStartAdmision}
              disabled={loading}
              className="text-[13px] py-2 cursor-pointer text-violet-500 focus:text-violet-500 focus:bg-violet-500/10"
            >
              <IconArrowRight className="mr-2 h-4 w-4" /> Iniciar Evaluación
            </DropdownMenuItem>
          )}

          {p.admision && (
            <DropdownMenuItem
              onClick={() => setShowFlow(true)}
              className="text-[13px] py-2 cursor-pointer text-blue-500 focus:text-blue-500 focus:bg-blue-500/10"
            >
              <IconClipboardCheck className="mr-2 h-4 w-4" /> Ver Evaluación
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem className="text-[13px] py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10">
            <IconTrash className="mr-2 h-4 w-4" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de Edición */}
      <FormModal
        title="Editar Prospecto"
        description="Actualice la información del interesado."
        isOpen={showEdit}
        onOpenChange={setShowEdit}
        className="sm:max-w-lg"
      >
        <ProspectoForm
          id={p.id}
          initialData={p}
          grados={grados}
          instituciones={instituciones}
          onSuccess={() => setShowEdit(false)}
        />
      </FormModal>

      <Sheet open={showFlow} onOpenChange={setShowFlow}>
        <SheetContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-l border-border/40">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold uppercase tracking-tight">Expediente de Admisión</SheetTitle>
            <SheetDescription>
              Seguimiento de evaluación para {p.name} {p.apellidoPaterno}
            </SheetDescription>
          </SheetHeader>
          {p.admision && (
            <AdmisionFlow
              admision={{ ...p.admision, prospecto: p }}
              onSuccess={() => setShowFlow(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
