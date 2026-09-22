"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { searchStudentsAction } from "@/actions/students";
import { getStudentCobroDetailsAction } from "@/actions/finance/cronograma";
import { registrarCobroRapidoPOSAction } from "@/actions/finance/pagos";
import { toast } from "sonner";
import { formatDate } from "@/lib/formats";
import { printComprobanteTicket } from "@/components/finanzas/cronogramas/print-comprobante-ticket";
import { StudentCobroData } from "./pos-types";

export function useCajaRapidaPOS(initialStudentId?: string | null) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    initialStudentId || null,
  );

  const [studentData, setStudentData] = useState<StudentCobroData | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Estados de cobro
  const [selectedCronogramaIds, setSelectedCronogramaIds] = useState<string[]>(
    [],
  );
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [numeroBoleta, setNumeroBoleta] = useState("");
  const [montoEfectivoRecibido, setMontoEfectivoRecibido] =
    useState<string>("");
  const [observaciones, setObservaciones] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal de comprobante emitido
  const [comprobanteEmitido, setComprobanteEmitido] = useState<any | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Búsqueda en vivo de estudiantes
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStudentsAction(searchQuery);
        setSearchResults(res.data || []);
      } catch (err) {
        console.error("Error buscando estudiante:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Cargar detalles de cobranza del alumno seleccionado
  const loadStudentCobroDetails = useCallback(async (studentId: string) => {
    setIsLoadingDetails(true);
    setSelectedCronogramaIds([]);
    try {
      const res = await getStudentCobroDetailsAction({
        estudianteId: studentId,
      });
      if (res.success && res.success.student) {
        setStudentData(res.success as unknown as StudentCobroData);
        setNumeroBoleta(res.success.nextNumeroBoleta);

        const cuotasPendientes = res.success.cronogramas.filter(
          (c: any) => c.estado !== "PAID",
        );
        if (cuotasPendientes.length > 0) {
          setSelectedCronogramaIds([cuotasPendientes[0].id]);
        }
      } else {
        toast.error(res.error || "No se pudo cargar la información del alumno");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al obtener datos de cobranza");
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (initialStudentId) {
      loadStudentCobroDetails(initialStudentId);
    }
  }, [initialStudentId, loadStudentCobroDetails]);

  const handleSelectStudent = (student: any) => {
    setSelectedStudentId(student.id);
    setSearchQuery(`${student.name} ${student.apellidoPaterno || ""}`.trim());
    setSearchResults([]);
    loadStudentCobroDetails(student.id);
  };

  const toggleCronogramaSelection = (id: string) => {
    setSelectedCronogramaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAllExpired = () => {
    if (!studentData) return;
    const expiredIds: string[] = [];
    for (const c of studentData.cronogramas) {
      if (c.estado === "EXPIRED" || c.estado === "PARTIALLY_PAID") {
        expiredIds.push(c.id);
      }
    }
    setSelectedCronogramaIds(expiredIds);
  };

  const cuotasSeleccionadas = useMemo(() => {
    if (!studentData) return [];
    const idSet = new Set(selectedCronogramaIds);
    return studentData.cronogramas.filter((c) => idSet.has(c.id));
  }, [studentData, selectedCronogramaIds]);

  const totalCobrar = useMemo(() => {
    return cuotasSeleccionadas.reduce((sum, c) => sum + c.saldoPendiente, 0);
  }, [cuotasSeleccionadas]);

  const montoRecibidoNum = parseFloat(montoEfectivoRecibido) || 0;
  const vuelto =
    montoRecibidoNum > totalCobrar ? montoRecibidoNum - totalCobrar : 0;

  const handleProcesarCobro = async () => {
    if (!studentData || cuotasSeleccionadas.length === 0) {
      toast.error("Seleccione al menos una cuota para cobrar.");
      return;
    }

    if (
      metodoPago === "Efectivo" &&
      montoRecibidoNum > 0 &&
      montoRecibidoNum < totalCobrar
    ) {
      toast.error(
        `El monto recibido (S/ ${montoRecibidoNum.toFixed(2)}) es menor al total a cobrar (S/ ${totalCobrar.toFixed(2)})`,
      );
      return;
    }

    setIsProcessing(true);
    try {
      const items = cuotasSeleccionadas.map((c) => ({
        cronogramaId: c.id,
        monto: c.saldoPendiente,
      }));

      const res = await registrarCobroRapidoPOSAction({
        estudianteId: studentData.student.id,
        items,
        metodoPago,
        referenciaPago: numeroOperacion || undefined,
        numeroBoleta: numeroBoleta || undefined,
        montoRecibido:
          metodoPago === "Efectivo" && montoRecibidoNum > 0
            ? montoRecibidoNum
            : totalCobrar,
        observaciones: observaciones || undefined,
      });

      if (res.success && res.data) {
        toast.success(res.success);
        setComprobanteEmitido(res.data);
        setShowSuccessModal(true);
        loadStudentCobroDetails(studentData.student.id);
      } else {
        toast.error(res.error || "No se pudo registrar el cobro.");
      }
    } catch (err: any) {
      console.error("Error procesando cobro:", err);
      toast.error(err.message || "Error al procesar la transacción.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprimirTicket = () => {
    if (!comprobanteEmitido) return;
    printComprobanteTicket({
      pago: {
        numeroBoleta: comprobanteEmitido.numeroBoleta,
        fechaPago: comprobanteEmitido.fechaPago,
        monto: comprobanteEmitido.totalCobrado,
        metodoPago: comprobanteEmitido.metodoPago,
        referenciaPago: comprobanteEmitido.referenciaPago,
        montoRecibido: comprobanteEmitido.montoRecibido,
        vuelto: comprobanteEmitido.vuelto,
        items: comprobanteEmitido.items,
        observaciones: observaciones || undefined,
      },
      estudiante: {
        name: comprobanteEmitido.estudiante.name,
        apellidoPaterno: comprobanteEmitido.estudiante.apellidoPaterno,
        apellidoMaterno: comprobanteEmitido.estudiante.apellidoMaterno,
        codigoEstudiante:
          comprobanteEmitido.estudiante.codigoEstudiante || undefined,
        dni: comprobanteEmitido.estudiante.dni || undefined,
        nivelAcademico: comprobanteEmitido.estudiante.nivelAcademico,
      },
      institucion: {
        nombre:
          comprobanteEmitido.institucion?.nombre || "SISTEMA ESCOLAR PRO",
        direccion: comprobanteEmitido.institucion?.direccion,
        telefono: comprobanteEmitido.institucion?.telefono,
        ruc: comprobanteEmitido.institucion?.codigoModular,
      },
    });
  };

  const handleWhatsAppReceipt = () => {
    if (!comprobanteEmitido?.primaryGuardian?.telefono) {
      toast.error("El apoderado no tiene número de teléfono registrado.");
      return;
    }
    const cleanPhone = comprobanteEmitido.primaryGuardian.telefono.replace(
      /\D/g,
      "",
    );
    const fullPhone =
      cleanPhone.length === 9 ? `51${cleanPhone}` : cleanPhone;
    const studentName = `${comprobanteEmitido.estudiante.name} ${comprobanteEmitido.estudiante.apellidoPaterno}`;
    const msg = encodeURIComponent(
      `*COMPROBANTE DE PAGO ESCOLAR*\n` +
        `Estimado(a) ${comprobanteEmitido.primaryGuardian.name || "Apoderado"}, confirmamos la recepción conforme de su pago:\n\n` +
        `📄 *Comprobante:* ${comprobanteEmitido.numeroBoleta}\n` +
        `👤 *Estudiante:* ${studentName}\n` +
        `💰 *Monto Pagado:* S/ ${comprobanteEmitido.totalCobrado.toFixed(2)}\n` +
        `💳 *Método:* ${comprobanteEmitido.metodoPago}\n` +
        `📅 *Fecha:* ${formatDate(comprobanteEmitido.fechaPago)}\n\n` +
        `¡Muchas gracias por su puntualidad!`,
    );
    window.open(`https://wa.me/${fullPhone}?text=${msg}`, "_blank");
  };

  const resetPOS = () => {
    setShowSuccessModal(false);
    setComprobanteEmitido(null);
    setSelectedStudentId(null);
    setStudentData(null);
    setSearchQuery("");
    setMontoEfectivoRecibido("");
    setNumeroOperacion("");
    setObservaciones("");
  };

  return {
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
  };
}
