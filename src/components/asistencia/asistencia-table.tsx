"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  IconCheck,
  IconX,
  IconClock,
  IconFileCheck,
  IconUser
} from "@tabler/icons-react"

interface AsistenciaTableProps {
  data: any[]
  onEstadoChange: (id: string, estado: string) => void
  onJustificacionChange: (id: string, justificacion: string) => void
}

// Configuración de estilos dinámicos adaptados para Dark/Light mode
const estadoConfig = {
  presente: {
    label: "Presente",
    icon: IconCheck,
    // Usamos opacidad para el fondo y colores semánticos para texto
    triggerClass: "data-[state=open]:bg-emerald-50 focus:ring-emerald-500/20 bg-emerald-500/10 text-emerald-700 border-emerald-500/20 hover:bg-emerald-500/20",
    itemClass: "text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
  },
  ausente: {
    label: "Ausente",
    icon: IconX,
    triggerClass: "data-[state=open]:bg-red-50 focus:ring-red-500/20 bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20",
    itemClass: "text-red-600 focus:bg-red-50 focus:text-red-700"
  },
  tarde: {
    label: "Tardanza",
    icon: IconClock,
    triggerClass: "data-[state=open]:bg-orange-50 focus:ring-orange-500/20 bg-orange-500/10 text-orange-700 border-orange-500/20 hover:bg-orange-500/20",
    itemClass: "text-orange-600 focus:bg-orange-50 focus:text-orange-700"
  },
  justificado: {
    label: "Justificado",
    icon: IconFileCheck,
    triggerClass: "data-[state=open]:bg-blue-50 focus:ring-blue-500/20 bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20",
    itemClass: "text-blue-600 focus:bg-blue-50 focus:text-blue-700"
  }
}

export function AsistenciaTable({ data, onEstadoChange, onJustificacionChange }: AsistenciaTableProps) {
  return (
    <div className="w-full overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/10 border-y border-border/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[60px] text-center font-bold text-[10px] text-muted-foreground hidden md:table-cell">
              ID
            </TableHead>
            <TableHead className="font-semibold text-[11px] text-muted-foreground py-4">
              Estudiante
            </TableHead>
            <TableHead className="w-[200px] font-semibold text-[11px] text-muted-foreground py-4">
              Estado de Asistencia
            </TableHead>
            <TableHead className="font-semibold text-[11px] text-muted-foreground py-4">
              Observaciones del Docente
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground/40"
              >
                <div className="flex flex-col items-center gap-2">
                  <IconUser className="size-8 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Sin registros disponibles</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((alumno, index) => {
              const config = estadoConfig[alumno.estado as keyof typeof estadoConfig] || estadoConfig.presente

              return (
                <TableRow
                  key={alumno.id}
                  className="group transition-colors border-b border-border/40 hover:bg-muted/2 last:border-0"
                >
                  <TableCell className="py-5 text-center hidden md:table-cell">
                    <span className="text-[10px] font-medium text-muted-foreground/50">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border border-border/60 shadow-lg ring-1 ring-border/20">
                        <AvatarImage src={alumno.image || ""} alt={alumno.name} />
                        <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold">
                          {alumno.name?.[0]}{alumno.apellidoPaterno?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold tracking-tight leading-none text-foreground/90">
                          {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium tracking-tight">
                          {alumno.name}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <Select
                      value={alumno.estado}
                      onValueChange={(v) => onEstadoChange(alumno.id, v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-10 w-full font-semibold text-xs shadow-none ring-offset-background focus:ring-1 focus:ring-primary/20 transition-all border-border/40",
                          config.triggerClass
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border/60 shadow-2xl backdrop-blur-xl bg-background/80">
                        {Object.entries(estadoConfig).map(([key, val]) => {
                          const ItemIcon = val.icon
                          return (
                            <SelectItem
                              key={key}
                              value={key}
                              className={cn("text-xs font-semibold py-3", val.itemClass)}
                            >
                              <div className="flex items-center gap-3">
                                <ItemIcon className="size-4" />
                                {val.label}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-5">
                    <Input
                      value={alumno.justificacion}
                      onChange={(e) => onJustificacionChange(alumno.id, e.target.value)}
                      placeholder="Escriba una observación..."
                      className="h-10 text-[11px] font-medium border-border/40 bg-muted/5 focus-visible:ring-primary/20 placeholder:text-muted-foreground/40 placeholder:font-medium"
                    />
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}