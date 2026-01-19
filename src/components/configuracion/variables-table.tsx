"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconCopy,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  upsertVariableAction,
  deleteVariableAction,
} from "@/actions/variables";

interface VariableSistema {
  id: string;
  clave: string;
  valor: string;
  tipo: string;
  descripcion?: string | null;
  seccion?: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VariablesTableProps {
  initialData: VariableSistema[];
}

export function VariablesTable({ initialData }: VariablesTableProps) {
  const [data, setData] = React.useState<VariableSistema[]>(initialData);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingVariable, setEditingVariable] =
    React.useState<Partial<VariableSistema> | null>(null);
  const [showValues, setShowValues] = React.useState<Record<string, boolean>>(
    {}
  );

  const toggleValueVisibility = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariable?.clave || !editingVariable?.valor) {
      toast.error("Clave y valor son requeridos");
      return;
    }

    const result = await upsertVariableAction({
      clave: editingVariable.clave,
      valor: editingVariable.valor,
      tipo: editingVariable.tipo || "string",
      descripcion: editingVariable.descripcion || undefined,
      seccion: editingVariable.seccion || "general",
      activo: editingVariable.activo ?? true,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        editingVariable.id ? "Variable actualizada" : "Variable creada"
      );
      // Actualizar localmente o refrescar
      if (editingVariable.id) {
        setData((prev) =>
          prev.map((v) => (v.id === result.data.id ? result.data : v))
        );
      } else {
        setData((prev) => [result.data, ...prev]);
      }
      setIsModalOpen(false);
      setEditingVariable(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta variable?")) return;

    const result = await deleteVariableAction(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Variable eliminada");
      setData((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const columns: ColumnDef<VariableSistema>[] = [
    {
      accessorKey: "clave",
      header: "Clave",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded w-fit">
          {row.getValue("clave")}
        </div>
      ),
    },
    {
      accessorKey: "valor",
      header: "Valor",
      cell: ({ row }) => {
        const id = row.original.id;
        const isVisible = showValues[id];
        const value = row.getValue("valor") as string;
        const isSensitive =
          row.original.clave.toLowerCase().includes("key") ||
          row.original.clave.toLowerCase().includes("secret") ||
          row.original.clave.toLowerCase().includes("password");

        return (
          <div className="flex items-center gap-2 max-w-[300px]">
            <div className="truncate font-mono text-xs text-muted-foreground bg-muted p-1 rounded flex-1">
              {isSensitive && !isVisible ? "••••••••••••••••" : value}
            </div>
            {isSensitive && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => toggleValueVisibility(id)}
              >
                {isVisible ? (
                  <IconEyeOff className="size-3" />
                ) : (
                  <IconEye className="size-3" />
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => {
                navigator.clipboard.writeText(value);
                toast.success("Copiado al portapapeles");
              }}
            >
              <IconCopy className="size-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-[10px]">
          {row.getValue("tipo")}
        </Badge>
      ),
    },
    {
      accessorKey: "seccion",
      header: "Sección",
      cell: ({ row }) => (
        <span className="text-[10px] font-medium uppercase text-muted-foreground/60">
          {row.getValue("seccion") || "General"}
        </span>
      ),
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("activo") ? "success" : ("secondary" as any)}
          className="text-[10px]"
        >
          {row.getValue("activo") ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingVariable(row.original);
              setIsModalOpen(true);
            }}
            className="size-8 text-primary hover:bg-primary/10 rounded-xl"
          >
            <IconPencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            className="size-8 text-red-500 hover:bg-red-50 rounded-xl"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        searchKey="clave"
        searchPlaceholder="Buscar por clave..."
      >
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingVariable({
                  clave: "",
                  valor: "",
                  tipo: "string",
                  seccion: "general",
                  activo: true,
                });
              }}
              className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
            >
              <IconPlus className="size-4" />
              Nueva Variable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>
                  {editingVariable?.id ? "Editar Variable" : "Nueva Variable"}
                </DialogTitle>
                <DialogDescription>
                  Define una clave única y su valor para usarla dinámicamente en
                  el sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clave" className="text-right">
                    Clave
                  </Label>
                  <Input
                    id="clave"
                    value={editingVariable?.clave || ""}
                    onChange={(e) =>
                      setEditingVariable((prev) => ({
                        ...prev!,
                        clave: e.target.value.toUpperCase().replace(/\s/g, "_"),
                      }))
                    }
                    placeholder="API_KEY_GEMINI"
                    className="col-span-3 font-mono"
                    disabled={!!editingVariable?.id}
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="valor" className="text-right pt-2">
                    Valor
                  </Label>
                  <Textarea
                    id="valor"
                    value={editingVariable?.valor || ""}
                    onChange={(e) =>
                      setEditingVariable((prev) => ({
                        ...prev!,
                        valor: e.target.value,
                      }))
                    }
                    placeholder="Escribe el valor aquí..."
                    className="col-span-3 min-h-[100px] font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tipo" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={editingVariable?.tipo || "string"}
                    onValueChange={(v) =>
                      setEditingVariable((prev) => ({ ...prev!, tipo: v }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">Texto (String)</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="boolean">Booleano</SelectItem>
                      <SelectItem value="json">JSON / Objeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="seccion" className="text-right">
                    Sección
                  </Label>
                  <Input
                    id="seccion"
                    value={editingVariable?.seccion || ""}
                    onChange={(e) =>
                      setEditingVariable((prev) => ({
                        ...prev!,
                        seccion: e.target.value.toLowerCase(),
                      }))
                    }
                    placeholder="ia, finanzas, general"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right">
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"
                    value={editingVariable?.descripcion || ""}
                    onChange={(e) =>
                      setEditingVariable((prev) => ({
                        ...prev!,
                        descripcion: e.target.value,
                      }))
                    }
                    placeholder="Breve explicación del uso de esta variable"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="activo" className="text-right">
                    Activo
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="activo"
                      checked={editingVariable?.activo ?? true}
                      onCheckedChange={(c) =>
                        setEditingVariable((prev) => ({ ...prev!, activo: c }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl shadow-lg shadow-primary/20"
                >
                  {editingVariable?.id ? "Guardar Cambios" : "Crear Variable"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DataTable>
    </div>
  );
}
