"use client";

import { useState } from "react";
import {
  IconPlus,
  IconBuildingBank,
  IconSearch,
  IconStar,
  IconQrcode,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FormModalProvider } from "@/components/modals/form-modal-context";
import { BankAccountForm } from "./bank-account-form";
import { BankAccountCard } from "./bank-account-card";
import { BankCardVisual } from "./components/bank-card-visual";
import { cn } from "@/lib/utils";

interface BankAccountListProps {
  initialData: any[];
}

export function BankAccountList({ initialData }: BankAccountListProps) {
  return (
    <FormModalProvider>
      <BankAccountListContent initialData={initialData} />
    </FormModalProvider>
  );
}

function BankAccountListContent({ initialData }: BankAccountListProps) {
  const [cuentas, setCuentas] = useState(initialData);
  const [editingCuenta, setEditingCuenta] = useState<any>(
    () => initialData.find((c) => c.esPrincipal) || initialData[0] || null,
  );
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCuentas = cuentas.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numero.includes(searchTerm),
  );

  const bancos = filteredCuentas.filter((c) => c.tipo === "BANCO");
  const billeteras = filteredCuentas.filter(
    (c) => c.tipo === "BILLETERA_DIGITAL",
  );
  const cuentaPrincipal = cuentas.find((c) => c.esPrincipal);

  const handleSelect = (cuenta: any) => {
    setEditingCuenta(cuenta);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingCuenta(null);
    setShowForm(true);
  };

  const handleSuccess = (newCuenta: any) => {
    if (editingCuenta) {
      setCuentas(cuentas.map((c) => (c.id === newCuenta.id ? newCuenta : c)));
    } else {
      setCuentas([newCuenta, ...cuentas]);
    }

    if (newCuenta.esPrincipal) {
      setCuentas((prev) =>
        prev.map((c) =>
          c.id === newCuenta.id ? c : { ...c, esPrincipal: false },
        ),
      );
    }

    setEditingCuenta(newCuenta);
  };

  const handleDeleteSuccess = () => {
    if (editingCuenta) {
      const remaining = cuentas.filter((c) => c.id !== editingCuenta.id);
      setCuentas(remaining);
      setEditingCuenta(remaining[0] || null);
      setShowForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de KPIs Resumen de Recaudación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Canales de Cobro
            </span>
            <div className="text-xl font-mono font-black text-foreground">
              {cuentas.length}
            </div>
          </div>
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <IconBuildingBank className="size-4.5" />
          </div>
        </Card>

        <Card className="p-3.5 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-0.5 min-w-0 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Canal Predeterminado
            </span>
            <div className="text-xs font-bold text-foreground truncate">
              {cuentaPrincipal ? cuentaPrincipal.nombre : "Sin configurar"}
            </div>
          </div>
          <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
            <IconStar className="size-4.5 fill-amber-500 text-amber-500" />
          </div>
        </Card>

        <Card className="p-3.5 rounded-2xl border border-border/60 bg-card shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Billeteras Móviles QR
            </span>
            <div className="text-xl font-mono font-black text-foreground">
              {cuentas.filter((c) => c.tipo === "BILLETERA_DIGITAL").length}
            </div>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <IconQrcode className="size-4.5" />
          </div>
        </Card>
      </div>

      {/* Contenedor Master-Detail */}
      <div className="flex flex-col lg:flex-row gap-5 h-auto lg:h-[calc(100vh-250px)] lg:min-h-[580px] overflow-hidden relative bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
        {/* Master: Sidebar List */}
        <div
          className={cn(
            "w-full lg:w-[380px] flex flex-col gap-3.5 h-full overflow-hidden transition-all shrink-0",
            showForm && "hidden lg:flex",
          )}
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-2.5 text-muted-foreground size-4" />
              <Input
                placeholder="Buscar por banco, titular o cuenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border/60 rounded-xl text-xs h-9"
              />
            </div>

            <Button
              size="sm"
              onClick={handleCreateNew}
              className="rounded-xl px-3.5 h-9 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs shrink-0 gap-1.5 cursor-pointer"
            >
              <IconPlus className="size-4" />
              <span>Nuevo</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {bancos.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">
                  Cuentas Bancarias ({bancos.length})
                </span>
                <div className="space-y-2">
                  {bancos.map((cuenta) => (
                    <BankAccountCard
                      key={cuenta.id}
                      cuenta={cuenta}
                      isSelected={editingCuenta?.id === cuenta.id}
                      onSelect={() => handleSelect(cuenta)}
                    />
                  ))}
                </div>
              </div>
            )}

            {billeteras.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">
                  Billeteras Digitales ({billeteras.length})
                </span>
                <div className="space-y-2">
                  {billeteras.map((cuenta) => (
                    <BankAccountCard
                      key={cuenta.id}
                      cuenta={cuenta}
                      isSelected={editingCuenta?.id === cuenta.id}
                      onSelect={() => handleSelect(cuenta)}
                    />
                  ))}
                </div>
              </div>
            )}

            {cuentas.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/60 rounded-2xl bg-muted/20 text-muted-foreground space-y-2">
                <IconBuildingBank className="size-9 text-muted-foreground/40" />
                <p className="text-xs font-bold text-foreground">
                  Sin cuentas registradas
                </p>
                <p className="text-[11px]">
                  Agrega cuentas bancarias o códigos QR para recibir pagos.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail: Form / Visual Area */}
        <div
          className={cn(
            "flex-1 min-w-0 h-full overflow-hidden border border-border/60 rounded-2xl bg-muted/10 shadow-2xs transition-all",
            !showForm && "hidden lg:block",
          )}
        >
          {showForm || editingCuenta ? (
            <BankAccountForm
              key={editingCuenta?.id || "new"}
              cuenta={editingCuenta}
              onClose={() => setShowForm(false)}
              onSuccess={handleSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <IconShieldCheck className="size-8" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Gestión Segura de Recaudación
                </h3>
                <p className="text-xs text-muted-foreground">
                  Selecciona una entidad de la lista para editarla o crea una nueva cuenta bancaria para habilitar pagos online.
                </p>
              </div>
              <Button
                onClick={handleCreateNew}
                className="rounded-xl px-5 h-9 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer shadow-xs"
              >
                <IconPlus className="size-4" />
                <span>Registrar Primer Canal</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
