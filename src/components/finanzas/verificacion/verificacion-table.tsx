"use client";
import { useState, useMemo } from "react";
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
import { IconSearch, IconX } from "@tabler/icons-react";
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

  const handleAprobar = async (id: string) => {
    setLoadingId(id);
    try {
      const result = await aprobarComprobanteAction({ id });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Comprobante aprobado exitosamente");
        // Seleccionar el siguiente si existe
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
  };

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
        // Seleccionar el siguiente
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

  if (comprobantes.length === 0) {
    return <VerificacionEmptyState />;
  }

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden rounded-[1rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-sm">
      {/* Sidebar List (Aside) */}
      <aside
        className={cn(
          "w-full sm:max-w-sm shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20",
          showMobileDetail ? "hidden sm:flex" : "flex",
        )}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold">Pendientes</h2>
            <Badge className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] sm:text-xs font-bold tracking-wide">
              {comprobantes.length} Pendientes
            </Badge>
          </div>
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
            <Input
              className="w-full rounded-full border-zinc-200 dark:border-zinc-800 pl-10 text-sm focus:ring-primary focus:border-primary border h-10"
              placeholder="Buscar por alumno o concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-6 space-y-3">
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
            <div className="p-8 text-center">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Sin resultados
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Detail View (Section) */}
      <section
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b] relative",
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
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="size-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-300">
              <IconSearch className="size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                Selecciona un registro
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Elige un comprobante de la lista lateral para visualizar sus
                detalles y validarlo.
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
