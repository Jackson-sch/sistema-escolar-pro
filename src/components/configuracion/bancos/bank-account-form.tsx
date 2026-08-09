"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { toast } from "sonner";
import {
  saveBankAccountAction,
  deleteBankAccountAction,
} from "@/actions/bancos";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconQrcode as IconQrCode,
  IconLoader2,
  IconArrowLeft,
  IconTrash,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { ConfirmModal } from "@/components/modals/confirm-modal";

type TipoCuenta = "BANCO" | "BILLETERA_DIGITAL";

interface CuentaBancaria {
  id?: string;
  nombre?: string;
  tipo?: TipoCuenta;
  numero?: string;
  cci?: string | null;
  titular?: string | null;
  tipoCuenta?: string | null;
  qrCode?: string | null;
  esPrincipal?: boolean;
  activo?: boolean;
}

interface BankAccountFormProps {
  cuenta?: CuentaBancaria;
  onClose: () => void;
  onSuccess: (cuenta: CuentaBancaria) => void;
  onDeleteSuccess?: () => void;
}

type FormState = Required<Omit<CuentaBancaria, "activo">> & { activo: boolean };

function buildInitialForm(cuenta?: CuentaBancaria): FormState {
  return {
    id: cuenta?.id ?? "",
    nombre: cuenta?.nombre ?? "",
    tipo: cuenta?.tipo ?? "BANCO",
    numero: cuenta?.numero ?? "",
    cci: cuenta?.cci ?? "",
    titular: cuenta?.titular ?? "",
    tipoCuenta: cuenta?.tipoCuenta ?? "Cuenta Corriente",
    qrCode: cuenta?.qrCode ?? "",
    esPrincipal: cuenta?.esPrincipal ?? false,
    activo: cuenta?.activo ?? true,
  };
}

function isFormDirty(form: FormState, cuenta?: CuentaBancaria): boolean {
  const initial = buildInitialForm(cuenta);
  return (Object.keys(initial) as (keyof FormState)[]).some(
    (k) => form[k] !== initial[k],
  );
}

