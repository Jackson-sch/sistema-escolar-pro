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
  IconUser,
  IconHash,
  IconQrcode as IconQrCode,
  IconLoader2,
  IconArrowLeft,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-0.5">
      {icon}
      {children}
    </Label>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel icon={icon}>{label}</FieldLabel>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BankAccountForm({
  cuenta,
  onClose,
  onSuccess,
  onDeleteSuccess,
}: BankAccountFormProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(cuenta));
  const [loading, setLoading] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const patch = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  // Sync dirty state
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
          toast.success(cuenta ? "Cuenta actualizada" : "Cuenta creada");
          setIsDirty(false);
          onSuccess(result.success);
        } else {
          toast.error(result.error);
        }
      } catch {
        toast.error("Error al guardar");
      } finally {
        setLoading(false);
      }
    },
    [form, cuenta, onSuccess, setIsDirty],
  );

  const handleDelete = useCallback(async () => {
    if (!cuenta?.id || !confirm("¿Estás seguro de eliminar esta cuenta?"))
      return;
    const result = await deleteBankAccountAction({ id: cuenta.id });
    if (result.success) {
      toast.success("Cuenta eliminada");
      onDeleteSuccess?.();
    } else {
      toast.error(result.error);
    }
  }, [cuenta, onDeleteSuccess]);

  // Register submit handler in modal context
  useEffect(() => {
    setOnSubmit(() => handleSubmit());
    return () => setOnSubmit(undefined);
  }, [handleSubmit, setOnSubmit]);

  const isBanco = form.tipo === "BANCO";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="px-8 py-8 border-b border-border/10 bg-linear-to-b from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90 hover:scale-105"
            >
              <IconArrowLeft size={22} strokeWidth={2.5} />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black tracking-tight text-foreground/90">
                  {cuenta
                    ? "Configuración de Cuenta"
                    : "Nueva Entidad Bancaria"}
                </h2>
                {cuenta && (
                  <Badge className="text-[10px] font-black px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 shadow-sm shadow-primary/5">
                    Modo Edición
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground/70 font-medium mt-1">
                {cuenta
                  ? `Gestionando los detalles de conexión para ${cuenta.nombre}`
                  : "Registra una nueva cuenta para habilitar pagos automáticos."}
              </p>
            </div>
          </div>

          {cuenta && (
            <Button
              type="button"
              size="icon"
              onClick={handleDelete}
              className="shrink-0 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <IconTrash size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-7 custom-scrollbar"
      >
        {/* Type toggle */}
        <div className="space-y-2">
          <FieldLabel>Tipo de Medio de Pago</FieldLabel>
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/30 rounded-2xl border border-border/20">
            {(["BANCO", "BILLETERA_DIGITAL"] as TipoCuenta[]).map((tipo) => {
              const active = form.tipo === tipo;
              const isWallet = tipo === "BILLETERA_DIGITAL";
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => patch("tipo", tipo)}
                  className={`flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-full transition-all ${
                    active
                      ? isWallet
                        ? "bg-background text-emerald-500 shadow-lg border border-emerald-500/10"
                        : "bg-background text-primary shadow-lg border border-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                >
                  {isWallet ? (
                    <IconDeviceMobile size={16} />
                  ) : (
                    <IconBuildingBank size={16} />
                  )}
                  {isWallet ? "Billetera Digital" : "Banco Registrado"}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left column ── */}
          <div className="space-y-5">
            <Field label="Entidad Financiera">
              <Input
                value={form.nombre}
                onChange={(e) => patch("nombre", e.target.value)}
                placeholder="Ej: BCP, BBVA, Yape, Plin..."
                className="rounded-full border-border/20 bg-muted/20 font-bold px-5 focus-visible:ring-primary/20 focus-visible:bg-muted/30 transition-all"
                required
              />
            </Field>
          </div>

          <div className="space-y-5">
            <Field
              label="Nombre del Titular"
              icon={<IconUser size={13} className="text-primary/60" />}
            >
              <Input
                value={form.titular || ""}
                onChange={(e) => patch("titular", e.target.value)}
                placeholder="Nombre completo del titular"
                className="rounded-full border-border/20 bg-muted/20 font-bold px-5 focus-visible:ring-primary/20 focus-visible:bg-muted/30 transition-all"
                required
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Field
              label={isBanco ? "Número de Cuenta" : "Número de Celular"}
              icon={<IconHash size={13} className="text-primary/60" />}
            >
              <Input
                value={form.numero}
                onChange={(e) => patch("numero", e.target.value)}
                placeholder={isBanco ? "000-0000000-0-00" : "999 999 999"}
                className="rounded-full border-border/20 bg-muted/20 font-mono font-bold px-5 focus-visible:ring-primary/20 focus-visible:bg-muted/30 transition-all"
                required
              />
            </Field>
          </div>

          <div className="space-y-5">
            {isBanco ? (
              <Field label="CCI (Código Interbancario)">
                <Input
                  value={form.cci || ""}
                  onChange={(e) => patch("cci", e.target.value)}
                  placeholder="Opcional: 000-000-000000000000-00"
                  className="rounded-full border-border/20 bg-muted/20 font-mono font-bold px-5 focus-visible:ring-primary/20 focus-visible:bg-muted/30 transition-all"
                />
              </Field>
            ) : (
              <div className="space-y-4 p-6 rounded-[2rem] border bg-emerald-500/5 border-emerald-500/10 shadow-inner">
                <Label className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 flex items-center gap-2 mb-1">
                  <IconQrCode size={16} /> Código QR de Recaudación
                </Label>
                  <ImageUpload
                    value={form.qrCode || ""}
                    onChange={(url) => patch("qrCode", url)}
                    onRemove={() => patch("qrCode", "")}
                    className="w-full"
                  />
                <p className="text-[9px] text-center text-emerald-600/50 font-black uppercase tracking-widest leading-relaxed mt-2">
                  Los padres verán este QR al reportar sus pagos por billetera.
                </p>
              </div>
            )}
          </div>
        </div>

        {isBanco && (
          <div className="grid grid-cols-1 gap-6">
            <Field label="Tipo de Cuenta / Descripción">
              <Input
                value={form.tipoCuenta || ""}
                onChange={(e) => patch("tipoCuenta", e.target.value)}
                placeholder="Ej: Cuenta Corriente Soles, Ahorros Institución..."
                className="rounded-full border-border/20 bg-muted/20 font-bold px-5 focus-visible:ring-primary/20 focus-visible:bg-muted/30 transition-all"
              />
            </Field>
          </div>
        )}

        {/* Switches row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="flex items-center justify-between px-5 py-4 bg-primary/5 rounded-full border border-primary/10">
            <div className="space-y-0.5">
              <Label className="text-sm font-black">Cuenta Principal</Label>
              <p className="text-[11px] text-muted-foreground font-medium">
                Se mostrará como opción destacada en el portal.
              </p>
            </div>
            <Switch
              checked={form.esPrincipal}
              onCheckedChange={(v) => patch("esPrincipal", v)}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-start gap-3 px-5 py-4 bg-blue-500/5 rounded-full border border-blue-500/10">
            <div className="p-2.5 bg-blue-500/10 rounded-full text-blue-600 shrink-0">
              <IconBuildingBank size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                Datos Protegidos
              </p>
              <p className="text-[11px] text-blue-600/70 font-medium leading-snug mt-0.5">
                Información encriptada AES-256, visible solo para personal
                autorizado.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="pt-8 pb-4 px-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto rounded-full px-8 border-border/40 hover:bg-accent/50 transition-all hover:scale-[1.02] active:scale-95"
          >
            Descartar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-full px-12 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all bg-primary hover:bg-primary/90"
          >
            {loading && <IconLoader2 className="mr-3 size-5 animate-spin" />}
            {cuenta ? "Actualizar Cuenta" : "Guardar Entidad"}
          </Button>
        </div>
      </form>
    </div>
  );
}
