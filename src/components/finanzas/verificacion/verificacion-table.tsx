"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  aprobarComprobanteAction,
  rechazarComprobanteAction,
} from "@/actions/comprobantes";
import { useRouter } from "next/navigation";
import { VerificacionCard } from "./verificacion-card";
import { VerificacionEmptyState } from "./verificacion-empty-state";
import { VerificacionDialogs } from "./verificacion-dialogs";

interface Comprobante {
  id: string;
  archivoUrl: string;
  monto: number;
  bancoOrigen: string | null;
  numeroOperacion: string | null;
  fechaOperacion: string;
  estado: string;
  createdAt: string;
  cronograma: {
    concepto: { nombre: string };
    estudiante: {
      name: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
  padre: {
    name: string;
    email: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
}

interface VerificacionTableProps {
  comprobantes: Comprobante[];
}

export function VerificacionTable({ comprobantes }: VerificacionTableProps) {
  const router = useRouter();
  const [selectedComprobante, setSelectedComprobante] =
    useState<Comprobante | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAprobar = async (id: string) => {
    setLoadingId(id);
    try {
      const result = await aprobarComprobanteAction({ id });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Comprobante aprobado exitosamente");
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
        setSelectedComprobante(null);
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
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">
          Registros Pendientes ({comprobantes.length})
        </h2>
      </div>

      <div className="grid gap-6">
        {comprobantes.map((comprobante) => (
          <VerificacionCard
            key={comprobante.id}
            comprobante={comprobante}
            loading={loadingId === comprobante.id}
            onAprobar={handleAprobar}
            onVer={setSelectedComprobante}
            onRechazar={(c) => {
              setSelectedComprobante(c);
              setShowRejectDialog(true);
            }}
          />
        ))}
      </div>

      <VerificacionDialogs
        selectedComprobante={selectedComprobante}
        showRejectDialog={showRejectDialog}
        onClosePreview={() => setSelectedComprobante(null)}
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
