"use client";

import * as React from "react";
import {
  IconPlus,
  IconUpload,
  IconEye,
  IconEyeOff,
  IconX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertVariableAction } from "@/actions/variables";
import { VariableSistema } from "./types";

import { useFormShortcuts } from "@/hooks/use-form-shortcuts";

interface VariableFormProps {
  onVariableSaved: (variable: VariableSistema) => void;
}

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

export function VariableForm({ onVariableSaved }: VariableFormProps) {
  const [newVars, setNewVars] = React.useState<
    Array<{
      key: string;
      value: string;
      note: string;
      sensitive: boolean;
    }>
  >([{ key: "", value: "", note: "", sensitive: true }]);

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
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    const pastedText = e.clipboardData.getData("text");
    const lines = pastedText
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"));

    if (lines.length > 1 || (lines.length === 1 && lines[0].includes("="))) {
      e.preventDefault();

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
        onVariableSaved(result.data);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} variable(s) guardada(s)`);
      setNewVars([{ key: "", value: "", note: "", sensitive: true }]);
    }
  };

  useFormShortcuts({
    onSubmit: handleSaveAll,
    isLoading: false,
  });

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

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="space-y-6 sm:space-y-4">
        {newVars.map((v, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 sm:grid sm:grid-cols-12 sm:gap-3 items-start"
          >
            {/* Key */}
            <div className="w-full sm:col-span-3">
              <Label
                className={cn(
                  "text-xs text-muted-foreground mb-1.5 block",
                  index !== 0 && "sm:hidden",
                )}
              >
                Key
              </Label>
              <Input
                placeholder="API_KEY..."
                value={v.key}
                onChange={(e) =>
                  updateNewVar(
                    index,
                    "key",
                    e.target.value.toUpperCase().replace(/\s/g, "_"),
                  )
                }
                onPaste={(e) => handlePaste(e, index)}
                className="font-mono text-sm rounded-full bg-background w-full"
              />
            </div>

            {/* Value */}
            <div className="w-full sm:col-span-4">
              <Label
                className={cn(
                  "text-xs text-muted-foreground mb-1.5 block",
                  index !== 0 && "sm:hidden",
                )}
              >
                Value
              </Label>
              <Input
                type={v.sensitive ? "password" : "text"}
                placeholder="Valor..."
                value={v.value}
                onChange={(e) => updateNewVar(index, "value", e.target.value)}
                className="font-mono text-sm rounded-full bg-background w-full"
              />
            </div>

            {/* Note */}
            <div className="w-full sm:col-span-3">
              <Label
                className={cn(
                  "text-xs text-muted-foreground mb-1.5 block",
                  index !== 0 && "sm:hidden",
                )}
              >
                Note
              </Label>
              <Input
                placeholder="Descripción..."
                value={v.note}
                onChange={(e) => updateNewVar(index, "note", e.target.value)}
                className="text-sm rounded-full bg-background w-full"
              />
            </div>

            {/* Actions */}
            <div className="w-full sm:col-span-2 flex flex-col">
              <Label
                className={cn(
                  "text-xs text-muted-foreground mb-1.5 block",
                  index === 0 ? "opacity-0 sm:opacity-100 sm:block" : "hidden",
                )}
              >
                Acc
              </Label>
              <div className="flex items-center justify-end sm:justify-start gap-2 h-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full hover:bg-white/10"
                  onClick={() => updateNewVar(index, "sensitive", !v.sensitive)}
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
                    className="size-8 text-red-500 hover:bg-red-500/10 rounded-full"
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewVarRow}
            className="flex-1 sm:flex-none gap-2 rounded-full border-border/40"
          >
            <IconPlus className="size-4" />
            Añadir Otra
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportEnv}
            className="flex-1 sm:flex-none gap-2 rounded-full border-border/40"
          >
            <IconUpload className="size-4" />
            Importar .env
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-left order-2 sm:order-1">
            o pega el contenido de .env arriba
          </span>
          <Button
            onClick={handleSaveAll}
            className="w-full sm:w-auto rounded-full gap-2 shadow-lg shadow-primary/20 order-1 sm:order-2"
            size="sm"
          >
            <IconDeviceFloppy className="size-4" />
            Guardar Todo
          </Button>
        </div>
      </div>
    </div>
  );
}
