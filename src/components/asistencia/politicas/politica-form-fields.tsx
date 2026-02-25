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
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="nombre">Nombre Descriptivo</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Primaria - Turno Mañana"
          className="rounded-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nivel (Opcional)</Label>
          <Select value={nivelId} onValueChange={setNivelId}>
            <SelectTrigger className="rounded-full w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Niveles</SelectItem>
              {niveles.map((n) => (
                <SelectItem key={n.id} value={n.id}>
                  {n.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Turno (Opcional)</Label>
          <Select value={turno} onValueChange={setTurno}>
            <SelectTrigger className="rounded-full w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Turnos</SelectItem>
              <SelectItem value="MANANA">Mañana</SelectItem>
              <SelectItem value="TARDE">Tarde</SelectItem>
              <SelectItem value="NOCHE">Noche</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="entrada">Hora Entrada</Label>
          <Input
            id="entrada"
            type="time"
            value={horaEntrada}
            onChange={(e) => setHoraEntrada(e.target.value)}
            className="rounded-full"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="salida">Hora Salida</Label>
          <Input
            id="salida"
            type="time"
            value={horaSalida}
            onChange={(e) => setHoraSalida(e.target.value)}
            className="rounded-full"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="tolerancia">Tolerancia (Minutos)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="tolerancia"
            type="number"
            value={tolerancia}
            onChange={(e) => setTolerancia(parseInt(e.target.value) || 0)}
            min={0}
            className="rounded-full"
          />
          <span className="text-xs font-medium text-muted-foreground mr-2">
            min
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2 pb-4">
        <Checkbox
          id="activo"
          checked={activo}
          onCheckedChange={(checked) => setActivo(checked as boolean)}
        />
        <Label htmlFor="activo" className="text-sm font-bold cursor-pointer">
          Regla Activa
        </Label>
      </div>
    </div>
  );
}
