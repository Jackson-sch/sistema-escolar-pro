"use client";

import * as React from "react";
import {
  IconPlus,
  IconUpload,
  IconEye,
  IconEyeOff,
  IconX,
  IconDeviceFloppy,
  IconKey,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertVariableAction } from "@/actions/variables";
import { VariableSistema } from "./types";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { useFormShortcuts } from "@/hooks/use-form-shortcuts";
import { Card } from "@/components/ui/card";

interface VariableFormProps {
  onVariableSaved: (variable: VariableSistema) => void;
}

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
        toast.success(`${parsed.length} variable(s) detectada(s) y procesada(s)`);
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
      toast.success(`${successCount} variable(s) guardada(s) correctamente`);
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
        toast.success(`${parsed.length} variables importadas desde archivo .env`);
      } else {
        toast.error("No se encontraron variables válidas en el archivo");
      }
    };
    input.click();
  };

  return (
    <Card className="bg-card/80 border-border/40 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-border/30 pb-3">
        <div className="flex items-center gap-2">
          <IconKey className="size-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-foreground">Registro de Variables del Sistema</h3>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">
          Soporta pegado directo de archivos .env
        </span>
      </div>

      <div className="space-y-3">
        {newVars.map((v, index) => (
          <div
            key={v.key}
            className="grid grid-cols-12 gap-2.5 items-end bg-background/40 p-3 rounded-xl border border-border/30"
          >
            {/* Key */}
            <div className="col-span-12 sm:col-span-4">
              <Label className="text-xs font-medium text-foreground/80 mb-1 block">
                Nombre de la Clave (Key)
              </Label>
              <Input
                placeholder="Ej. API_KEY_SERVICIO"
                value={v.key}
                onChange={(e) =>
                  updateNewVar(
                    index,
                    "key",
                    e.target.value.toUpperCase().replace(/\s/g, "_"),
                  )
                }
                onPaste={(e) => handlePaste(e, index)}
                className="font-mono text-xs bg-background border-border/40 rounded-xl h-9"
              />
            </div>

            {/* Value */}
            <div className="col-span-12 sm:col-span-4">
              <Label className="text-xs font-medium text-foreground/80 mb-1 block">
                Valor (Value)
              </Label>
              <Input
                type={v.sensitive ? "password" : "text"}
                placeholder="Ej. sk_live_99218..."
                value={v.value}
                onChange={(e) => updateNewVar(index, "value", e.target.value)}
                className="font-mono text-xs bg-background border-border/40 rounded-xl h-9"
              />
            </div>

            {/* Note */}
            <div className="col-span-10 sm:col-span-3">
              <Label className="text-xs font-medium text-foreground/80 mb-1 block">
                Descripción / Nota
              </Label>
              <Input
                placeholder="Opcional..."
                value={v.note}
                onChange={(e) => updateNewVar(index, "note", e.target.value)}
                className="text-xs bg-background border-border/40 rounded-xl h-9"
              />
            </div>

            {/* Actions */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1 pb-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => updateNewVar(index, "sensitive", !v.sensitive)}
                title={v.sensitive ? "Valor oculto" : "Valor visible"}
              >
                {v.sensitive ? (
                  <IconEyeOff className="size-4" />
                ) : (
                  <IconEye className="size-4" />
                )}
              </Button>
              {newVars.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  onClick={() => removeNewVarRow(index)}
                  title="Eliminar fila"
                >
                  <IconX className="size-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Guía de Atajos de Teclado */}
      <FormKeyboardHelpBar />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewVarRow}
            className="flex-1 sm:flex-none rounded-xl h-9 px-3.5 text-xs font-semibold border-border/40 gap-1.5 cursor-pointer"
          >
            <IconPlus className="size-4" />
            <span>Añadir Fila</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImportEnv}
            className="flex-1 sm:flex-none rounded-xl h-9 px-3.5 text-xs font-semibold border-border/40 gap-1.5 cursor-pointer"
          >
            <IconUpload className="size-4" />
            <span>Importar .env</span>
          </Button>
        </div>

        <Button
          type="button"
          onClick={handleSaveAll}
          className="w-full sm:w-auto rounded-xl px-6 h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
        >
          <IconDeviceFloppy className="size-4" />
          <span>Guardar Variables</span>
        </Button>
      </div>
    </Card>
  );
}
