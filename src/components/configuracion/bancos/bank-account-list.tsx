"use client";

import { useState } from "react";
import {
  IconPlus,
  IconBuildingBank,
  IconDeviceMobile,
  IconCheck,
  IconStar,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormModalProvider } from "@/components/modals/form-modal-context";
import { BankAccountForm } from "./bank-account-form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const [editingCuenta, setEditingCuenta] = useState<any>(null);
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
      setCuentas(cuentas.filter((c) => c.id !== editingCuenta.id));
      setEditingCuenta(null);
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-220px)] lg:min-h-[600px] overflow-hidden relative bg-card/80 border border-border/40 rounded-2xl p-4 shadow-xl">
      {/* Master: Sidebar List */}
      <div
        className={cn(
          "w-full lg:w-[380px] flex flex-col gap-4 h-full overflow-hidden transition-[width,height] shrink-0",
          showForm && "hidden lg:flex",
        )}
      >
        <div className="flex items-center gap-2">
          {/* Search UI */}
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
            <Input
              placeholder="Buscar por banco, titular o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
            />
          </div>

          {/* Nueva Entidad Button */}
          <Button
            size="sm"
            onClick={handleCreateNew}
            className="rounded-xl px-3.5 h-9 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 shrink-0 gap-1.5 cursor-pointer"
          >
            <IconPlus className="size-4" />
            <span>Nueva Cuenta</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Bancos Section */}
          {bancos.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Cuentas Bancarias ({bancos.length})
              </span>
              <div className="space-y-2">
                {bancos.map((cuenta) => (
                  <button
                    key={cuenta.id}
                    onClick={() => handleSelect(cuenta)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-[background-color,border-color,box-shadow] relative flex items-center justify-between group cursor-pointer bg-background/50",
                      editingCuenta?.id === cuenta.id
                        ? "border-indigo-500/60 bg-indigo-500/10 shadow-xs ring-1 ring-indigo-500/30"
                        : "border-border/40 hover:border-indigo-500/30 hover:bg-background/80",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0 border",
                          editingCuenta?.id === cuenta.id
                            ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                            : "bg-muted/30 border-border/30 text-muted-foreground group-hover:text-indigo-500",
                        )}
                      >
                        <IconBuildingBank className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-foreground truncate">
                            {cuenta.nombre}
                          </p>
                          {cuenta.esPrincipal && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1 py-0 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                              <IconStar className="size-3 fill-amber-500 text-amber-500" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                          {cuenta.numero}
                        </p>
                      </div>
                    </div>

                    {editingCuenta?.id === cuenta.id ? (
                      <div className="size-5 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0">
                        <IconCheck className="size-3" strokeWidth={3} />
                      </div>
                    ) : (
                      <IconChevronRight className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Billeteras Section */}
          {billeteras.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Billeteras Digitales ({billeteras.length})
              </span>
              <div className="space-y-2">
                {billeteras.map((cuenta) => (
                  <button
                    key={cuenta.id}
                    onClick={() => handleSelect(cuenta)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-[background-color,border-color,box-shadow] relative flex items-center justify-between group cursor-pointer bg-background/50",
                      editingCuenta?.id === cuenta.id
                        ? "border-emerald-500/60 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/30"
                        : "border-border/40 hover:border-emerald-500/30 hover:bg-background/80",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "size-10 rounded-xl flex items-center justify-center transition-colors shrink-0 border",
                          editingCuenta?.id === cuenta.id
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted/30 border-border/30 text-muted-foreground group-hover:text-emerald-500",
                        )}
                      >
                        <IconDeviceMobile className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-foreground truncate">
                            {cuenta.nombre}
                          </p>
                          {cuenta.esPrincipal && (
                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[9px] px-1 py-0 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                              <IconStar className="size-3 fill-amber-500 text-amber-500" />
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground truncate mt-0.5">
                          {cuenta.numero}
                        </p>
                      </div>
                    </div>

                    {editingCuenta?.id === cuenta.id ? (
                      <div className="size-5 bg-emerald-600 rounded-full flex items-center justify-center text-white shrink-0">
                        <IconCheck className="size-3" strokeWidth={3} />
                      </div>
                    ) : (
                      <IconChevronRight className="size-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cuentas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border/40 rounded-2xl bg-background/40 text-muted-foreground/60 space-y-2">
              <IconBuildingBank className="size-10 text-muted-foreground/30" />
              <p className="text-xs font-semibold text-foreground">No hay cuentas bancarias registradas</p>
              <p className="text-[11px]">Agrega cuentas o billeteras para recibir cobros en línea.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail: Form Area */}
      <div
        className={cn(
          "flex-1 min-w-0 h-full overflow-hidden border border-border/40 rounded-2xl bg-background/40 shadow-inner transition-[width,height]",
          !showForm && "hidden lg:block",
        )}
      >
        {showForm ? (
          <BankAccountForm
            key={editingCuenta?.id || "new"}
            cuenta={editingCuenta}
            onClose={() => setShowForm(false)}
            onSuccess={handleSuccess}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="size-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <IconBuildingBank className="size-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Gestión de Cuentas y Recaudación
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Selecciona una entidad de la lista para modificar sus datos o haz clic en <strong>&quot;Nueva Cuenta&quot;</strong> para habilitar canales de cobro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