export function BankAccountForm({
  cuenta,
  onClose,
  onSuccess,
  onDeleteSuccess,
}: BankAccountFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(cuenta));
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const patch = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  useEffect(() => {
    setIsDirty(isFormDirty(form, cuenta));
  }, [form, cuenta, setIsDirty]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setLoading(true);
      try {
        const result = await saveBankAccountAction(form as any);
        if (result.success) {
          toast.success(cuenta ? "Cuenta actualizada correctamente" : "Cuenta creada correctamente");
          setIsDirty(false);
          onSuccess(result.success);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Error al guardar la cuenta");
      } finally {
        setLoading(false);
      }
    },
    [form, cuenta, onSuccess, setIsDirty],
  );

  const handleDelete = useCallback(async () => {
    if (!cuenta?.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteBankAccountAction({ id: cuenta.id });
      if (result.success) {
        toast.success("Cuenta eliminada correctamente");
        onDeleteSuccess?.();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  }, [cuenta, onDeleteSuccess]);

  useEffect(() => {
    setOnSubmit(() => handleSubmit());
    return () => setOnSubmit(undefined);
  }, [handleSubmit, setOnSubmit]);

  const isBanco = form.tipo === "BANCO";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="p-4 border-b border-border/30 bg-background/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden shrink-0 rounded-xl size-8"
            >
              <IconArrowLeft className="size-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground truncate">
                  {cuenta
                    ? `Editar: ${cuenta.nombre}`
                    : "Nueva Entidad Bancaria"}
                </h2>
                {cuenta && (
                  <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-indigo-500/10 text-indigo-600 border-none">
                    Modo Edición
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Configure el número de cuenta, titular y código QR de cobros.
              </p>
            </div>
          </div>

          {cuenta && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 rounded-xl size-8 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              title="Eliminar cuenta"
            >
              <IconTrash className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Form Body ─────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Selector de Tipo */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground/80">Canal de Cobro</Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-background/50 rounded-xl border border-border/40">
            {(["BANCO", "BILLETERA_DIGITAL"] as TipoCuenta[]).map((tipo) => {
              const active = form.tipo === tipo;
              const isWallet = tipo === "BILLETERA_DIGITAL";
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    if (form.tipo !== tipo) {
                      setForm((prev) => ({
                        ...prev,
                        tipo,
                        numero: "",
                        cci: tipo === "BILLETERA_DIGITAL" ? "" : prev.cci,
                        qrCode: tipo === "BANCO" ? "" : prev.qrCode,
                      }));
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-[color] cursor-pointer ${
                    active
                      ? isWallet
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isWallet ? (
                    <IconDeviceMobile className="size-4" />
                  ) : (
                    <IconBuildingBank className="size-4" />
                  )}
                  <span>{isWallet ? "Billetera Digital" : "Cuenta Bancaria"}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Campos - Condicional por tipo */}
        {isBanco ? (
          /* Formulario para Cuenta Bancaria */
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Nombre de la Entidad</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => patch("nombre", e.target.value)}
                  placeholder="Ej: BCP, BBVA, Interbank"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Titular de la Cuenta</Label>
                <Input
                  value={form.titular || ""}
                  onChange={(e) => patch("titular", e.target.value)}
                  placeholder="Nombre completo o Razón Social"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Número de Cuenta</Label>
                <Input
                  value={form.numero}
                  onChange={(e) => patch("numero", e.target.value)}
                  placeholder="193-4589201-0-12"
                  className="bg-background border-border/40 rounded-xl text-xs font-mono h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Código Interbancario (CCI)</Label>
                <Input
                  value={form.cci || ""}
                  onChange={(e) => patch("cci", e.target.value)}
                  placeholder="002-193-004589201012-14"
                  className="bg-background border-border/40 rounded-xl text-xs font-mono h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground/80">Tipo de Cuenta / Descripción</Label>
              <Input
                value={form.tipoCuenta || ""}
                onChange={(e) => patch("tipoCuenta", e.target.value)}
                placeholder="Ej: Cuenta Corriente Soles - Recaudación"
                className="bg-background border-border/40 rounded-xl text-xs h-9"
              />
            </div>
          </div>
        ) : (
          /* Formulario para Billetera Digital (Izquierda: Campos | Derecha: Código QR) */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Lado Izquierdo: Campos de Billetera Digital */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Billetera / Entidad</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => patch("nombre", e.target.value)}
                  placeholder="Ej: Yape, Plin, Tunki"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Titular de la Billetera</Label>
                <Input
                  value={form.titular || ""}
                  onChange={(e) => patch("titular", e.target.value)}
                  placeholder="Nombre completo del titular"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground/80">Número de Celular</Label>
                <Input
                  value={form.numero}
                  onChange={(e) => patch("numero", e.target.value)}
                  placeholder="987 654 321"
                  className="bg-background border-border/40 rounded-xl text-xs font-mono h-9"
                  required
                />
              </div>
            </div>

            {/* Lado Derecho: Imagen del Código QR */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground/80 flex items-center gap-1">
                <IconQrCode className="size-3.5 text-emerald-500" /> Código QR de Recaudación
              </Label>
              <div className="p-2.5 rounded-xl bg-background/50 border border-border/40 flex flex-col items-center justify-center">
                <ImageUpload
                  value={form.qrCode || ""}
                  onChange={(url) => patch("qrCode", url)}
                  onRemove={() => patch("qrCode", "")}
                  className="w-full h-44"
                />
              </div>
            </div>
          </div>
        )}

        {/* Switch Principal */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background/50">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold cursor-pointer">Destacar como Cuenta Principal</Label>
            <p className="text-[11px] text-muted-foreground">
              Aparecerá en primer lugar en el portal de padres.
            </p>
          </div>
          <Switch
            checked={form.esPrincipal}
            onCheckedChange={(v) => patch("esPrincipal", v)}
          />
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[170px]"
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{cuenta ? "Actualizar Cuenta" : "Guardar Cuenta"}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Confirm modal delete */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Eliminar Cuenta Bancaria"
        description={`¿Estás seguro de que deseas eliminar la cuenta de "${form.nombre}"? esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
