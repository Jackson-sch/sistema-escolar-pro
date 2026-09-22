"use client";

import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PoliticaFormFieldsProps {
  nombre: string;
  setNombre: (val: string) => void;
  nivelId: string;
  setNivelId: (val: string) => void;
  niveles: any[];
  turno: string;
  setTurno: (val: string) => void;
  horaEntrada: string;
  setHoraEntrada: (val: string) => void;
  horaSalida: string;
  setHoraSalida: (val: string) => void;
  tolerancia: number;
  setTolerancia: (val: number) => void;
  activo: boolean;
  setActivo: (val: boolean) => void;
}

export function PoliticaFormFields({
  nombre,
  setNombre,
  nivelId,
  setNivelId,
  niveles,
  turno,
  setTurno,
  horaEntrada,
  setHoraEntrada,
  horaSalida,
  setHoraSalida,
  tolerancia,
  setTolerancia,
  activo,
  setActivo,
}: PoliticaFormFieldsProps) {
  const { setIsDirty } = useFormModal();

  // Marcar como sucio si algo cambia
  useEffect(() => {
    // Solo activamos isDirty si hay algo escrito (evita el estado inicial)
    if (nombre || nivelId !== "all" || turno !== "all" || tolerancia > 0) {
      setIsDirty(true);
    } else {
      setIsDirty(false);
    }
  }, [
    nombre,
    nivelId,
    turno,
    horaEntrada,
    horaSalida,
    tolerancia,
    activo,
    setIsDirty,
  ]);

  return (
    <div className="grid gap-3 py-1">
      <div className="space-y-1">
        <Label htmlFor="nombre" className="text-xs font-bold text-foreground">
          Nombre Descriptivo de la Regla
        </Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Primaria - Turno Mañana"
          className="h-9 text-xs rounded-xl border-border/60 bg-background"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">Nivel Educativo</Label>
          <Select value={nivelId} onValueChange={setNivelId}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-border/60 bg-background w-full">
              <SelectValue placeholder="Todos los Niveles" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">Todos los Niveles</SelectItem>
              {niveles.map((n) => (
                <SelectItem key={n.id} value={n.id} className="text-xs">
                  {n.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold text-foreground">Turno</Label>
          <Select value={turno} onValueChange={setTurno}>
            <SelectTrigger className="h-9 text-xs rounded-xl border-border/60 bg-background w-full">
              <SelectValue placeholder="Todos los Turnos" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="text-xs">Todos los Turnos</SelectItem>
              <SelectItem value="MANANA" className="text-xs">Mañana</SelectItem>
              <SelectItem value="TARDE" className="text-xs">Tarde</SelectItem>
              <SelectItem value="NOCHE" className="text-xs">Noche</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="entrada" className="text-xs font-bold text-foreground">Hora de Entrada</Label>
          <Input
            id="entrada"
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="salida" className="text-xs font-bold text-foreground">Hora de Salida</Label>
          <Input
            id="salida"
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="tolerancia" className="text-xs font-bold text-foreground">
          Tolerancia de Tardanza (Minutos)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="tolerancia"
            type="number"
            value={tolerancia}
            onChange={(e) => setTolerancia(parseInt(e.target.value) || 0)}
            min={0}
            className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center w-28"
          />
          <span className="text-xs font-medium text-muted-foreground">
            minutos posteriores a la hora de entrada
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="activo"
          checked={activo}
          onCheckedChange={(checked) => setActivo(checked as boolean)}
          className="size-4 rounded-md border-border/60 text-primary cursor-pointer"
        />
        <Label htmlFor="activo" className="text-xs font-bold text-foreground cursor-pointer">
          Regla de Control Activa
        </Label>
      </div>
    </div>
  );
}
