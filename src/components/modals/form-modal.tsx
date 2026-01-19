"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface FormModalProps {
  title: string
  description?: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  headerClassName?: string
}

/**
 * Componente de modal genérico para formularios.
 * Proporciona una estructura estandarizada y estética premium para todos los diálogos de la app.
 */
export function FormModal({
  title,
  description,
  isOpen,
  onOpenChange,
  children,
  className,
  headerClassName,
}: FormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-card",
          className
        )}
      >
        <DialogHeader
          className={cn(
            "p-6 pb-4 border-b",
            headerClassName
          )}
        >
          <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
