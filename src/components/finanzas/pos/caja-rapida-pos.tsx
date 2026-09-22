"use client";

import { useEffect, useSyncExternalStore } from "react";
import { IconLoader2, IconUserSearch } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { createPortal } from "react-dom";
import { ComprobanteTicketHtml } from "@/components/finanzas/cronogramas/comprobante-ticket-html";
import { POSSearchBar } from "./components/pos-search-bar";
import { POSStudentHeader } from "./components/pos-student-header";
import { useSearchParams } from "next/navigation";
import { POSCuotasTable } from "./components/pos-cuotas-table";
import { POSPaymentPanel } from "./components/pos-payment-panel";
import { POSSuccessModal } from "./components/pos-success-modal";
import { useCajaRapidaPOS } from "./components/use-caja-rapida-pos";

const emptySubscribe = () => () => {};

export function CajaRapidaPOS() {
  const searchParams = useSearchParams();
  const initialStudentId = searchParams?.get("estudianteId");

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    selectedStudentId,
    studentData,
    isLoadingDetails,
    selectedCronogramaIds,
    metodoPago,
    setMetodoPago,
    numeroOperacion,
    setNumeroOperacion,
    numeroBoleta,
    montoEfectivoRecibido,
    setMontoEfectivoRecibido,
    observaciones,
    isProcessing,
    comprobanteEmitido,
    showSuccessModal,
    setShowSuccessModal,
    cuotasSeleccionadas,
    totalCobrar,
    vuelto,
    handleSelectStudent,
    toggleCronogramaSelection,
    handleSelectAllExpired,
    handleProcesarCobro,
    handleImprimirTicket,
    handleWhatsAppReceipt,
    resetPOS,
  } = useCajaRapidaPOS(initialStudentId);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Atajo de teclado: Ctrl + Enter para cobrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "Enter" &&
        !isProcessing &&
        cuotasSeleccionadas.length > 0
      ) {
        e.preventDefault();
        handleProcesarCobro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleProcesarCobro, isProcessing, cuotasSeleccionadas.length]);

  const printTicketCss = `@media print {
    body > * { display: none !important; }
    #print-pos-ticket-root {
      display: block !important;
      position: absolute;
      left: 0;
      top: 0;
      width: 80mm;
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #000000 !important;
    }
    @page {
      size: 80mm auto;
      margin: 0;
    }
  }`;

  return (
    <div className="space-y-6">
      {/* ── 1. BARRA DE BÚSQUEDA INSTANTÁNEA ── */}
      <POSSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        selectedStudentId={selectedStudentId}
        onSelectStudent={handleSelectStudent}
        onReset={resetPOS}
      />

      {isLoadingDetails && (
        <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
          <IconLoader2 className="size-6 animate-spin text-primary" />
          <span className="text-sm font-semibold">
            Cargando expediente de cobranza...
          </span>
        </div>
      )}

      {/* ── 2. PANEL PRINCIPAL DE COBRO ── */}
      {studentData && !isLoadingDetails && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMNA IZQUIERDA: Ficha del Alumno + Matriz de Cuotas */}
          <div className="lg:col-span-7 space-y-4">
            <POSStudentHeader studentData={studentData} />
            <POSCuotasTable
              studentData={studentData}
              selectedCronogramaIds={selectedCronogramaIds}
              onToggleCronograma={toggleCronogramaSelection}
              onSelectAllExpired={handleSelectAllExpired}
            />
          </div>

          {/* COLUMNA DERECHA: Liquidación, Métodos de Pago y Cobro */}
          <div className="lg:col-span-5 space-y-4">
            <POSPaymentPanel
              numeroBoleta={numeroBoleta}
              cuotasSeleccionadas={cuotasSeleccionadas}
              totalCobrar={totalCobrar}
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
              montoEfectivoRecibido={montoEfectivoRecibido}
              setMontoEfectivoRecibido={setMontoEfectivoRecibido}
              vuelto={vuelto}
              numeroOperacion={numeroOperacion}
              setNumeroOperacion={setNumeroOperacion}
              isProcessing={isProcessing}
              onProcesarCobro={handleProcesarCobro}
            />
          </div>
        </div>
      )}

      {/* Estado Vacío Inicial */}
      {!studentData && !isLoadingDetails && (
        <Card className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconUserSearch className="size-7" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">
            Caja Rápida Lista para Operar
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
            Ingresa el DNI o nombre del alumno en la barra superior para
            consultar sus cuotas y registrar el cobro en segundos.
          </p>
        </Card>
      )}

      {/* ── 3. MODAL DE ÉXITO DE COBRO & COMPROBANTE ── */}
      <POSSuccessModal
        showSuccessModal={showSuccessModal}
        setShowSuccessModal={setShowSuccessModal}
        comprobanteEmitido={comprobanteEmitido}
        onImprimirTicket={handleImprimirTicket}
        onWhatsAppReceipt={handleWhatsAppReceipt}
        onResetPOS={resetPOS}
      />

      {/* ── 4. ESTILOS DE IMPRESIÓN Y PORTAL DE TICKET TÉRMICO 80MM ── */}
      <style dangerouslySetInnerHTML={{ __html: printTicketCss }} />

      {mounted &&
        comprobanteEmitido &&
        createPortal(
          <div id="print-pos-ticket-root" className="hidden">
            <ComprobanteTicketHtml
              pago={{
                numeroBoleta: comprobanteEmitido.numeroBoleta,
                fechaPago: comprobanteEmitido.fechaPago,
                monto: comprobanteEmitido.totalCobrado,
                metodoPago: comprobanteEmitido.metodoPago,
                referenciaPago: comprobanteEmitido.referenciaPago,
                montoRecibido: comprobanteEmitido.montoRecibido,
                vuelto: comprobanteEmitido.vuelto,
                items: comprobanteEmitido.items,
                observaciones: observaciones || undefined,
              }}
              estudiante={{
                name: comprobanteEmitido.estudiante.name,
                apellidoPaterno: comprobanteEmitido.estudiante.apellidoPaterno,
                apellidoMaterno: comprobanteEmitido.estudiante.apellidoMaterno,
                codigoEstudiante:
                  comprobanteEmitido.estudiante.codigoEstudiante || undefined,
                dni: comprobanteEmitido.estudiante.dni || undefined,
                nivelAcademico: comprobanteEmitido.estudiante.nivelAcademico,
              }}
              institucion={{
                nombre:
                  comprobanteEmitido.institucion?.nombre ||
                  "SISTEMA ESCOLAR PRO",
                direccion: comprobanteEmitido.institucion?.direccion,
                telefono: comprobanteEmitido.institucion?.telefono,
                ruc: comprobanteEmitido.institucion?.codigoModular,
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
