"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/formats";

interface AdmissionsTableProps {
  students?: any[];
}

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

const statusMap: Record<string, BadgeVariant> = {
  activo: "default",
  pendiente: "secondary",
  retirado: "destructive",
  egresado: "outline",
}

export function AdmissionsTable({ students = [] }: AdmissionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Estudiante</TableHead>
          <TableHead>Grado</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
              No hay admisiones recientes.
            </TableCell>
          </TableRow>
        ) : (
          students.map((student) => {
            const fullName = `${student.name || ""} ${student.apellidoPaterno || ""} ${student.apellidoMaterno || ""}`.trim()
            const gradeName = student.nivelAcademico
              ? `${student.nivelAcademico.grado?.nombre || ""} ${student.nivelAcademico.nivel?.nombre || ""}`
              : "No asignado"
            const statusLabel = student.estado?.nombre || "Sin estado"
            const statusKey = student.estado?.slug || "pendiente"
            const date = formatDate(student.createdAt)

            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="capitalize">{fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {date}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{gradeName}</TableCell>
                <TableCell>
                  <Badge variant={statusMap[statusKey] || "outline"}>
                    {statusLabel}
                  </Badge>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
