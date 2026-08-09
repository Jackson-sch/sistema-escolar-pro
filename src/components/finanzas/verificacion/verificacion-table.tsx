"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  aprobarComprobanteAction,
  rechazarComprobanteAction,
} from "@/actions/comprobantes";
import { useRouter } from "next/navigation";
import { VerificacionCard } from "./verificacion-card";
import { VerificacionEmptyState } from "./verificacion-empty-state";
import { VerificacionDialogs } from "./verificacion-dialogs";
import { VerificacionDetail } from "./verificacion-detail";
import { Input } from "@/components/ui/input";
import { IconSearch, IconX, IconChecklist } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Comprobante } from "./types";

interface VerificacionTableProps {
  comprobantes: Comprobante[];
}

export function VerificacionTable({ comprobantes }: VerificacionTableProps) {
  const router = useRouter();
  const [selectedComprobante, setSelectedComprobante] =
    useState<Comprobante | null>(comprobantes[0] || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const filteredComprobantes = useMemo(() => {
    return comprobantes.filter((c) => {
      const searchStr =
        `${c.cronograma.estudiante.name} ${c.cronograma.estudiante.apellidoPaterno} ${c.cronograma.concepto.nombre}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [comprobantes, searchTerm]);

  const handleAprobar = useCallback(async (id: string) => {
    setLoadingId(id);
    try {
      const result = await aprobarComprobanteAction({ id });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Comprobante aprobado exitosamente");
        const currentIndex = filteredComprobantes.findIndex((c) => c.id === id);
        if (filteredComprobantes[currentIndex + 1]) {
          setSelectedComprobante(filteredComprobantes[currentIndex + 1]);
        } else if (filteredComprobantes[currentIndex - 1]) {
          setSelectedComprobante(filteredComprobantes[currentIndex - 1]);
        } else {
          setSelectedComprobante(null);
        }
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  }, [filteredComprobantes, router]);

  const handleRechazar = async () => {
    if (!selectedComprobante || !motivoRechazo.trim()) {
      toast.error("Debes indicar el motivo del rechazo");
      return;
    }

    setLoadingId(selectedComprobante.id);
    try {
      const result = await rechazarComprobanteAction({
        id: selectedComprobante.id,
        motivo: motivoRechazo,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Comprobante rechazado correctamente");
        setShowRejectDialog(false);
        setMotivoRechazo("");
        const id = selectedComprobante.id;
        const currentIndex = filteredComprobantes.findIndex((c) => c.id === id);
        if (filteredComprobantes[currentIndex + 1]) {
          setSelectedComprobante(filteredComprobantes[currentIndex + 1]);
        } else {
          setSelectedComprobante(null);
        }
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleAprobarRef = useRef(handleAprobar);
  useEffect(() => {
    handleAprobarRef.current = handleAprobar;
  });

  // Atajos de Teclado Productivos para Auditoría de Vouchers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (showRejectDialog || loadingId || !selectedComprobante) return;

      const currentIndex = filteredComprobantes.findIndex((c) => c.id === selectedComprobante.id);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentIndex < filteredComprobantes.length - 1) {
          setSelectedComprobante(filteredComprobantes[currentIndex + 1]);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentIndex > 0) {
          setSelectedComprobante(filteredComprobantes[currentIndex - 1]);
        }
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleAprobarRef.current(selectedComprobante.id);
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        setShowRejectDialog(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedComprobante, filteredComprobantes, showRejectDialog, loadingId]);

  if (comprobantes.length === 0) {
    return <VerificacionEmptyState />;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] overflow-hidden rounded-2xl border border-border/40 bg-background shadow-xl">
      {/* Sidebar de Lista de Comprobantes */}
      <aside
        className={cn(
          "w-full sm:max-w-xs md:max-w-sm shrink-0 border-r border-border/30 flex flex-col bg-muted/10",
          showMobileDetail ? "hidden sm:flex" : "flex",
        )}
      >
        <div className="p-4 space-y-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <IconChecklist className="size-4 text-indigo-500" />
              Por Verificar
            </h2>
            <Badge className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
              {comprobantes.length} Pendientes
            </Badge>
          </div>
          <div className="relative">
            <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
            <Input
              className="w-full rounded-xl border-border/40 pl-9 text-xs bg-background h-9"
              placeholder="Buscar por alumno o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredComprobantes.map((comprobante) => (
            <VerificacionCard
              key={comprobante.id}
              comprobante={comprobante}
              isActive={selectedComprobante?.id === comprobante.id}
              onClick={() => {
                setSelectedComprobante(comprobante);
                setShowMobileDetail(true);
              }}
            />
          ))}
          {filteredComprobantes.length === 0 && (
            <div className="p-8 text-center space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sin resultados
              </p>
              <p className="text-[11px] text-muted-foreground/70">
                No hay comprobantes que coincidan con la búsqueda.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Vista Detallada Principal */}
      <section
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar bg-background relative",
          !showMobileDetail ? "hidden sm:block" : "block",
        )}
      >
        {selectedComprobante ? (
          <VerificacionDetail
            comprobante={selectedComprobante}
            loading={loadingId === selectedComprobante.id}
            onAprobar={handleAprobar}
            onRechazar={(c) => {
              setSelectedComprobante(c);
              setShowRejectDialog(true);
            }}
            motivoRechazo={motivoRechazo}
            setMotivoRechazo={setMotivoRechazo}
            onBack={() => setShowMobileDetail(false)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
            <div className="size-16 rounded-2xl bg-muted/20 flex items-center justify-center text-muted-foreground">
              <IconSearch className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Selecciona un comprobante
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Elige un registro de la lista lateral para auditar la imagen del voucher y validar los datos.
              </p>
            </div>
          </div>
        )}
      </section>

      <VerificacionDialogs
        showRejectDialog={showRejectDialog}
        onCloseReject={() => {
          setShowRejectDialog(false);
          setMotivoRechazo("");
        }}
        onConfirmReject={handleRechazar}
        motivoRechazo={motivoRechazo}
        setMotivoRechazo={setMotivoRechazo}
        loading={!!loadingId && showRejectDialog}
      />
    </div>
  );
}
