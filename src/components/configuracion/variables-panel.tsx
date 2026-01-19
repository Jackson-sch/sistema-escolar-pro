"use client";

import * as React from "react";
import {
  IconPlus,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconDotsVertical,
  IconUpload,
  IconSearch,
  IconCheck,
  IconX,
  IconPencil,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
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

interface VariablesPanelProps {
  initialData: VariableSistema[];
}

// Variables recomendadas para pre-poblar
const RECOMMENDED_VARS = [
  {
    clave: "GOOGLE_GENERATIVE_AI_API_KEY",
    descripcion: "Clave API de Google AI para Gemini",
  },
  {
    clave: "GEMINI_MODEL",
    descripcion: "Nombre del modelo de Gemini a usar",
    defaultValue: "gemini-1.5-flash-latest",
  },
  { clave: "SMTP_HOST", descripcion: "Host del servidor SMTP para correos" },
  { clave: "SMTP_USER", descripcion: "Usuario SMTP" },
  { clave: "SMTP_PASS", descripcion: "Contraseña SMTP" },
];

export function VariablesPanel({ initialData }: VariablesPanelProps) {
  const [variables, setVariables] =
    React.useState<VariableSistema[]>(initialData);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showValues, setShowValues] = React.useState<Record<string, boolean>>(
    {}
  );
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  // Estado para nuevas variables (formulario inline)
  const [newVars, setNewVars] = React.useState<
    Array<{
      key: string;
      value: string;
      note: string;
      sensitive: boolean;
    }>
  >([{ key: "", value: "", note: "", sensitive: true }]);

  const toggleValueVisibility = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const addNewVarRow = () => {
    setNewVars((prev) => [
      ...prev,
      { key: "", value: "", note: "", sensitive: true },
    ]);
  };

  const removeNewVarRow = (index: number) => {
    setNewVars((prev) => prev.filter((_, i) => i !== index));
  };

  const updateNewVar = (index: number, field: string, value: any) => {
    setNewVars((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  // Detectar paste de múltiples variables en formato .env
  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    const pastedText = e.clipboardData.getData("text");

    // Verificar si es contenido multilínea con formato KEY=VALUE
    const lines = pastedText
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    if (lines.length > 1 || (lines.length === 1 && lines[0].includes("="))) {
      e.preventDefault(); // Prevenir el paste normal

      const parsed: typeof newVars = [];
      for (const line of lines) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          parsed.push({
            key: key.trim().toUpperCase().replace(/\s/g, "_"),
            value: valueParts
              .join("=")
              .trim()
              .replace(/^["']|["']$/g, ""),
            note: "",
            sensitive:
              key.toLowerCase().includes("key") ||
              key.toLowerCase().includes("secret") ||
              key.toLowerCase().includes("password"),
          });
        }
      }

      if (parsed.length > 0) {
        // Reemplazar la fila actual y añadir las nuevas
        setNewVars((prev) => {
          const before = prev.slice(0, index);
          const after = prev.slice(index + 1);
          return [...before, ...parsed, ...after];
        });
        toast.success(`${parsed.length} variable(s) detectada(s) y añadida(s)`);
      }
    }
  };

  const handleSaveAll = async () => {
    const validVars = newVars.filter((v) => v.key.trim() && v.value.trim());
    if (validVars.length === 0) {
      toast.error("Debes completar al menos una variable");
      return;
    }

    let successCount = 0;
    for (const v of validVars) {
      const result = await upsertVariableAction({
        clave: v.key.toUpperCase().replace(/\s/g, "_"),
        valor: v.value,
        tipo: "string",
        descripcion: v.note || undefined,
        seccion: "api",
        activo: true,
      });

      if (result.data) {
        successCount++;
        setVariables((prev) => {
          const exists = prev.find((p) => p.clave === result.data.clave);
          if (exists) {
            return prev.map((p) =>
              p.clave === result.data.clave ? result.data : p
            );
          }
          return [result.data, ...prev];
        });
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} variable(s) guardada(s)`);
      setNewVars([{ key: "", value: "", note: "", sensitive: true }]);
    }
  };

  const handleImportEnv = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".env,.env.local,.env.example";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const lines = text
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"));

      const parsed: typeof newVars = [];
      for (const line of lines) {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          parsed.push({
            key: key.trim(),
            value: valueParts
              .join("=")
              .trim()
              .replace(/^["']|["']$/g, ""),
            note: "",
            sensitive:
              key.toLowerCase().includes("key") ||
              key.toLowerCase().includes("secret") ||
              key.toLowerCase().includes("password"),
          });
        }
      }

      if (parsed.length > 0) {
        setNewVars(parsed);
        toast.success(`${parsed.length} variables importadas`);
      } else {
        toast.error("No se encontraron variables válidas");
      }
    };
    input.click();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta variable?")) return;
    const result = await deleteVariableAction(id);
    if (result.success) {
      setVariables((prev) => prev.filter((v) => v.id !== id));
      toast.success("Variable eliminada");
    } else {
      toast.error(result.error || "Error al eliminar");
    }
  };

  const handleToggleActive = async (variable: VariableSistema) => {
    const result = await upsertVariableAction({
      clave: variable.clave,
      valor: variable.valor,
      tipo: variable.tipo,
      descripcion: variable.descripcion || undefined,
      seccion: variable.seccion || undefined,
      activo: !variable.activo,
    });

    if (result.data) {
      setVariables((prev) =>
        prev.map((v) => (v.id === variable.id ? result.data : v))
      );
      toast.success(
        `Variable ${result.data.activo ? "activada" : "desactivada"}`
      );
    }
  };

  const startEditing = (variable: VariableSistema) => {
    setEditingId(variable.id);
    setEditValue(variable.valor);
  };

  const saveEdit = async (variable: VariableSistema) => {
    const result = await upsertVariableAction({
      clave: variable.clave,
      valor: editValue,
      tipo: variable.tipo,
      descripcion: variable.descripcion || undefined,
      seccion: variable.seccion || undefined,
      activo: variable.activo,
    });

    if (result.data) {
      setVariables((prev) =>
        prev.map((v) => (v.id === variable.id ? result.data : v))
      );
      toast.success("Valor actualizado");
    }
    setEditingId(null);
  };

  const filteredVariables = variables.filter((v) =>
    v.clave.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Formulario de Entrada - Estilo Vercel */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="space-y-4">
          {newVars.map((v, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-start">
              {/* Key */}
              <div className="col-span-3">
                {index === 0 && (
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Key
                  </Label>
                )}
                <Input
                  placeholder="API_KEY..."
                  value={v.key}
                  onChange={(e) =>
                    updateNewVar(
                      index,
                      "key",
                      e.target.value.toUpperCase().replace(/\s/g, "_")
                    )
                  }
                  onPaste={(e) => handlePaste(e, index)}
                  className="font-mono text-sm h-10 bg-background"
                />
              </div>

              {/* Value */}
              <div className="col-span-4">
                {index === 0 && (
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Value
                  </Label>
                )}
                <Input
                  type={v.sensitive ? "password" : "text"}
                  placeholder="Valor..."
                  value={v.value}
                  onChange={(e) => updateNewVar(index, "value", e.target.value)}
                  className="font-mono text-sm h-10 bg-background"
                />
              </div>

              {/* Note */}
              <div className="col-span-3">
                {index === 0 && (
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Note
                  </Label>
                )}
                <Input
                  placeholder="Descripción..."
                  value={v.note}
                  onChange={(e) => updateNewVar(index, "note", e.target.value)}
                  className="text-sm h-10 bg-background"
                />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex flex-col">
                {index === 0 && (
                  <Label className="text-xs text-muted-foreground mb-1.5 block opacity-0">
                    Acc
                  </Label>
                )}
                <div className="flex items-center gap-2 h-10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      updateNewVar(index, "sensitive", !v.sensitive)
                    }
                    title={v.sensitive ? "Sensible (oculto)" : "Visible"}
                  >
                    {v.sensitive ? (
                      <IconEyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <IconEye className="size-4 text-muted-foreground" />
                    )}
                  </Button>
                  {newVars.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-red-500 hover:bg-red-50"
                      onClick={() => removeNewVarRow(index)}
                    >
                      <IconX className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewVarRow}
              className="gap-2 rounded-lg"
            >
              <IconPlus className="size-4" />
              Añadir Otra
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportEnv}
              className="gap-2 rounded-lg"
            >
              <IconUpload className="size-4" />
              Importar .env
            </Button>
            <span className="text-xs text-muted-foreground">
              o pega el contenido de .env arriba
            </span>
          </div>
          <Button onClick={handleSaveAll} className="rounded-lg px-6">
            Guardar
          </Button>
        </div>
      </div>

      {/* Lista de Variables */}
      <div className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex items-center gap-4">
          <InputGroup className="flex-1 max-w-md bg-background border-border">
            <InputGroupAddon>
              <IconSearch className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </InputGroup>
          <div className="text-xs text-muted-foreground">
            {filteredVariables.length} variable(s)
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-2">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No hay variables configuradas</p>
              <p className="text-xs mt-1">
                Añade tu primera variable arriba o importa desde un archivo .env
              </p>
            </div>
          ) : (
            filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className={cn(
                  "flex items-center justify-between p-4 bg-card border border-border rounded-xl transition-all",
                  !variable.activo && "opacity-50"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Clave */}
                  <div className="min-w-[200px]">
                    <div className="font-mono text-sm font-medium">
                      {variable.clave}
                    </div>
                    {variable.descripcion && (
                      <div className="text-xs text-muted-foreground truncate">
                        {variable.descripcion}
                      </div>
                    )}
                  </div>

                  {/* Valor */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {editingId === variable.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="font-mono text-sm h-8 flex-1"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => saveEdit(variable)}
                        >
                          <IconCheck className="size-4 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => setEditingId(null)}
                        >
                          <IconX className="size-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 shrink-0"
                          onClick={() => toggleValueVisibility(variable.id)}
                        >
                          {showValues[variable.id] ? (
                            <IconEyeOff className="size-3.5" />
                          ) : (
                            <IconEye className="size-3.5" />
                          )}
                        </Button>
                        <span className="font-mono text-sm text-muted-foreground truncate">
                          {showValues[variable.id]
                            ? variable.valor
                            : "••••••••••••••••"}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    Añadido{" "}
                    {format(new Date(variable.createdAt), "dd/MM/yy", {
                      locale: es,
                    })}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-3 ml-4">
                  <Switch
                    checked={variable.activo}
                    onCheckedChange={() => handleToggleActive(variable)}
                    className="data-[state=checked]:bg-green-500"
                  />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <IconDotsVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(variable)}>
                        <IconPencil className="size-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(variable.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <IconTrash className="size-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
