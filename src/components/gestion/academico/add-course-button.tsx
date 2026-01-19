"use client"

import { useState } from "react"
import { IconBook, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CourseForm } from "./course-form"

interface AddCourseButtonProps {
  areas: any[]
  nivelesAcademicos: any[]
  profesores: any[]
}

export function AddCourseButton({ areas, nivelesAcademicos, profesores }: AddCourseButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shadow-lg">
          <IconPlus className="mr-2 h-5 w-5" />
          Nueva Asignación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-w-2xl bg-card max-h-[90vh] overflow-hidden p-0 border-none flex flex-col shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2"><IconBook className="size-6" />Carga Académica {new Date().getFullYear()}</DialogTitle>
          <DialogDescription className="text-xs mt-1">
            Asigne un docente y un ambiente de aprendizaje a una nueva asignatura de la malla.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <CourseForm
            onSuccess={() => setOpen(false)}
            areas={areas}
            nivelesAcademicos={nivelesAcademicos}
            profesores={profesores}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
