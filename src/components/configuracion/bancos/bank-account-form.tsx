"use client";

import { useState, useEffect, useCallback } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  saveBankAccountAction,
  deleteBankAccountAction,
} from "@/actions/bancos";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconLoader2,
  IconArrowLeft,
  IconTrash,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { BankCardVisual } from "./components/bank-card-visual";
import { BankAccountBankFields } from "./components/bank-account-bank-fields";
import { BankAccountWalletFields } from "./components/bank-account-wallet-fields";

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
    tipoCuenta: cuenta?.tipoCuenta ?? "Cuenta Corriente Soles",
    qrCode: cuenta?.qrCode ?? "",
    esPrincipal: cuenta?.esPrincipal ?? false,
    activo: cuenta?.activo ?? true,
  };
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

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setLoading(true);
      try {
        const result = await saveBankAccountAction(form as any);
        if (result.success) {
          toast.success(
            cuenta
              ? "Cuenta actualizada correctamente"
              : "Cuenta registrada exitosamente",
          );
          setIsDirty(false);
          onSuccess(result.success);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Error al procesar la cuenta");
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
    <div className="flex flex-col h-full overflow-hidden bg-card">
      {/* Header */}
      <div className="p-4 px-6 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Volver atrás"
            className="lg:hidden shrink-0 rounded-xl size-8"
          >
            <IconArrowLeft className="size-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground truncate">
                {cuenta ? `Editar: ${cuenta.nombre}` : "Nueva Entidad de Cobro"}
              </h3>
              {cuenta && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-primary/10 text-primary border-primary/20"
                >
                  Modo Edición
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              Parámetros de recaudación y acreditación para padres de familia.
            </p>
          </div>
        </div>

        {cuenta && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 rounded-xl size-8 text-destructive hover:bg-destructive/10 cursor-pointer"
            title="Eliminar cuenta"
          >
            <IconTrash className="size-4" />
          </Button>
        )}
      </div>

      {/* Body del Formulario con Live Card Preview */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-5 space-y-5"
      >
        {/* Live Card Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Vista Previa en Tiempo Real (App Padres)
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/80">
              Interactivo
            </span>
          </div>
          <BankCardVisual
            nombre={form.nombre}
            tipo={form.tipo}
            numero={form.numero}
            cci={form.cci}
            titular={form.titular}
            tipoCuenta={form.tipoCuenta}
            qrCode={form.qrCode}
            esPrincipal={form.esPrincipal}
          />
        </div>

        {/* Selector de Canal: Banco vs Billetera */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-foreground">
            Tipo de Canal de Cobro
          </Label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-xl border border-border/60">
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
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    active
                      ? isWallet
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isWallet ? (
                    <IconDeviceMobile className="size-4" />
                  ) : (
                    <IconBuildingBank className="size-4" />
                  )}
                  <span>
                    {isWallet ? "Billetera Digital" : "Cuenta Bancaria"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campos Específicos */}
        {isBanco ? (
          <BankAccountBankFields
            nombre={form.nombre}
            titular={form.titular || ""}
            numero={form.numero}
            cci={form.cci || ""}
            tipoCuenta={form.tipoCuenta || ""}
            onPatch={patch}
          />
        ) : (
          <BankAccountWalletFields
            nombre={form.nombre}
            titular={form.titular || ""}
            numero={form.numero}
            qrCode={form.qrCode || ""}
            onPatch={patch}
          />
        )}

        {/* Switch Cuenta Principal */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/10">
          <div className="space-y-0.5">
            <Label className="text-xs font-bold cursor-pointer text-foreground">
              Establecer como Canal Principal de Pago
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Aparecerá en primer lugar en el portal y las boletas de pensiones.
            </p>
          </div>
          <Switch
            checked={form.esPrincipal}
            onCheckedChange={(v) => patch("esPrincipal", v)}
          />
        </div>

        <FormKeyboardHelpBar />

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-5 h-9 font-bold text-xs border-border/60"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 h-9 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs gap-2 min-w-[170px] cursor-pointer"
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{cuenta ? "Actualizar Datos" : "Guardar Cuenta"}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Eliminar Entidad Bancaria"
        description={`¿Estás seguro de que deseas eliminar "${form.nombre}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />
    </div>
  );
}
