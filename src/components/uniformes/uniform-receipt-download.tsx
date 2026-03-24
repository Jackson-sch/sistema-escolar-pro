"use client";

import { useEffect, useState } from "react";
import { ReceiptDownloadButton } from "@/components/finanzas/cronogramas/receipt-download-button";
import { getSystemSettingsAction } from "@/actions/settings";

interface UniformReceiptDownloadProps {
  venta: any;
}

export function UniformReceiptDownload({ venta }: UniformReceiptDownloadProps) {
  const [institucion, setInstitucion] = useState({
    nombre: "Institución Educativa",
    direccion: "",
    telefono: "",
    ruc: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      const res = await getSystemSettingsAction([
        "NOMBRE_INSTITUCION",
        "DIRECCION_INSTITUCION",
        "TELEFONO_INSTITUCION",
        "RUC_INSTITUCION",
      ]);

      if (res.data) {
        setInstitucion({
          nombre: res.data["NOMBRE_INSTITUCION"] || "Institución Educativa",
          direccion: res.data["DIRECCION_INSTITUCION"] || "",
          telefono: res.data["TELEFONO_INSTITUCION"] || "",
          ruc: res.data["RUC_INSTITUCION"] || "",
        });
      }
    };

    loadSettings();
  }, []);

  if (!venta) return null;

  // Mapear datos de la venta al formato que espera el recibo
  const paymentData = {
    numeroBoleta: venta.codigo,
    fechaPago: venta.aprobadoEn || venta.updatedAt || new Date(),
    monto: venta.total,
    metodoPago: "Venta de Uniforme",
    concepto: `Compra de Uniformes - ${venta.codigo}`,
    observaciones: `Sede de recojo: ${venta.sede?.nombre || "No especificada"}`,
  };

  const estudiante = {
    name: venta.estudiante.name,
    apellidoPaterno: venta.estudiante.apellidoPaterno,
    apellidoMaterno: venta.estudiante.apellidoMaterno || "",
    codigoEstudiante: venta.estudiante.codigoEstudiante,
    nivelAcademico: venta.estudiante.nivelAcademico,
  };

  // El componente ComprobantePDF espera una lista de detalles si quisiéramos ser más específicos,
  // pero el ReceiptDownloadButton estándar usa un solo concepto.
  // Para uniformes, el concepto ya resume la compra.

  return (
    <div className="flex-1">
      <ReceiptDownloadButton
        paymentData={paymentData}
        estudiante={estudiante}
        institucion={institucion}
        formato="A4"
      />
    </div>
  );
}
