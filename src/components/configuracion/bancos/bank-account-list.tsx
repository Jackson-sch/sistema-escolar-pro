"use client";

import { useState } from "react";
import {
  IconPlus,
  IconBuildingBank,
  IconDeviceMobile,
  IconCheck,
  IconStarFilled,
  IconSearch,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { FormModalProvider } from "@/components/modals/form-modal-context";
import { BankAccountForm } from "./bank-account-form";
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
  const [editingCuenta, setEditingCuenta] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCuentas = cuentas.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titular.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    // Persist focus or reset? Let's keep the form open with the updated data
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
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-16rem)] min-h-[600px] overflow-hidden relative bg-card border border-border/50 rounded-2xl py-4 px-2">
      {/* Master: Sidebar List */}
      <div
        className={cn(
          "w-full lg:w-[400px] flex flex-col gap-6 h-full overflow-hidden transition-all duration-300",
          showForm && "hidden lg:flex",
        )}
      >
        <div className="flex items-center gap-2">
          {/* Search UI */}
          <InputGroup className="w-full rounded-full bg-card/40 backdrop-blur-md border border-border shadow-sm transition-all focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5">
            <InputGroupInput
              placeholder="Buscar por nombre, titular o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none font-medium placeholder:text-muted-foreground/50"
            />
            <InputGroupAddon className="text-muted-foreground/40">
              <IconSearch size={18} strokeWidth={2.5} />
            </InputGroupAddon>
            <InputGroupAddon
              align="inline-end"
              className="text-[9px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 px-3 rounded-full mr-1"
            >
              {filteredCuentas.length}
            </InputGroupAddon>
          </InputGroup>

          {/* Nueva Entidad Button (Top Position) */}
          <Button
            size="sm"
            onClick={handleCreateNew}
            className="rounded-full gap-2 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
          >
            <IconPlus className="w-5 h-5" strokeWidth={2.5} />
            Agregar
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8">
          {/* Bancos Section */}
          {bancos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold capitalize text-muted-foreground px-4">
                Bancos Registrados
              </h3>
              <div className="space-y-2">
                {bancos.map((cuenta) => (
                  <button
                    key={cuenta.id}
                    onClick={() => handleSelect(cuenta)}
                    className={`w-full text-left p-4 rounded-full border transition-all duration-500 relative flex items-center justify-between group overflow-hidden ${
                      editingCuenta?.id === cuenta.id
                        ? "bg-primary/5 border-primary/30 shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)] ring-1 ring-primary/30"
                        : "bg-background/50 border-border hover:border-primary/20 hover:bg-white/5"
                    }`}
                  >
                    {/* Glow effect for selected item */}
                    {editingCuenta?.id === cuenta.id && (
                      <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`size-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                          editingCuenta?.id === cuenta.id
                            ? "bg-primary text-white scale-110 rotate-3"
                            : "bg-primary/5 text-primary group-hover:bg-primary/10 group-hover:scale-105"
                        }`}
                      >
                        <IconBuildingBank size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm tracking-tight leading-none">
                            {cuenta.nombre}
                          </p>
                          {cuenta.esPrincipal && (
                            <IconStarFilled
                              size={10}
                              className="text-amber-500"
                            />
                          )}
                        </div>
                        <p className="font-mono text-[10px] font-bold text-muted-foreground mt-1 tracking-tighter">
                          {cuenta.numero}
                        </p>
                      </div>
                    </div>
                    {editingCuenta?.id === cuenta.id && (
                      <div className="size-6 bg-primary rounded-full flex items-center justify-center text-white scale-110 shadow-lg shadow-primary/20">
                        <IconCheck size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Billeteras Section */}
          {billeteras.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold capitalize text-muted-foreground px-4">
                Billeteras Digitales
              </h3>
              <div className="space-y-2">
                {billeteras.map((cuenta) => (
                  <button
                    key={cuenta.id}
                    onClick={() => handleSelect(cuenta)}
                    className={`w-full text-left p-4 rounded-full border transition-all duration-500 relative flex items-center justify-between group overflow-hidden ${
                      editingCuenta?.id === cuenta.id
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30"
                        : "bg-background/50 border-border hover:border-emerald-500/20 hover:bg-white/5"
                    }`}
                  >
                    {/* Glow effect for selected item */}
                    {editingCuenta?.id === cuenta.id && (
                      <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`size-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                          editingCuenta?.id === cuenta.id
                            ? "bg-emerald-500 text-white scale-110 -rotate-3"
                            : "bg-emerald-500/5 text-emerald-600 group-hover:bg-emerald-500/10 group-hover:scale-105"
                        }`}
                      >
                        <IconDeviceMobile size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-sm tracking-tight leading-none">
                            {cuenta.nombre}
                          </p>
                          {cuenta.esPrincipal && (
                            <IconStarFilled
                              size={10}
                              className="text-amber-500"
                            />
                          )}
                        </div>
                        <p className="font-mono text-[10px] font-bold text-muted-foreground mt-1 tracking-tighter">
                          {cuenta.numero}
                        </p>
                      </div>
                    </div>
                    {editingCuenta?.id === cuenta.id && (
                      <div className="size-6 bg-emerald-500 rounded-full flex items-center justify-center text-white scale-110 shadow-lg shadow-emerald-500/20">
                        <IconCheck size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {cuentas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] bg-muted/5 opacity-60">
              <div className="size-16 bg-muted/20 rounded-[2rem] flex items-center justify-center text-muted-foreground/30 mb-4">
                <IconBuildingBank size={32} />
              </div>
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                No hay entidades
                <br />
                registradas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail: Form Area */}
      <div
        className={cn(
          "flex-1 min-w-0 h-full overflow-hidden border border-border/10 rounded-[2.5rem] bg-card/10 transition-all duration-300",
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
          <div className="h-full flex flex-col items-center justify-center bg-card/20 rounded-[3rem] border border-dashed border-border/40 p-12 text-center group">
            <div className="relative mb-8">
              <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
              <div className="relative size-32 bg-card border border-border/40 rounded-[3rem] flex items-center justify-center text-muted-foreground/20 shadow-2xl group-hover:text-primary/40 transition-all group-hover:scale-105 group-hover:-rotate-3">
                <IconBuildingBank size={64} strokeWidth={1} />
              </div>
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-3">
              Gestión de Cuentas
            </h3>
            <p className="text-muted-foreground max-w-xs font-medium leading-relaxed">
              Selecciona una cuenta de la lista para ver sus detalles o presiona
              el botón para registrar una nueva.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
